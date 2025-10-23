/**
 * Email Service
 * Handles sending transactional emails via Resend
 */

import { resend, emailConfig, isEmailEnabled } from '../config/email';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Send email via Resend
 */
export const sendEmail = async (options: EmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> => {
  if (!isEmailEnabled) {
    console.warn('Email service is not configured. Skipping email send.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: emailConfig.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error: any) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  role: string
): Promise<boolean> => {
  const subject = `Welcome to ${emailConfig.appName}!`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${emailConfig.appName}! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>Thank you for joining ${emailConfig.appName}! We're excited to have you as part of our community.</p>
            ${role === 'SELLER' ? `
              <p>As a seller, you can now start uploading and selling your digital products. Here's what you can do:</p>
              <ul>
                <li>Upload unlimited products (with premium account)</li>
                <li>Set your own prices</li>
                <li>Track your sales and earnings</li>
                <li>Connect with buyers worldwide</li>
              </ul>
            ` : `
              <p>As a buyer, you now have access to thousands of high-quality digital products from creators around the world.</p>
              <ul>
                <li>Browse thousands of products</li>
                <li>Instant download after purchase</li>
                <li>Secure payment processing</li>
                <li>7-day refund policy</li>
              </ul>
            `}
            <center>
              <a href="${emailConfig.appUrl}/dashboard" class="button">Go to Dashboard</a>
            </center>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy ${role === 'SELLER' ? 'selling' : 'shopping'}!</p>
            <p>Best regards,<br>The ${emailConfig.appName} Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({ to: email, subject, html });
  return result.success;
};

/**
 * Send email verification email
 */
export const sendVerificationEmail = async (
  email: string,
  name: string,
  verificationToken: string
): Promise<boolean> => {
  const verificationUrl = `${emailConfig.appUrl}/verify-email?token=${verificationToken}`;
  const subject = `Verify your ${emailConfig.appName} email`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .code { background: #e5e7eb; padding: 15px; font-size: 24px; letter-spacing: 5px; text-align: center; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email ✉️</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>Thanks for signing up! Please verify your email address to activate your account.</p>
            <center>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>Best regards,<br>The ${emailConfig.appName} Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({ to: email, subject, html });
  return result.success;
};

/**
 * Send purchase confirmation to buyer
 */
export const sendPurchaseConfirmation = async (
  buyerEmail: string,
  buyerName: string,
  productTitle: string,
  amount: number,
  currency: string,
  purchaseId: string,
  downloadUrl: string
): Promise<boolean> => {
  const subject = `Purchase Confirmation - ${productTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .purchase-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Purchase Confirmed! ✅</h1>
          </div>
          <div class="content">
            <p>Hi ${buyerName},</p>
            <p>Thank you for your purchase! Your order has been confirmed and is ready to download.</p>

            <div class="purchase-details">
              <h3>Order Details</h3>
              <p><strong>Product:</strong> ${productTitle}</p>
              <p><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
              <p><strong>Order ID:</strong> ${purchaseId}</p>
            </div>

            <center>
              <a href="${downloadUrl}" class="button">Download Now</a>
            </center>

            <p><strong>Important:</strong> You can download your purchase anytime from your dashboard.</p>

            <p>If you encounter any issues or have questions about your purchase, please don't hesitate to contact us.</p>

            <p>Thank you for supporting our creators!</p>

            <p>Best regards,<br>The ${emailConfig.appName} Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({ to: buyerEmail, subject, html });
  return result.success;
};

/**
 * Send sale notification to seller
 */
export const sendSaleNotification = async (
  sellerEmail: string,
  sellerName: string,
  productTitle: string,
  amount: number,
  currency: string,
  earnings: number
): Promise<boolean> => {
  const subject = `🎉 You made a sale: ${productTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .earnings { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .amount { font-size: 36px; color: #f59e0b; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Congratulations! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${sellerName},</p>
            <p>Great news! Someone just purchased your product "<strong>${productTitle}</strong>".</p>

            <div class="earnings">
              <p style="margin: 0; color: #6b7280;">Your Earnings</p>
              <div class="amount">${currency} ${earnings.toFixed(2)}</div>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Sale Price: ${currency} ${amount.toFixed(2)} (after platform fee)</p>
            </div>

            <center>
              <a href="${emailConfig.appUrl}/seller/dashboard" class="button">View Sales Dashboard</a>
            </center>

            <p>Keep up the great work! Your earnings will be paid out according to your payout schedule.</p>

            <p>Best regards,<br>The ${emailConfig.appName} Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({ to: sellerEmail, subject, html });
  return result.success;
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<boolean> => {
  const resetUrl = `${emailConfig.appUrl}/reset-password?token=${resetToken}`;
  const subject = `Reset your ${emailConfig.appName} password`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request 🔐</h1>
          </div>
          <div class="content">
            <p>Hi ${name || 'there'},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>

            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #ef4444;">${resetUrl}</p>

            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request a password reset, please ignore this email</li>
                <li>Your password will not change until you create a new one</li>
              </ul>
            </div>

            <p>If you're having trouble, contact our support team.</p>

            <p>Best regards,<br>The ${emailConfig.appName} Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({ to: email, subject, html });
  return result.success;
};

/**
 * Send product approval notification to seller
 */
export const sendProductApprovalEmail = async (
  sellerEmail: string,
  sellerName: string,
  productTitle: string,
  productUrl: string
): Promise<boolean> => {
  const subject = `Your product "${productTitle}" has been approved!`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Product Approved! ✅</h1>
          </div>
          <div class="content">
            <p>Hi ${sellerName},</p>
            <p>Great news! Your product "<strong>${productTitle}</strong>" has been reviewed and approved. It's now live on ${emailConfig.appName}!</p>

            <center>
              <a href="${productUrl}" class="button">View Your Product</a>
            </center>

            <p>Your product is now visible to all buyers. Start promoting it to maximize your sales!</p>

            <p>Best regards,<br>The ${emailConfig.appName} Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${emailConfig.appName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const result = await sendEmail({ to: sellerEmail, subject, html });
  return result.success;
};
