import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  type: 'ai_model' | 'template' | 'plugin' | 'dataset';
  category: string[];
  price: number;
  isFree: boolean;
  rating: number;
  reviewCount: number;
  creatorId: string;
  creatorName: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  thumbnailUrl?: string;
  previewImages?: string[];
  requirements?: string[];
  documentationUrl?: string;
  demoUrl?: string;
  status: 'published' | 'draft' | 'archived';
  stats: {
    downloads: number;
    views: number;
    likes: number;
  };
  // For AI models
  modelDetails?: {
    framework: string;
    architecture: string;
    trainingDataSize: number;
    accuracy: number;
    inputType: string[];
    outputType: string[];
    compatibleWith: string[];
  };
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export const marketplaceService = {
  // Get all published marketplace items with optional filtering
  async getMarketplaceItems(filters: {
    type?: string;
    category?: string;
    searchQuery?: string;
    sortBy?: 'popular' | 'newest' | 'rating' | 'price-asc' | 'price-desc';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ items: MarketplaceItem[]; total: number }> {
    try {
      // In a real implementation, this would query Firestore with the provided filters
      // For now, return mock data
      const mockItems: MarketplaceItem[] = [
        {
          id: 'model-1',
          name: 'Content Generation Pro',
          description: 'Advanced AI model for generating high-quality content',
          type: 'ai_model',
          category: ['content-creation', 'marketing'],
          price: 29.99,
          isFree: false,
          rating: 4.8,
          reviewCount: 124,
          creatorId: 'creator-1',
          creatorName: 'AI Labs',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2023-06-20'),
          tags: ['content', 'seo', 'blogging'],
          status: 'published',
          stats: {
            downloads: 1245,
            views: 5678,
            likes: 987,
          },
          modelDetails: {
            framework: 'PyTorch',
            architecture: 'GPT-3.5',
            trainingDataSize: 1000000,
            accuracy: 0.92,
            inputType: ['text'],
            outputType: ['text'],
            compatibleWith: ['web', 'mobile', 'api'],
          },
        },
        // Add more mock items as needed
      ];

      // Apply filters (simplified for the mock)
      let filteredItems = [...mockItems];
      
      if (filters.type) {
        filteredItems = filteredItems.filter(item => item.type === filters.type);
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(
          item => item.name.toLowerCase().includes(query) || 
                 item.description.toLowerCase().includes(query) ||
                 item.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        filteredItems.sort((a, b) => {
          switch (filters.sortBy) {
            case 'newest':
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'rating':
              return b.rating - a.rating;
            case 'price-asc':
              return a.price - b.price;
            case 'price-desc':
              return b.price - a.price;
            case 'popular':
            default:
              return b.stats.downloads - a.stats.downloads;
          }
        });
      }

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || filteredItems.length;
      const paginatedItems = filteredItems.slice(offset, offset + limit);

      return {
        items: paginatedItems,
        total: filteredItems.length,
      };
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      throw error;
    }
  },

  // Get a single marketplace item by ID
  async getMarketplaceItem(itemId: string): Promise<MarketplaceItem | null> {
    try {
      // In a real implementation, this would fetch from Firestore
      const items = (await this.getMarketplaceItems()).items;
      return items.find(item => item.id === itemId) || null;
    } catch (error) {
      console.error(`Error fetching marketplace item ${itemId}:`, error);
      throw error;
    }
  },

  // Get reviews for a marketplace item
  async getItemReviews(itemId: string): Promise<Review[]> {
    try {
      // In a real implementation, this would query Firestore
      return [];
    } catch (error) {
      console.error(`Error fetching reviews for item ${itemId}:`, error);
      throw error;
    }
  },

  // Add a review to a marketplace item
  async addReview(itemId: string, review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    try {
      // In a real implementation, this would update Firestore
      const newReview: Review = {
        ...review,
        id: `review-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return newReview;
    } catch (error) {
      console.error(`Error adding review to item ${itemId}:`, error);
      throw error;
    }
  },

  // Download/install a marketplace item
  async downloadItem(itemId: string, userId: string): Promise<{ downloadUrl: string }> {
    try {
      // In a real implementation, this would track the download and return a signed URL
      return {
        downloadUrl: `https://api.momentumai.com/download/${itemId}?user=${userId}&token=xyz`,
      };
    } catch (error) {
      console.error(`Error downloading item ${itemId}:`, error);
      throw error;
    }
  },

  // Get user's purchased/downloaded items
  async getUserPurchases(userId: string): Promise<MarketplaceItem[]> {
    try {
      // In a real implementation, this would query Firestore
      return [];
    } catch (error) {
      console.error(`Error fetching purchases for user ${userId}:`, error);
      throw error;
    }
  },

  // Record a purchase (for free items or after successful payment)
  async recordPurchase(itemId: string, userId: string): Promise<void> {
    try {
      // In a real implementation, this would update Firestore
      // to track the purchase in the user's purchases collection
      const purchaseRef = doc(db, 'users', userId, 'purchases', itemId);
      await setDoc(purchaseRef, {
        itemId,
        purchasedAt: new Date(),
        status: 'active',
      });
    } catch (error) {
      console.error(`Error recording purchase for item ${itemId}:`, error);
      throw error;
    }
  },
};
