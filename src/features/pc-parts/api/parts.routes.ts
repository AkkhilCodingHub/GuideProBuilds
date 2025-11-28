import { Router } from 'express';
import { z } from 'zod';
import { pcPartPickerService } from '../services/pcPartPickerService';
import { validateRequest } from '../../../middleware/validateRequest';

const router = Router();

// Search parts
router.get('/search', 
  validateRequest({
    query: z.object({
      q: z.string().min(1, 'Search query is required'),
      type: z.enum(['cpu', 'gpu', 'ram', 'motherboard', 'storage', 'psu', 'case', 'cooling']).optional(),
      minPrice: z.string().optional(),
      maxPrice: z.string().optional(),
      inStock: z.string().optional().transform(val => val === 'true'),
      sortBy: z.enum(['price', 'rating', 'popularity']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      page: z.string().optional().default('1').transform(Number),
      pageSize: z.string().optional().default('20').transform(Number),
    })
  }),
  async (req, res, next) => {
    try {
      const { q, type, minPrice, maxPrice, inStock, sortBy, sortOrder, page, pageSize } = req.query;
      
      const result = await pcPartPickerService.searchParts(q, type, {
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        inStock,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Get part details
router.get('/:id', 
  validateRequest({
    params: z.object({
      id: z.string().min(1, 'Part ID is required'),
    })
  }),
  async (req, res, next) => {
    try {
      const part = await pcPartPickerService.getPartDetails(req.params.id);
      res.json(part);
    } catch (error) {
      next(error);
    }
  }
);

// Check compatibility
router.post('/compatibility', 
  validateRequest({
    body: z.object({
      partIds: z.array(z.string().min(1, 'Part ID is required')).min(1, 'At least one part ID is required'),
    })
  }),
  async (req, res, next) => {
    try {
      const { partIds } = req.body;
      const parts = await Promise.all(partIds.map(id => pcPartPickerService.getPartDetails(id)));
      const result = await pcPartPickerService.checkCompatibility(parts);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
