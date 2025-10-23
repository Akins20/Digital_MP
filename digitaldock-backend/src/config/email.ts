/**
 * Email Configuration
 * Using Resend for transactional emails
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

export const emailConfig = {
  apiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@digitaldock.co',
  appName: process.env.APP_NAME || 'DigitalDock',
  appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Validate email configuration
export const validateEmailConfig = (): boolean => {
  if (!emailConfig.apiKey) {
    console.warn('⚠️  Missing Resend API key. Email sending will be disabled.');
    return false;
  }
  return true;
};

// Initialize Resend client
export const resend = new Resend(emailConfig.apiKey);

// Email enabled flag
export const isEmailEnabled = validateEmailConfig();
