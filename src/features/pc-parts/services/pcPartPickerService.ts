import axios from 'axios';
import { z } from 'zod';

// Types for PC Part data
const PartSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['cpu', 'gpu', 'ram', 'motherboard', 'storage', 'psu', 'case', 'cooling']),
  price: z.number(),
  currency: z.string().default('USD'),
  inStock: z.boolean().default(true),
  specifications: z.record(z.any()),
  imageUrl: z.string().optional(),
  buyUrl: z.string().url().optional(),
  compatibility: z.record(z.boolean()).optional(),
});

type Part = z.infer<typeof PartSchema>;

const PC_PART_PICKER_API = 'https://api.pcpartpicker.com/v1';

class PCPartPickerService {
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 3600000; // 1 hour cache

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchWithCache<T>(endpoint: string): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(endpoint);
    
    if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data as T;
    }

    try {
      const response = await axios.get(`${PC_PART_PICKER_API}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      
      this.cache.set(endpoint, {
        data: response.data,
        timestamp: now
      });
      
      return response.data as T;
    } catch (error) {
      console.error('Error fetching from PC Part Picker API:', error);
      throw new Error('Failed to fetch PC parts data');
    }
  }

  async searchParts(query: string, type?: string, options: {
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: 'price' | 'rating' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  } = {}): Promise<{ parts: Part[]; total: number }> {
    // Implementation for searching parts
    // This is a placeholder - actual implementation will depend on the PC Part Picker API
    throw new Error('Not implemented');
  }

  async getPartDetails(partId: string): Promise<Part> {
    // Implementation for getting part details
    // This is a placeholder - actual implementation will depend on the PC Part Picker API
    throw new Error('Not implemented');
  }

  async checkCompatibility(parts: Part[]): Promise<{ compatible: boolean; issues: string[] }> {
    // Implementation for checking part compatibility
    // This is a placeholder - actual implementation will depend on the PC Part Picker API
    throw new Error('Not implemented');
  }
}

// Export a singleton instance
export const pcPartPickerService = new PCPartPickerService(
  process.env.PC_PART_PICKER_API_KEY || ''
);
