import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  increment, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';

export interface ReferralProgram {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  rewards: {
    referrer: {
      type: 'credit' | 'discount' | 'feature' | 'subscription';
      value: number;
      description: string;
      maxPerUser?: number;
    };
    referee: {
      type: 'credit' | 'discount' | 'feature' | 'subscription';
      value: number;
      description: string;
    };
  };
  requirements?: {
    minPurchaseAmount?: number;
    subscriptionTier?: string[];
  };
  termsAndConditions: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Referral {
  id: string;
  programId: string;
  referrerId: string;
  refereeId: string;
  refereeEmail: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  rewardStatus: {
    referrer: 'pending' | 'awarded' | 'failed';
    referee: 'pending' | 'awarded' | 'failed';
  };
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    referralSource?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export const referralService = {
  // Create a new referral program (admin only)
  async createReferralProgram(programData: Omit<ReferralProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReferralProgram> {
    try {
      const programRef = doc(collection(db, 'referralPrograms'));
      const newProgram: ReferralProgram = {
        ...programData,
        id: programRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(programRef, newProgram);
      return newProgram;
    } catch (error) {
      console.error('Error creating referral program:', error);
      throw error;
    }
  },

  // Get active referral program
  async getActiveReferralProgram(): Promise<ReferralProgram | null> {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'referralPrograms'),
        where('isActive', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>', now)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      
      // Return the first active program (assuming only one active at a time)
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ReferralProgram;
    } catch (error) {
      console.error('Error fetching active referral program:', error);
      throw error;
    }
  },

  // Generate a referral link for a user
  async generateReferralLink(userId: string, programId: string): Promise<string> {
    try {
      // In a real app, you might want to store this in the database
      // and handle link expiration, usage limits, etc.
      return `${window.location.origin}/signup?ref=${userId}&program=${programId}`;
    } catch (error) {
      console.error('Error generating referral link:', error);
      throw error;
    }
  },

  // Track a referral (when someone signs up using a referral link)
  async trackReferral(programId: string, referrerId: string, refereeId: string, refereeEmail: string): Promise<Referral> {
    try {
      const referralRef = doc(collection(db, 'referrals'));
      const newReferral: Referral = {
        id: referralRef.id,
        programId,
        referrerId,
        refereeId,
        refereeEmail,
        status: 'pending',
        rewardStatus: {
          referrer: 'pending',
          referee: 'pending',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(referralRef, newReferral);
      return newReferral;
    } catch (error) {
      console.error('Error tracking referral:', error);
      throw error;
    }
  },

  // Complete a referral (when the referred user completes the required action)
  async completeReferral(referralId: string): Promise<void> {
    try {
      const referralRef = doc(db, 'referrals', referralId);
      await updateDoc(referralRef, {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Here you would also award the rewards to both parties
      // This would involve updating user accounts, sending emails, etc.
    } catch (error) {
      console.error('Error completing referral:', error);
      throw error;
    }
  },

  // Get a user's referral stats
  async getUserReferralStats(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalEarned: number;
    availableRewards: number;
    referralLink: string;
  }> {
    try {
      // In a real app, you would query the database for these stats
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalEarned: 0,
        availableRewards: 0,
        referralLink: await this.generateReferralLink(userId, 'default-program'),
      };
    } catch (error) {
      console.error('Error fetching user referral stats:', error);
      throw error;
    }
  },

  // Get a user's referral history
  async getUserReferralHistory(userId: string): Promise<{
    referrals: Referral[];
    total: number;
  }> {
    try {
      const q = query(
        collection(db, 'referrals'),
        where('referrerId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const referrals: Referral[] = [];
      
      snapshot.forEach((doc) => {
        referrals.push({ id: doc.id, ...doc.data() } as Referral);
      });
      
      return {
        referrals,
        total: referrals.length,
      };
    } catch (error) {
      console.error('Error fetching user referral history:', error);
      throw error;
    }
  },
};
