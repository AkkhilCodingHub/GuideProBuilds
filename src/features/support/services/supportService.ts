// src/features/support/services/supportService.ts
import { Resend } from 'resend';
import { z } from 'zod';

// Debug log environment variables
console.log('Environment Variables:', {
  RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Not Set',
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL ? 'Set' : 'Not Set',
  NODE_ENV: process.env.NODE_ENV
});

const SupportTicketSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type SupportTicket = z.infer<typeof SupportTicketSchema>;

class SupportService {
  private resend: Resend;

  constructor() {
    if (!process.env.RESEND_API_KEY || !process.env.SUPPORT_EMAIL) {
      throw new Error('Email configuration is missing. Please check your environment variables.');
    }

    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async createTicket(ticket: SupportTicket): Promise<void> {
    try {
      console.log('Creating ticket with data:', ticket);
      const validatedTicket = SupportTicketSchema.parse(ticket);
      const supportEmail = process.env.SUPPORT_EMAIL!;

      // Send email to support
      const supportResponse = await this.resend.emails.send({
        from: `"${validatedTicket.name} (via Support)" <${supportEmail}>`,
        to: supportEmail,
        replyTo: validatedTicket.email,  // Changed from reply_to to replyTo
        subject: `[Support] ${validatedTicket.subject}`,
        text: `New support ticket:\n\nName: ${validatedTicket.name}\nEmail: ${validatedTicket.email}\nPriority: ${validatedTicket.priority}\n\nMessage:\n${validatedTicket.message}`,
      });

      if (supportResponse.error) {
        throw new Error(`Failed to send support email: ${supportResponse.error.message}`);
      }

      console.log('Support email sent with ID:', supportResponse.data?.id);

      // Send confirmation to user
      const userResponse = await this.resend.emails.send({
        from: `"Support Team" <${supportEmail}>`,
        to: validatedTicket.email,
        subject: 'Support Ticket Received',
        text: `Thank you for contacting support. We've received your ticket and will get back to you soon.\n\nTicket Details:\nSubject: ${validatedTicket.subject}\nPriority: ${validatedTicket.priority}\n\nYour message:\n${validatedTicket.message}`,
      });

      if (userResponse.error) {
        throw new Error(`Failed to send confirmation email: ${userResponse.error.message}`);
      }

      console.log('Confirmation email sent with ID:', userResponse.data?.id);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in createTicket:', error);
      throw new Error(`Failed to create support ticket: ${errorMessage}`);
    }
  }

}


export const supportService = new SupportService();