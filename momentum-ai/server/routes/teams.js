const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const admin = require('../firebaseAdmin');
const { getUserSubscription, checkLimit } = require('../utils/subscriptionHelper');
const { sendTeamInvitation } = require('../utils/emailService');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    // Log full error details for debugging
    logger.error('Token verification failed', { error: error.message, stack: error.stack });
    // Don't expose technical error details
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Apply auth middleware to all routes
router.use(verifyToken);

// Get all teams for the current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const db = admin.firestore();

    // Get teams where user is a member (using memberIds array)
    const teamsSnapshot = await db.collection('teams')
      .where('memberIds', 'array-contains', userId)
      .get();

    const teams = [];
    teamsSnapshot.forEach(doc => {
      const data = doc.data();
      // Normalize Firestore timestamps to ISO strings
      const normalizedData = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        members: data.members?.map(m => ({
          ...m,
          joinedAt: m.joinedAt?.toDate ? m.joinedAt.toDate().toISOString() : m.joinedAt,
          invitedAt: m.invitedAt?.toDate ? m.invitedAt.toDate().toISOString() : m.invitedAt
        })) || []
      };
      teams.push(normalizedData);
    });

    res.json({ teams });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error fetching teams', { error: error.message, stack: error.stack });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to fetch teams. Please try again.' });
  }
});

// Create a new team
router.post('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, description } = req.body;
    const db = admin.firestore();

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Check user's subscription tier for team limits
    const subscription = await getUserSubscription(userId);
    const limitCheck = await checkLimit(userId, 'teamMember', 1);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: limitCheck.reason,
        plan: limitCheck.plan,
      });
    }

    const newTeam = {
      name,
      description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      memberIds: [userId], // Array of user IDs for querying
      members: [
        {
          id: userId,
          email: req.user.email,
          role: 'admin',
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'active'
        }
      ],
      settings: {
        defaultRole: 'editor',
        requireApproval: true,
        maxMembers: limitCheck.limit || 10 // Use subscription limit
      }
    };

    const teamRef = await db.collection('teams').add(newTeam);
    const teamDoc = await teamRef.get();
    const data = teamDoc.data();
    const team = {
      id: teamDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      members: data.members?.map(m => ({
        ...m,
        joinedAt: m.joinedAt?.toDate ? m.joinedAt.toDate().toISOString() : m.joinedAt
      })) || []
    };

    logger.info('Team created', { teamId: team.id, userId });
    res.json(team);
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error creating team', { error: error.message, stack: error.stack, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to create team. Please try again.' });
  }
});

// Get team details
router.get('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.uid;
    const db = admin.firestore();

    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const data = teamDoc.data();
    // Verify user is a member
    const isMember = data.memberIds?.includes(userId) || data.members?.some(m => m.id === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Normalize timestamps
    const team = {
      id: teamDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      members: data.members?.map(m => ({
        ...m,
        joinedAt: m.joinedAt?.toDate ? m.joinedAt.toDate().toISOString() : m.joinedAt,
        invitedAt: m.invitedAt?.toDate ? m.invitedAt.toDate().toISOString() : m.invitedAt
      })) || []
    };

    res.json(team);
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error fetching team', { error: error.message, stack: error.stack, teamId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to fetch team. Please try again.' });
  }
});

// Update team
router.patch('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.uid;
    const db = admin.firestore();

    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamDoc.data();
    // Verify user is admin
    const userMember = team.members.find(m => m.id === userId);
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const updates = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    delete updates.members; // Don't allow updating members directly
    delete updates.id;

    await db.collection('teams').doc(teamId).update(updates);
    const updatedDoc = await db.collection('teams').doc(teamId).get();
    const data = updatedDoc.data();

    res.json({
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      members: data.members?.map(m => ({
        ...m,
        joinedAt: m.joinedAt?.toDate ? m.joinedAt.toDate().toISOString() : m.joinedAt,
        invitedAt: m.invitedAt?.toDate ? m.invitedAt.toDate().toISOString() : m.invitedAt
      })) || []
    });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error updating team', { error: error.message, stack: error.stack, teamId, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to update team. Please try again.' });
  }
});

// Delete team
router.delete('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.uid;
    const db = admin.firestore();

    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamDoc.data();
    // Verify user is admin
    const userMember = team.members.find(m => m.id === userId);
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await db.collection('teams').doc(teamId).delete();
    logger.info('Team deleted', { teamId, userId });

    res.json({ success: true });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error deleting team', { error: error.message, stack: error.stack, teamId, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to delete team. Please try again.' });
  }
});

// Invite member
router.post('/:teamId/members', async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.uid;
    const { email, role } = req.body;
    const db = admin.firestore();

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamDoc.data();
    // Verify user is admin
    const userMember = team.members.find(m => m.id === userId);
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Check member limit based on subscription
    const subscription = await getUserSubscription(userId);
    const limitCheck = await checkLimit(userId, 'teamMember', team.members.length + 1);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: limitCheck.reason,
        plan: limitCheck.plan,
        limit: limitCheck.limit,
      });
    }
    
    // Also check team's configured limit
    const maxMembers = team.settings?.maxMembers || limitCheck.limit || 10;
    if (team.members.length >= maxMembers) {
      return res.status(400).json({ 
        error: 'Team member limit reached',
        limit: maxMembers,
      });
    }

    // Add pending member
    const newMember = {
      id: `pending_${Date.now()}`,
      email,
      role,
      status: 'pending',
      invitedBy: userId,
      invitedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Update both members array and memberIds array
    const updates = {
      members: admin.firestore.FieldValue.arrayUnion(newMember),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // If member has an actual user ID (not pending), add to memberIds
    if (newMember.id && !newMember.id.startsWith('pending_')) {
      updates.memberIds = admin.firestore.FieldValue.arrayUnion(newMember.id);
    }

    await db.collection('teams').doc(teamId).update(updates);

    // Send invitation email
    try {
      const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/team/manage?invite=${teamId}`;
      const inviterName = req.user.email || 'A team member';
      const emailResult = await sendTeamInvitation({
        to: email,
        teamName: team.name,
        inviterName,
        teamId,
        inviteLink,
      });
      
      if (!emailResult.success) {
        logger.warn('Failed to send team invitation email', { 
          email, 
          teamId, 
          error: emailResult.error 
        });
        // Don't fail the request if email fails, but log it
      }
    } catch (emailError) {
      logger.error('Error sending team invitation email', { 
        email, 
        teamId, 
        error: emailError.message 
      });
      // Don't fail the request if email fails
    }

    const updatedDoc = await db.collection('teams').doc(teamId).get();
    const data = updatedDoc.data();
    res.json({
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      members: data.members?.map(m => ({
        ...m,
        joinedAt: m.joinedAt?.toDate ? m.joinedAt.toDate().toISOString() : m.joinedAt,
        invitedAt: m.invitedAt?.toDate ? m.invitedAt.toDate().toISOString() : m.invitedAt
      })) || []
    });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error inviting member', { error: error.message, stack: error.stack, teamId, userId, email });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to invite member. Please try again.' });
  }
});

// Update member role
router.patch('/:teamId/members/:memberId', async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.user.uid;
    const { role } = req.body;
    const db = admin.firestore();

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamDoc.data();
    // Verify user is admin
    const userMember = team.members.find(m => m.id === userId);
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Update member role
    const updatedMembers = team.members.map(m => {
      if (m.id === memberId) {
        return { ...m, role };
      }
      return m;
    });

    await db.collection('teams').doc(teamId).update({
      members: updatedMembers,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await db.collection('teams').doc(teamId).get();
    const data = updatedDoc.data();
    res.json({
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      members: data.members?.map(m => ({
        ...m,
        joinedAt: m.joinedAt?.toDate ? m.joinedAt.toDate().toISOString() : m.joinedAt,
        invitedAt: m.invitedAt?.toDate ? m.invitedAt.toDate().toISOString() : m.invitedAt
      })) || []
    });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error updating member role', { error: error.message, stack: error.stack, teamId, memberId, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to update member role. Please try again.' });
  }
});

// Remove member
router.delete('/:teamId/members/:memberId', async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.user.uid;
    const db = admin.firestore();

    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamDoc.data();
    // Verify user is admin
    const userMember = team.members.find(m => m.id === userId);
    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Prevent removing last admin
    const admins = team.members.filter(m => m.role === 'admin');
    const memberToRemove = team.members.find(m => m.id === memberId);
    if (admins.length === 1 && memberToRemove?.role === 'admin') {
      return res.status(400).json({ error: 'Cannot remove last admin' });
    }

    // Remove member
    const updatedMembers = team.members.filter(m => m.id !== memberId);

    // Update both members array and memberIds array
    const updates = {
      members: updatedMembers,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Remove from memberIds if it's a real user ID
    if (memberToRemove && memberToRemove.id && !memberToRemove.id.startsWith('pending_')) {
      updates.memberIds = admin.firestore.FieldValue.arrayRemove(memberToRemove.id);
    }

    await db.collection('teams').doc(teamId).update(updates);

    const updatedDoc = await db.collection('teams').doc(teamId).get();
    const data = updatedDoc.data();
    res.json({
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      members: data.members?.map(m => ({
        ...m,
        joinedAt: m.joinedAt?.toDate ? m.joinedAt.toDate().toISOString() : m.joinedAt,
        invitedAt: m.invitedAt?.toDate ? m.invitedAt.toDate().toISOString() : m.invitedAt
      })) || []
    });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error removing member', { error: error.message, stack: error.stack, teamId, memberId, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to remove member. Please try again.' });
  }
});

// Leave team
router.post('/:teamId/leave', async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.uid;
    const db = admin.firestore();

    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamDoc.data();
    const userMember = team.members.find(m => m.id === userId);
    if (!userMember) {
      return res.status(403).json({ error: 'Not a team member' });
    }

    // Prevent last admin from leaving
    const admins = team.members.filter(m => m.role === 'admin');
    if (admins.length === 1 && userMember.role === 'admin') {
      return res.status(400).json({ error: 'Cannot leave as last admin. Transfer ownership first.' });
    }

    // Remove member
    const updatedMembers = team.members.filter(m => m.id !== userId);

    // Update both members array and memberIds array
    await db.collection('teams').doc(teamId).update({
      members: updatedMembers,
      memberIds: admin.firestore.FieldValue.arrayRemove(userId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (error) {
    // Log full error details for debugging
    logger.error('Error leaving team', { error: error.message, stack: error.stack, teamId, userId });
    // Don't expose technical error details to users
    res.status(500).json({ error: 'Failed to leave team. Please try again.' });
  }
});

module.exports = router;

