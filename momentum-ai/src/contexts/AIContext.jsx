import React, { createContext, useContext, useReducer, useCallback } from 'react';
import useAIService from '../hooks/useAIService';
import { toast } from 'sonner';

// Initial state
const initialState = {
  isGenerating: false,
  currentRequestId: null,
  generationProgress: 0,
  error: null,
  history: [],
  activeTool: null,
  modelSettings: {
    model: 'pro', // 'pro' or 'flash'
    temperature: 0.7,
    maxTokens: 2048,
  },
  aiConfigError: null, // AI provider configuration error
};

// Action types
const AI_ACTIONS = {
  START_GENERATION: 'START_GENERATION',
  UPDATE_GENERATION: 'UPDATE_GENERATION',
  COMPLETE_GENERATION: 'COMPLETE_GENERATION',
  ERROR: 'ERROR',
  SET_ACTIVE_TOOL: 'SET_ACTIVE_TOOL',
  UPDATE_MODEL_SETTINGS: 'UPDATE_MODEL_SETTINGS',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  SET_AI_CONFIG_ERROR: 'SET_AI_CONFIG_ERROR',
  CLEAR_AI_CONFIG_ERROR: 'CLEAR_AI_CONFIG_ERROR',
};

// Reducer function
function aiReducer(state, action) {
  switch (action.type) {
    case AI_ACTIONS.START_GENERATION:
      return {
        ...state,
        isGenerating: true,
        currentRequestId: action.payload.requestId,
        generationProgress: 0,
        error: null,
      };
      
    case AI_ACTIONS.UPDATE_GENERATION:
      return {
        ...state,
        generationProgress: action.payload.progress,
      };
      
    case AI_ACTIONS.COMPLETE_GENERATION:
      return {
        ...state,
        isGenerating: false,
        currentRequestId: null,
        generationProgress: 100,
        history: [
          {
            id: action.payload.requestId,
            prompt: action.payload.prompt,
            response: action.payload.response,
            timestamp: new Date().toISOString(),
            tool: state.activeTool,
            modelSettings: { ...state.modelSettings },
          },
          ...state.history.slice(0, 49), // Keep last 50 items
        ],
      };
      
    case AI_ACTIONS.ERROR:
      return {
        ...state,
        isGenerating: false,
        currentRequestId: null,
        error: action.payload.error,
      };
      
    case AI_ACTIONS.SET_ACTIVE_TOOL:
      return {
        ...state,
        activeTool: action.payload.tool,
      };
      
    case AI_ACTIONS.UPDATE_MODEL_SETTINGS:
      return {
        ...state,
        modelSettings: {
          ...state.modelSettings,
          ...action.payload.settings,
        },
      };
      
    case AI_ACTIONS.CLEAR_HISTORY:
      return {
        ...state,
        history: [],
      };
      
    case AI_ACTIONS.SET_AI_CONFIG_ERROR:
      return {
        ...state,
        aiConfigError: action.payload.error,
      };
      
    case AI_ACTIONS.CLEAR_AI_CONFIG_ERROR:
      return {
        ...state,
        aiConfigError: null,
      };
      
    default:
      return state;
  }
}

// Create context
const AIContext = createContext();

// Provider component
export const AIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  const aiService = useAIService();

  // Generate content with the current model settings
  const generateContent = useCallback(async (prompt, options = {}) => {
    const requestId = Date.now().toString();
    
    dispatch({
      type: AI_ACTIONS.START_GENERATION,
      payload: { requestId },
    });
    
    try {
      const response = await aiService.generateAIResponse(prompt, {
        ...state.modelSettings,
        ...options,
      });
      
      dispatch({
        type: AI_ACTIONS.COMPLETE_GENERATION,
        payload: {
          requestId,
          prompt,
          response,
        },
      });
      
      return response;
    } catch (error) {
      dispatch({
        type: AI_ACTIONS.ERROR,
        payload: { error: error.message },
      });
      throw error;
    }
  }, [state.modelSettings, aiService]);
  
  // Generate structured content with JSON schema
  const generateStructuredContent = useCallback(async (prompt, schema, options = {}) => {
    const requestId = Date.now().toString();
    
    dispatch({
      type: AI_ACTIONS.START_GENERATION,
      payload: { requestId },
    });
    
    try {
      const response = await aiService.generateStructuredAIResponse(
        prompt,
        schema,
        {
          ...state.modelSettings,
          ...options,
        }
      );
      
      dispatch({
        type: AI_ACTIONS.COMPLETE_GENERATION,
        payload: {
          requestId,
          prompt,
          response: JSON.stringify(response, null, 2),
        },
      });
      
      return response;
    } catch (error) {
      dispatch({
        type: AI_ACTIONS.ERROR,
        payload: { error: error.message },
      });
      throw error;
    }
  }, [state.modelSettings, aiService]);
  
  // Stream content with progress updates
  const streamContent = useCallback(async (prompt, onChunk, options = {}) => {
    const requestId = Date.now().toString();
    let fullResponse = '';
    
    dispatch({
      type: AI_ACTIONS.START_GENERATION,
      payload: { requestId },
    });
    
    try {
      await aiService.streamAIResponse(
        prompt,
        {
          ...state.modelSettings,
          ...options,
          onChunk: (chunk, fullText) => {
            fullResponse = fullText;
            if (onChunk) onChunk(chunk, fullText);
            
            // Update progress (simple approximation)
            const progress = Math.min(95, Math.floor((fullText.length / 5000) * 100));
            dispatch({
              type: AI_ACTIONS.UPDATE_GENERATION,
              payload: { progress },
            });
          },
        }
      );
      
      dispatch({
        type: AI_ACTIONS.COMPLETE_GENERATION,
        payload: {
          requestId,
          prompt,
          response: fullResponse,
        },
      });
      
      return fullResponse;
    } catch (error) {
      dispatch({
        type: AI_ACTIONS.ERROR,
        payload: { error: error.message },
      });
      throw error;
    }
  }, [state.modelSettings, aiService]);
  
  // Set the active AI tool
  const setActiveTool = useCallback((tool) => {
    dispatch({
      type: AI_ACTIONS.SET_ACTIVE_TOOL,
      payload: { tool },
    });
  }, []);
  
  // Update model settings
  const updateModelSettings = useCallback((settings) => {
    dispatch({
      type: AI_ACTIONS.UPDATE_MODEL_SETTINGS,
      payload: { settings },
    });
    toast.success('AI model settings updated');
  }, []);
  
  // Clear generation history
  const clearHistory = useCallback(() => {
    dispatch({ type: AI_ACTIONS.CLEAR_HISTORY });
    toast.success('Generation history cleared');
  }, []);
  
  // Set AI configuration error
  const setAiConfigError = useCallback((error) => {
    dispatch({
      type: AI_ACTIONS.SET_AI_CONFIG_ERROR,
      payload: { error },
    });
  }, []);
  
  // Clear AI configuration error
  const clearAiConfigError = useCallback(() => {
    dispatch({ type: AI_ACTIONS.CLEAR_AI_CONFIG_ERROR });
  }, []);
  
  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    generateContent,
    generateStructuredContent,
    streamContent,
    setActiveTool,
    updateModelSettings,
    clearHistory,
    setAiConfigError,
    clearAiConfigError,
  };
  
  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

// Custom hook to use the AI context
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export default AIContext;
