import nodemailer from 'nodemailer';
import { z } from 'zod';

// Debug log environment variables
console.log('Email Configuration:', {
  gmailUser: process.env.GMAIL_USER ? 'Set' : 'Not Set',
  supportEmail: process.env.SUPPORT_EMAIL || 'Using default',
  nodeEnv: process.env.NODE_ENV || 'development'
});

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'ctechmtv@gmail.com',
    pass: process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD,
  },
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
      New Support Ticket:
      ------------------
      Time: ${timestamp}
      From: ${ticket.name} <${ticket.email}>
      Subject: ${ticket.subject}
      Priority: ${ticket.priority}
      ${ticket.category ? `Category: ${ticket.category}` : ''}
      
      Message:
      ${ticket.message}
    `.trim();
  }

  private formatConfirmationEmail(ticket: SupportTicket): string {
    return `
      Thank you for contacting PC Guide Pro Support!
      
      We've received your support ticket and our team will get back to you as soon as possible.
      
      Ticket Details:
      - Ticket ID: ${Date.now()}
      - Subject: ${ticket.subject}
      - Priority: ${ticket.priority}
      ${ticket.category ? `- Category: ${ticket.category}` : ''}
      
      Your Message:
      ${ticket.message}
      
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

<<<<<<< Updated upstream
      console.log('Creating ticket with data:', ticket);
=======
>>>>>>> Stashed changes
      const validatedTicket = SupportTicketSchema.parse(ticket);
      const supportEmail = process.env.SUPPORT_EMAIL || 'ctechmtv@gmail.com';
      const fromEmail = process.env.GMAIL_USER || 'ctechmtv@gmail.com';

      // Send detailed email to support team
      await this.transporter.sendMail({
        from: `"PC Guide Pro Support" <${fromEmail}>`,
        to: supportEmail,
        replyTo: validatedTicket.email,
        subject: `[${validatedTicket.priority.toUpperCase()}] Support Ticket: ${validatedTicket.subject}`,
        text: this.formatSupportEmail(validatedTicket),
      });

      // Send confirmation to user only if requested
      if (validatedTicket.sendConfirmation) {
        await this.transporter.sendMail({
          from: `"PC Guide Pro Support" <${fromEmail}>`,
          to: validatedTicket.email,
          subject: `Support Ticket Received: ${validatedTicket.subject}`,
          text: this.formatConfirmationEmail(validatedTicket),
        });
      }

      console.log('Support ticket created and notifications sent');
    } catch (error) {
      console.error('Error creating support ticket:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to create support ticket: ${errorMessage}`);
    }
  }
}

export const supportService = new SupportService();