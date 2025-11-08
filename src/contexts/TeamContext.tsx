import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type TeamMember = {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
  status: 'active' | 'pending' | 'suspended';
};

type Team = {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  members: TeamMember[];
  settings: {
    defaultRole: 'editor' | 'viewer';
    requireApproval: boolean;
    maxMembers: number;
  };
};

type TeamContextType = {
  currentTeam: Team | null;
  teams: Team[];
  loading: boolean;
  error: string | null;
  createTeam: (name: string, description?: string) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  inviteMember: (email: string, role: TeamMember['role']) => Promise<void>;
  updateMemberRole: (memberId: string, role: TeamMember['role']) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  leaveTeam: () => Promise<void>;
  switchTeam: (teamId: string) => Promise<void>;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's teams on mount
  useEffect(() => {
    if (currentUser) {
      loadTeams();
    }
  }, [currentUser]);

  const loadTeams = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load teams');
      }

      const data = await response.json();
      setTeams(data.teams || []);
      
      // Get current team from localStorage or use first team
      // Validate localStorage data - only store team IDs, not sensitive data
      try {
        const savedTeamId = localStorage.getItem('currentTeamId');
        // Validate that the saved team ID exists in the teams list
        const savedTeam = savedTeamId ? data.teams?.find(t => t.id === savedTeamId) : null;
        setCurrentTeam(savedTeam || data.teams?.[0] || null);
        
        if (savedTeam && savedTeam.id) {
          localStorage.setItem('currentTeamId', savedTeam.id);
        } else if (data.teams?.[0]?.id) {
          // Update localStorage with first team if saved team doesn't exist
          localStorage.setItem('currentTeamId', data.teams[0].id);
        }
      } catch (storageError) {
        // If localStorage is unavailable (private browsing, etc.), just use first team
        setCurrentTeam(data.teams?.[0] || null);
        if (import.meta.env.DEV) {
          console.warn('localStorage unavailable, using default team:', storageError);
        }
      }
    } catch (err) {
      setError('Failed to load teams');
      console.error('Error loading teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string, description?: string): Promise<Team> => {
    try {
      setLoading(true);
      const token = await currentUser?.getIdToken();
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create team');
      }

      const newTeam = await response.json();
      setTeams([...teams, newTeam]);
      setCurrentTeam(newTeam);
      localStorage.setItem('currentTeamId', newTeam.id);
      return newTeam;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      console.error('Error creating team:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Implement other methods (updateTeam, inviteMember, etc.)
  const updateTeam = async (teamId: string, updates: Partial<Team>) => {
    try {
      setLoading(true);
      const token = await currentUser?.getIdToken();
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update team');
      }

      const updatedTeam = await response.json();
      setTeams(prev => prev.map(t => t.id === teamId ? updatedTeam : t));
      if (currentTeam?.id === teamId) {
        setCurrentTeam(updatedTeam);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
      console.error('Error updating team:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (email: string, role: TeamMember['role']) => {
    if (!currentTeam) {
      throw new Error('No team selected');
    }

    try {
      setLoading(true);
      const token = await currentUser?.getIdToken();
      const response = await fetch(`/api/teams/${currentTeam.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, role })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to invite member');
      }

      const updatedTeam = await response.json();
      setCurrentTeam(updatedTeam);
      setTeams(prev => prev.map(t => t.id === currentTeam.id ? updatedTeam : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
      console.error('Error inviting member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, role: TeamMember['role']) => {
    if (!currentTeam) {
      throw new Error('No team selected');
    }

    try {
      setLoading(true);
      const token = await currentUser?.getIdToken();
      const response = await fetch(`/api/teams/${currentTeam.id}/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update member role');
      }

      const updatedTeam = await response.json();
      setCurrentTeam(updatedTeam);
      setTeams(prev => prev.map(t => t.id === currentTeam.id ? updatedTeam : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
      console.error('Error updating member role:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!currentTeam) {
      throw new Error('No team selected');
    }

    try {
      setLoading(true);
      const token = await currentUser?.getIdToken();
      const response = await fetch(`/api/teams/${currentTeam.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove member');
      }

      const updatedTeam = await response.json();
      setCurrentTeam(updatedTeam);
      setTeams(prev => prev.map(t => t.id === currentTeam.id ? updatedTeam : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      console.error('Error removing member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async () => {
    if (!currentTeam) {
      throw new Error('No team selected');
    }

    try {
      setLoading(true);
      const token = await currentUser?.getIdToken();
      const response = await fetch(`/api/teams/${currentTeam.id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to leave team');
      }

      // Remove team from teams list or switch to another team
      const remainingTeams = teams.filter(t => t.id !== currentTeam.id);
      setTeams(remainingTeams);
      setCurrentTeam(remainingTeams.length > 0 ? remainingTeams[0] : null);
      
      // Update localStorage
      if (remainingTeams.length > 0) {
        localStorage.setItem('currentTeamId', remainingTeams[0].id);
      } else {
        localStorage.removeItem('currentTeamId');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave team');
      console.error('Error leaving team:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const switchTeam = async (teamId: string) => {
    try {
      setLoading(true);
      const team = teams.find(t => t.id === teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      setCurrentTeam(team);
      localStorage.setItem('currentTeamId', teamId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch team');
      console.error('Error switching team:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        teams,
        loading,
        error,
        createTeam,
        updateTeam,
        inviteMember,
        updateMemberRole,
        removeMember,
        leaveTeam,
        switchTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
