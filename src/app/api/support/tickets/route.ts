import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "ctechmtv@gmail.com",
    pass: process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD,
  },
});

const SupportTicketSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  category: z.string().optional(),
  sendConfirmation: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedTicket = SupportTicketSchema.parse(body);

    const supportEmail = process.env.SUPPORT_EMAIL || "ctechmtv@gmail.com";
    const fromEmail = process.env.GMAIL_USER || "ctechmtv@gmail.com";

    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "long",
    });

    const teamEmailText = `
New Support Ticket:
------------------
Time: ${timestamp}
From: ${validatedTicket.name} <${validatedTicket.email}>
Subject: ${validatedTicket.subject}
Priority: ${validatedTicket.priority}
${validatedTicket.category ? `Category: ${validatedTicket.category}` : ""}

Message:
${validatedTicket.message}
    `.trim();

    const confirmationEmailText = `
Thank you for contacting PC Guide Pro Support!

We've received your support ticket and our team will get back to you as soon as possible.

Ticket Details:
- Ticket ID: ${Date.now()}
- Subject: ${validatedTicket.subject}
- Priority: ${validatedTicket.priority}
${validatedTicket.category ? `- Category: ${validatedTicket.category}` : ""}

Your Message:
${validatedTicket.message}

Best regards,
PC Guide Pro Support Team

---
This is an automated confirmation. Please do not reply unless you have additional information to add to your request.
    `.trim();

    await transporter.sendMail({
      from: `"PC Guide Pro Support" <${fromEmail}>`,
      to: supportEmail,
      replyTo: validatedTicket.email,
      subject: `[${validatedTicket.priority.toUpperCase()}] Support Ticket: ${validatedTicket.subject}`,
      text: teamEmailText,
    });

    if (validatedTicket.sendConfirmation) {
      await transporter.sendMail({
        from: `"PC Guide Pro Support" <${fromEmail}>`,
        to: validatedTicket.email,
        subject: `Support Ticket Received: ${validatedTicket.subject}`,
        text: confirmationEmailText,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Support ticket submitted successfully",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
