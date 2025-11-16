/**
 * Subscription Helper - Get user subscription and usage limits
 */

const admin = require('../firebaseAdmin');
const logger = require('./logger');

// Plan limits configuration
const PLAN_LIMITS = {
  free: {
    images: { perMonth: 10 },
    videos: { perMonth: 0, maxDuration: 0 }, // No videos on free plan
    voice: { perMonth: 0, maxMinutes: 0 }, // No voice on free plan
    teamMembers: 1,
  },
  pro: {
    images: { perMonth: 100 },
    videos: { perMonth: 10, maxDuration: 30 }, // 30 seconds max
    voice: { perMonth: 60, maxMinutes: 60 }, // 60 minutes per month
    teamMembers: 5,
  },
  business: {
    images: { perMonth: 500 },
    videos: { perMonth: 50, maxDuration: 60 }, // 60 seconds max
    voice: { perMonth: 300, maxMinutes: 300 }, // 300 minutes per month
    teamMembers: 20,
  },
  businessPlus: {
    images: { perMonth: -1 }, // Unlimited
    videos: { perMonth: -1, maxDuration: 300 }, // Unlimited, 5 min max
    voice: { perMonth: -1, maxMinutes: -1 }, // Unlimited
    teamMembers: -1, // Unlimited
  },
};

/**
 * Get user's subscription plan from Firestore
 */
async function getUserSubscription(userId) {
  try {
    const db = admin.firestore();
    const subDoc = await db.collection('subscriptions').doc(userId).get();
    
    if (!subDoc.exists) {
      return { plan: 'free', status: 'active' };
    }
    
    const data = subDoc.data();
    const plan = data.plan || 'free';
    const status = data.status || 'active';
    
    // Normalize plan name (handle variations)
    const normalizedPlan = plan.toLowerCase().replace(/[^a-z0-9]/g, '');
    let finalPlan = 'free';
    
    if (normalizedPlan.includes('pro')) {
      finalPlan = 'pro';
    } else if (normalizedPlan.includes('businessplus') || normalizedPlan.includes('business+')) {
      finalPlan = 'businessPlus';
    } else if (normalizedPlan.includes('business')) {
      finalPlan = 'business';
    }
    
    return {
      plan: finalPlan,
      status,
      subscriptionId: data.subscription_id,
      currentPeriodEnd: data.current_period_end,
    };
  } catch (error) {
    logger.error(`Error getting subscription for user ${userId}:`, error);
    return { plan: 'free', status: 'active' };
  }
}

/**
 * Get user's usage for current period
 */
async function getUserUsage(userId, period = 'month') {
  try {
    const db = admin.firestore();
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    
    // Get usage from usage collection
    const usageRef = db.collection('usage').doc(userId);
    const usageDoc = await usageRef.get();
    
    if (!usageDoc.exists) {
      return {
        images: 0,
        videos: 0,
        voiceMinutes: 0,
        periodStart: periodStart.toISOString(),
      };
    }
    
    const data = usageDoc.data();
    const lastReset = data.lastReset ? data.lastReset.toDate() : periodStart;
    
    // Reset if new period
    if (lastReset < periodStart) {
      await usageRef.set({
        images: 0,
        videos: 0,
        voiceMinutes: 0,
        lastReset: admin.firestore.Timestamp.fromDate(periodStart),
      }, { merge: true });
      
      return {
        images: 0,
        videos: 0,
        voiceMinutes: 0,
        periodStart: periodStart.toISOString(),
      };
    }
    
    return {
      images: data.images || 0,
      videos: data.videos || 0,
      voiceMinutes: data.voiceMinutes || 0,
      periodStart: lastReset.toISOString(),
    };
  } catch (error) {
    logger.error(`Error getting usage for user ${userId}:`, error);
    return {
      images: 0,
      videos: 0,
      voiceMinutes: 0,
      periodStart: new Date().toISOString(),
    };
  }
}

/**
 * Check if user can perform action based on plan limits
 */
async function checkLimit(userId, action, value = 1) {
  const subscription = await getUserSubscription(userId);
  const usage = await getUserUsage(userId);
  const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free;
  
  // Check if plan is active
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return {
      allowed: false,
      reason: 'Subscription is not active',
      plan: subscription.plan,
    };
  }
  
  switch (action) {
    case 'image':
      const imageLimit = limits.images.perMonth;
      if (imageLimit === -1) {
        return { allowed: true, plan: subscription.plan };
      }
      if (usage.images + value > imageLimit) {
        return {
          allowed: false,
          reason: `Image limit exceeded. ${usage.images}/${imageLimit} images used this month.`,
          plan: subscription.plan,
          used: usage.images,
          limit: imageLimit,
        };
      }
      return { allowed: true, plan: subscription.plan };
      
    case 'video':
      const videoLimit = limits.videos.perMonth;
      const maxDuration = limits.videos.maxDuration;
      if (videoLimit === -1) {
        // Check duration limit
        if (maxDuration > 0 && value > maxDuration) {
          return {
            allowed: false,
            reason: `Video duration exceeds limit. Maximum ${maxDuration} seconds allowed.`,
            plan: subscription.plan,
            requested: value,
            limit: maxDuration,
          };
        }
        return { allowed: true, plan: subscription.plan };
      }
      if (usage.videos + 1 > videoLimit) {
        return {
          allowed: false,
          reason: `Video limit exceeded. ${usage.videos}/${videoLimit} videos used this month.`,
          plan: subscription.plan,
          used: usage.videos,
          limit: videoLimit,
        };
      }
      if (maxDuration > 0 && value > maxDuration) {
        return {
          allowed: false,
          reason: `Video duration exceeds limit. Maximum ${maxDuration} seconds allowed.`,
          plan: subscription.plan,
          requested: value,
          limit: maxDuration,
        };
      }
      return { allowed: true, plan: subscription.plan };
      
    case 'voice':
      const voiceLimit = limits.voice.perMonth;
      const maxMinutes = limits.voice.maxMinutes;
      if (voiceLimit === -1) {
        return { allowed: true, plan: subscription.plan };
      }
      if (usage.voiceMinutes + value > voiceLimit) {
        return {
          allowed: false,
          reason: `Voice limit exceeded. ${usage.voiceMinutes}/${voiceLimit} minutes used this month.`,
          plan: subscription.plan,
          used: usage.voiceMinutes,
          limit: voiceLimit,
        };
      }
      return { allowed: true, plan: subscription.plan };
      
    case 'teamMember':
      const memberLimit = limits.teamMembers;
      if (memberLimit === -1) {
        return { allowed: true, plan: subscription.plan };
      }
      if (value > memberLimit) {
        return {
          allowed: false,
          reason: `Team member limit exceeded. Maximum ${memberLimit} members allowed.`,
          plan: subscription.plan,
          requested: value,
          limit: memberLimit,
        };
      }
      return { allowed: true, plan: subscription.plan };
      
    default:
      return { allowed: true, plan: subscription.plan };
  }
}

/**
 * Record usage for a user
 */
async function recordUsage(userId, action, value = 1) {
  try {
    const db = admin.firestore();
    const usageRef = db.collection('usage').doc(userId);
    
    const updates = {};
    switch (action) {
      case 'image':
        updates.images = admin.firestore.FieldValue.increment(value);
        break;
      case 'video':
        updates.videos = admin.firestore.FieldValue.increment(1);
        break;
      case 'voice':
        updates.voiceMinutes = admin.firestore.FieldValue.increment(value);
        break;
    }
    
    // Set lastReset if not exists
    const usageDoc = await usageRef.get();
    if (!usageDoc.exists) {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      updates.lastReset = admin.firestore.Timestamp.fromDate(periodStart);
    }
    
    await usageRef.set(updates, { merge: true });
  } catch (error) {
    logger.error(`Error recording usage for user ${userId}:`, error);
  }
}

module.exports = {
  getUserSubscription,
  getUserUsage,
  checkLimit,
  recordUsage,
  PLAN_LIMITS,
};

