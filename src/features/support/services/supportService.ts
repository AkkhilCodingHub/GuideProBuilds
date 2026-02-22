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
  category: z.string().optional(),
  sendConfirmation: z.boolean().default(true),
});

export type SupportTicket = z.infer<typeof SupportTicketSchema>;

class SupportService {
  private resend: Resend | null = null;

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  private formatSupportEmail(ticket: SupportTicket): string {
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'long'
    });
    
    return `
=====================================
NEW SUPPORT TICKET - PC Guide Pro
=====================================

TICKET DETAILS
--------------
Submitted: ${timestamp}
Priority: ${ticket.priority.toUpperCase()}
Category: ${ticket.category || 'General'}

CONTACT INFORMATION
-------------------
Name: ${ticket.name}
Email: ${ticket.email}

SUBJECT
-------
${ticket.subject}

MESSAGE
-------
${ticket.message}

=====================================
Reply directly to this email to respond to the customer.
=====================================
    `.trim();
  }

  private formatConfirmationEmail(ticket: SupportTicket): string {
    return `
Dear ${ticket.name},

Thank you for contacting PC Guide Pro Support. We have received your message and our team will review it shortly.

TICKET SUMMARY
--------------
Subject: ${ticket.subject}
Priority: ${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
Category: ${ticket.category || 'General'}

YOUR MESSAGE
------------
${ticket.message}

WHAT'S NEXT?
------------
- Our support team typically responds within 24-48 hours
- For urgent matters, please mark your ticket as "High" priority
- Check our FAQ section for immediate answers to common questions

If you have any additional information to add, simply reply to this email.

Best regards,
PC Guide Pro Support Team

---
This is an automated confirmation. Please do not reply unless you have additional information to add to your request.
    `.trim();
  }

  async createTicket(ticket: SupportTicket): Promise<void> {
    try {
      if (!this.resend) {
        console.warn('Email service not configured - ticket not sent');
        return;
      }

      console.log('Creating ticket with data:', ticket);
      const validatedTicket = SupportTicketSchema.parse(ticket);
      const supportEmail = process.env.SUPPORT_EMAIL!;

      // Send detailed email to support team
      const supportResponse = await this.resend.emails.send({
        from: `"PC Guide Pro Support" <${supportEmail}>`,
        to: supportEmail,
        replyTo: validatedTicket.email,
        subject: `[${validatedTicket.priority.toUpperCase()}] ${validatedTicket.subject}`,
        text: this.formatSupportEmail(validatedTicket),
      });

      if (supportResponse.error) {
        throw new Error(`Failed to send support email: ${supportResponse.error.message}`);
      }

      console.log('Support email sent with ID:', supportResponse.data?.id);

      // Send confirmation to user only if requested
      if (validatedTicket.sendConfirmation) {
        const userResponse = await this.resend.emails.send({
          from: `"PC Guide Pro Support" <${supportEmail}>`,
          to: validatedTicket.email,
          subject: `Support Ticket Received: ${validatedTicket.subject}`,
          text: this.formatConfirmationEmail(validatedTicket),
        });

        if (userResponse.error) {
          console.warn(`Failed to send confirmation email: ${userResponse.error.message}`);
          // Don't throw - the support ticket was still created successfully
        } else {
          console.log('Confirmation email sent with ID:', userResponse.data?.id);
        }
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in createTicket:', error);
      throw new Error(`Failed to create support ticket: ${errorMessage}`);
    }
  }
}

export const supportService = new SupportService();