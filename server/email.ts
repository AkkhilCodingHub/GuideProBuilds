import { Resend } from 'resend';
import { IOrder, IOrderItem } from '@shared/schema';

const BILLING_EMAIL = 'ctechmtv@gmail.com';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || BILLING_EMAIL;

let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set - email functionality will be disabled');
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    partName: string;
    partType: string;
    partBrand: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: Date;
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

function generateOrderEmailHtml(order: OrderEmailData): string {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong style="color: #1f2937;">${item.partName}</strong>
        <br>
        <span style="color: #6b7280; font-size: 14px;">${item.partBrand} - ${item.partType}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #1f2937;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937;">
        ${formatCurrency(item.price, order.currency)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #1f2937; font-weight: 600;">
        ${formatCurrency(item.price * item.quantity, order.currency)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - PC Guide Pro</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 32px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">PC Guide Pro</h1>
                  <p style="margin: 8px 0 0; color: #93c5fd; font-size: 16px;">Order Confirmation</p>
                </td>
              </tr>

              <!-- Order Details -->
              <tr>
                <td style="padding: 32px;">
                  <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #166534; font-size: 16px;">
                      <strong>Order Confirmed!</strong> Thank you for your purchase.
                    </p>
                  </div>

                  <table style="width: 100%; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 8px 0;">
                        <strong style="color: #6b7280;">Order Number:</strong>
                        <span style="color: #1f2937; font-weight: 600;">${order.orderNumber}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <strong style="color: #6b7280;">Date:</strong>
                        <span style="color: #1f2937;">${formatDate(order.createdAt)}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <strong style="color: #6b7280;">Customer:</strong>
                        <span style="color: #1f2937;">${order.customerName}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <strong style="color: #6b7280;">Email:</strong>
                        <span style="color: #1f2937;">${order.customerEmail}</span>
                      </td>
                    </tr>
                  </table>

                  <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Order Summary</h2>

                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <thead>
                      <tr style="background-color: #f9fafb;">
                        <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 14px; font-weight: 600;">Item</th>
                        <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 14px; font-weight: 600;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px; font-weight: 600;">Price</th>
                        <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px; font-weight: 600;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>

                  <!-- Totals -->
                  <table style="width: 100%; max-width: 250px; margin-left: auto;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Subtotal:</td>
                      <td style="padding: 8px 0; text-align: right; color: #1f2937;">${formatCurrency(order.subtotal, order.currency)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Tax:</td>
                      <td style="padding: 8px 0; text-align: right; color: #1f2937;">${formatCurrency(order.tax, order.currency)}</td>
                    </tr>
                    <tr style="border-top: 2px solid #1e3a5f;">
                      <td style="padding: 12px 0; color: #1f2937; font-weight: 700; font-size: 18px;">Total:</td>
                      <td style="padding: 12px 0; text-align: right; color: #2563eb; font-weight: 700; font-size: 18px;">${formatCurrency(order.total, order.currency)}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                    Questions about your order? Contact us at
                    <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb; text-decoration: none;">${SUPPORT_EMAIL}</a>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    PC Guide Pro - Build Your Dream PC Without The Guesswork
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function generateOrderEmailText(order: OrderEmailData): string {
  const itemsList = order.items.map(item => 
    `  - ${item.partName} (${item.partBrand} - ${item.partType})\n    Qty: ${item.quantity} x ${formatCurrency(item.price, order.currency)} = ${formatCurrency(item.price * item.quantity, order.currency)}`
  ).join('\n');

  return `
PC GUIDE PRO - ORDER CONFIRMATION
==================================

Order Confirmed! Thank you for your purchase.

ORDER DETAILS
-------------
Order Number: ${order.orderNumber}
Date: ${formatDate(order.createdAt)}
Customer: ${order.customerName}
Email: ${order.customerEmail}

ORDER SUMMARY
-------------
${itemsList}

-------------
Subtotal: ${formatCurrency(order.subtotal, order.currency)}
Tax: ${formatCurrency(order.tax, order.currency)}
TOTAL: ${formatCurrency(order.total, order.currency)}

Questions about your order? Contact us at ${SUPPORT_EMAIL}

PC Guide Pro - Build Your Dream PC Without The Guesswork
  `.trim();
}

export interface SendBillingEmailResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

export async function sendBillingEmail(order: OrderEmailData): Promise<SendBillingEmailResult> {
  const client = getResendClient();
  
  if (!client) {
    return {
      success: false,
      error: 'Email service not configured - RESEND_API_KEY not set'
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: 'PC Guide Pro <onboarding@resend.dev>',
      to: [BILLING_EMAIL],
      subject: `Order Confirmation #${order.orderNumber} - PC Guide Pro`,
      html: generateOrderEmailHtml(order),
      text: generateOrderEmailText(order),
    });

    if (error) {
      console.error('Failed to send billing email:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }

    console.log(`Billing email sent successfully for order ${order.orderNumber}, messageId: ${data?.id}`);
    return {
      success: true,
      messageId: data?.id
    };
  } catch (err: any) {
    console.error('Error sending billing email:', err);
    return {
      success: false,
      error: err.message || 'Unknown error sending email'
    };
  }
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PCG-${timestamp}-${random}`;
}
