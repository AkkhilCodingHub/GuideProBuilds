// src/features/support/api/support.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { supportService } from '../services/supportService';
import { validateRequest } from '../../../middleware/validateRequest';

const router = Router();

router.post(
  '/tickets',
  validateRequest({
    body: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      subject: z.string().min(1, 'Subject is required'),
      message: z.string().min(1, 'Message is required'),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
    }),
  }),
  async (req, res, next) => {
    try {
      await supportService.createTicket(req.body);
      res.status(201).json({
        success: true,
        message: 'Support ticket submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/faq/categories', (req, res) => {
  res.json([
    { id: 'general', name: 'General Questions' },
    { id: 'billing', name: 'Billing & Payments' },
    { id: 'technical', name: 'Technical Support' },
  ]);
});

export default router;