import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { 
  Users, Mail, UserPlus, Settings, LogOut, Trash2, Edit, 
  Crown, Eye, PenTool, MoreVertical 
} from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { useTeam } from '../../contexts/TeamContext';
import { useAuth } from '../../contexts/AuthContext';

export default function TeamManagement() {
  const { currentUser } = useAuth();
  const { 
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
    switchTeam 
  } = useTeam();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      await createTeam(newTeamName, newTeamDescription);
      setNewTeamName('');
      setNewTeamDescription('');
      toast({
        title: "Success",
        description: "Team created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsInviting(true);
      await inviteMember(inviteEmail, inviteRole);
      setInviteEmail('');
      toast({
        title: "Success",
        description: "Invitation sent successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await updateMemberRole(memberId, newRole);
      toast({
        title: "Success",
        description: "Member role updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await removeMember(memberId);
      toast({
        title: "Success",
        description: "Member removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) {
      return;
    }

    try {
      await leaveTeam();
      toast({
        title: "Success",
        description: "You have left the team",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave team",
        variant: "destructive",
      });
    }
  };

  const isAdmin = currentTeam?.members.find(m => m.id === currentUser?.uid)?.role === 'admin';
  const currentUserMember = currentTeam?.members.find(m => m.id === currentUser?.uid);

  if (loading && !currentTeam) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading team data...</p>
        </div>
      </div>
    );
  }

  if (!currentTeam && teams.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Create and manage teams for collaboration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Your First Team</CardTitle>
            <CardDescription>
              Teams allow you to collaborate with others on content creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-description">Description (Optional)</Label>
              <Textarea
                id="team-description"
                placeholder="Describe your team"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateTeam} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Team'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your teams and collaborate with others</p>
        </div>
        {teams.length > 1 && (
          <Select 
            value={currentTeam?.id} 
            onValueChange={(teamId) => switchTeam(teamId)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Switch team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Team Overview</CardTitle>
          <CardDescription>{currentTeam?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-muted-foreground">Team Name</Label>
              <p className="font-medium">{currentTeam?.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Members</Label>
              <p className="font-medium">{currentTeam?.members.length || 0}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Your Role</Label>
              <Badge variant={currentUserMember?.role === 'admin' ? 'default' : 'secondary'}>
                {currentUserMember?.role || 'N/A'}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="font-medium text-sm">
                {currentTeam?.createdAt ? new Date(currentTeam.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          {currentTeam?.description && (
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p>{currentTeam.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Member */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Member</CardTitle>
            <CardDescription>Invite someone to join your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="email@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="w-[200px] space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(val) => setInviteRole(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleInviteMember} disabled={isInviting}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isInviting ? 'Inviting...' : 'Invite'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>{currentTeam?.members.length || 0} members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentTeam?.members.map((member) => {
              const isCurrentUser = member.id === currentUser?.uid;
              const canManage = isAdmin && !isCurrentUser;
              
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      {member.role === 'admin' && <Crown className="h-4 w-4 text-yellow-500" />}
                      {member.role === 'editor' && <PenTool className="h-4 w-4 text-blue-500" />}
                      {member.role === 'viewer' && <Eye className="h-4 w-4 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {member.email}
                        {isCurrentUser && ' (You)'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                        <Badge variant={member.status === 'pending' ? 'outline' : 'default'}>
                          {member.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(role) => handleUpdateRole(member.id, role)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Settings */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Team Settings</CardTitle>
            <CardDescription>Configure team preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default Role for New Members</Label>
                <p className="text-sm text-muted-foreground">
                  Role assigned to new members by default
                </p>
              </div>
              <Select
                value={currentTeam?.settings?.defaultRole || 'editor'}
                onValueChange={(role) => updateTeam(currentTeam.id, {
                  settings: { ...currentTeam.settings, defaultRole: role }
                })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require admin approval for new members
                </p>
              </div>
              <Switch
                checked={currentTeam?.settings?.requireApproval || false}
                onCheckedChange={(checked) => updateTeam(currentTeam.id, {
                  settings: { ...currentTeam.settings, requireApproval: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Max Members</Label>
                <p className="text-sm text-muted-foreground">
                  Maximum number of team members
                </p>
              </div>
              <Input
                type="number"
                value={currentTeam?.settings?.maxMembers || 10}
                onChange={(e) => updateTeam(currentTeam.id, {
                  settings: { ...currentTeam.settings, maxMembers: parseInt(e.target.value) }
                })}
                className="w-[150px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Team */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Team</CardTitle>
            <CardDescription>Leave this team permanently</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLeaveTeam}>
              <LogOut className="h-4 w-4 mr-2" />
              Leave Team
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
