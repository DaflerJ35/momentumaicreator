import { useState, useEffect } from 'react';
import { isFirebaseReady } from '../lib/firebase';

/**
 * Hook to check configuration health
 * Returns status of critical services and configuration
 */
export function useConfigHealth() {
  const [health, setHealth] = useState({
    firebase: false,
    api: false,
    loading: true,
    issues: [],
  });

  useEffect(() => {
    const checkHealth = async () => {
      const issues = [];
      let firebaseHealthy = false;
      let apiHealthy = false;

      // Check Firebase
      try {
        firebaseHealthy = isFirebaseReady();
        if (!firebaseHealthy) {
          issues.push({
            type: 'firebase',
            severity: 'warning',
            message: 'Firebase is not configured. Social sign-in will be unavailable.',
          });
        }
      } catch (error) {
        issues.push({
          type: 'firebase',
          severity: 'error',
          message: 'Firebase configuration error',
        });
      }

      // Check API health
      try {
        const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
        const response = await fetch(`${apiUrl}/api/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          apiHealthy = true;
        } else {
          issues.push({
            type: 'api',
            severity: 'error',
            message: 'API health check failed',
          });
        }
      } catch (error) {
        issues.push({
          type: 'api',
          severity: 'warning',
          message: 'Unable to reach API server. Some features may be unavailable.',
        });
      }

      setHealth({
        firebase: firebaseHealthy,
        api: apiHealthy,
        loading: false,
        issues,
      });
    };

    checkHealth();
    
    // Re-check every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return health;
}

