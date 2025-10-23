import {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPurchaseConfirmation,
  sendSaleNotification,
  sendPasswordResetEmail,
  sendProductApprovalEmail,
  EmailOptions,
} from '../../src/services/email.service';

// Mock Resend and email config
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  };
});

jest.mock('../../src/config/email', () => {
  const mockResend = {
    emails: {
      send: jest.fn(),
    },
  };

  return {
    resend: mockResend,
    emailConfig: {
      apiKey: 'test_api_key',
      fromEmail: 'noreply@digitaldock.test',
      appName: 'DigitalDock Test',
      appUrl: 'http://localhost:3000',
    },
    isEmailEnabled: true,
  };
});

import { resend, emailConfig } from '../../src/config/email';

describe('Email Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'test-message-id' },
        error: null,
      });

      const emailOptions: EmailOptions = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test text',
      };

      const result = await sendEmail(emailOptions);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(mockSend).toHaveBeenCalledWith({
        from: emailConfig.fromEmail,
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test text',
        replyTo: undefined,
      });
    });

    it('should send email to multiple recipients', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'test-message-id' },
        error: null,
      });

      const result = await sendEmail({
        to: ['user1@test.com', 'user2@test.com'],
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['user1@test.com', 'user2@test.com'],
        })
      );
    });

    it('should include replyTo if provided', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'test-message-id' },
        error: null,
      });

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        replyTo: 'support@digitaldock.test',
      });

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: 'support@digitaldock.test',
        })
      );
    });

    it('should handle Resend error response', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key' },
      });

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });

    it('should handle send exceptions', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockRejectedValue(new Error('Network error'));

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email to buyer', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'welcome-id' },
        error: null,
      });

      const result = await sendWelcomeEmail(
        'buyer@test.com',
        'John Buyer',
        'BUYER'
      );

      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalled();

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe('buyer@test.com');
      expect(callArgs.subject).toContain('Welcome');
      expect(callArgs.html).toContain('John Buyer');
      expect(callArgs.html).toContain('Browse thousands of products');
      expect(callArgs.html).toContain('Happy shopping');
    });

    it('should send welcome email to seller', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'welcome-id' },
        error: null,
      });

      const result = await sendWelcomeEmail(
        'seller@test.com',
        'Jane Seller',
        'SELLER'
      );

      expect(result).toBe(true);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('Jane Seller');
      expect(callArgs.html).toContain('Upload unlimited products');
      expect(callArgs.html).toContain('Happy selling');
    });

    it('should include dashboard link', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'welcome-id' },
        error: null,
      });

      await sendWelcomeEmail('user@test.com', 'Test User', 'BUYER');

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain(`${emailConfig.appUrl}/dashboard`);
    });

    it('should return false on email send failure', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Failed' },
      });

      const result = await sendWelcomeEmail('user@test.com', 'Test User', 'BUYER');
      expect(result).toBe(false);
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with token', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'verify-id' },
        error: null,
      });

      const result = await sendVerificationEmail(
        'user@test.com',
        'Test User',
        'verification-token-123'
      );

      expect(result).toBe(true);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.subject).toContain('Verify');
      expect(callArgs.html).toContain('verification-token-123');
      expect(callArgs.html).toContain(`${emailConfig.appUrl}/verify-email`);
      expect(callArgs.html).toContain('Test User');
    });

    it('should include expiration notice', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'verify-id' },
        error: null,
      });

      await sendVerificationEmail('user@test.com', 'Test User', 'token');

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('24 hours');
    });
  });

  describe('sendPurchaseConfirmation', () => {
    it('should send purchase confirmation to buyer', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'purchase-id' },
        error: null,
      });

      const result = await sendPurchaseConfirmation(
        'buyer@test.com',
        'John Buyer',
        'Awesome Template',
        29.99,
        'USD',
        'purchase-123',
        'https://r2.example.com/download/file.zip'
      );

      expect(result).toBe(true);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe('buyer@test.com');
      expect(callArgs.subject).toContain('Purchase Confirmation');
      expect(callArgs.subject).toContain('Awesome Template');
      expect(callArgs.html).toContain('John Buyer');
      expect(callArgs.html).toContain('Awesome Template');
      expect(callArgs.html).toContain('USD 29.99');
      expect(callArgs.html).toContain('purchase-123');
      expect(callArgs.html).toContain('https://r2.example.com/download/file.zip');
    });

    it('should include download button', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'purchase-id' },
        error: null,
      });

      const downloadUrl = 'https://r2.example.com/download/product.zip';

      await sendPurchaseConfirmation(
        'buyer@test.com',
        'Buyer',
        'Product',
        50,
        'USD',
        'order-123',
        downloadUrl
      );

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('Download Now');
      expect(callArgs.html).toContain(downloadUrl);
    });

    it('should format amount with decimals', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'purchase-id' },
        error: null,
      });

      await sendPurchaseConfirmation(
        'buyer@test.com',
        'Buyer',
        'Product',
        99.5,
        'USD',
        'order-123',
        'https://download.test'
      );

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('USD 99.50');
    });
  });

  describe('sendSaleNotification', () => {
    it('should send sale notification to seller', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'sale-id' },
        error: null,
      });

      const result = await sendSaleNotification(
        'seller@test.com',
        'Jane Seller',
        'Premium Template',
        50,
        'USD',
        45
      );

      expect(result).toBe(true);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe('seller@test.com');
      expect(callArgs.subject).toContain('You made a sale');
      expect(callArgs.subject).toContain('Premium Template');
      expect(callArgs.html).toContain('Jane Seller');
      expect(callArgs.html).toContain('Premium Template');
      expect(callArgs.html).toContain('USD 45.00'); // Earnings
      expect(callArgs.html).toContain('USD 50.00'); // Sale price
    });

    it('should include dashboard link', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'sale-id' },
        error: null,
      });

      await sendSaleNotification(
        'seller@test.com',
        'Seller',
        'Product',
        100,
        'USD',
        90
      );

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain(`${emailConfig.appUrl}/seller/dashboard`);
    });

    it('should show earnings after platform fee', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'sale-id' },
        error: null,
      });

      await sendSaleNotification(
        'seller@test.com',
        'Seller',
        'Product',
        100,
        'USD',
        90
      );

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('after platform fee');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'reset-id' },
        error: null,
      });

      const result = await sendPasswordResetEmail(
        'user@test.com',
        'Test User',
        'reset-token-456'
      );

      expect(result).toBe(true);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe('user@test.com');
      expect(callArgs.subject).toContain('Reset your');
      expect(callArgs.subject).toContain('password');
      expect(callArgs.html).toContain('Test User');
      expect(callArgs.html).toContain('reset-token-456');
      expect(callArgs.html).toContain(`${emailConfig.appUrl}/reset-password`);
    });

    it('should include security warnings', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'reset-id' },
        error: null,
      });

      await sendPasswordResetEmail('user@test.com', 'User', 'token');

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('expire in 1 hour');
      expect(callArgs.html).toContain('Security Notice');
      expect(callArgs.html).toContain("didn't request");
    });

    it('should include reset button', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'reset-id' },
        error: null,
      });

      await sendPasswordResetEmail('user@test.com', 'User', 'token123');

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('Reset Password');
    });
  });

  describe('sendProductApprovalEmail', () => {
    it('should send product approval email', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'approval-id' },
        error: null,
      });

      const productUrl = 'https://digitaldock.test/products/awesome-template';

      const result = await sendProductApprovalEmail(
        'seller@test.com',
        'Jane Seller',
        'Awesome Template',
        productUrl
      );

      expect(result).toBe(true);

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe('seller@test.com');
      expect(callArgs.subject).toContain('approved');
      expect(callArgs.subject).toContain('Awesome Template');
      expect(callArgs.html).toContain('Jane Seller');
      expect(callArgs.html).toContain('Awesome Template');
      expect(callArgs.html).toContain(productUrl);
    });

    it('should include view product button', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'approval-id' },
        error: null,
      });

      const productUrl = 'https://digitaldock.test/products/test-product';

      await sendProductApprovalEmail(
        'seller@test.com',
        'Seller',
        'Product',
        productUrl
      );

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('View Your Product');
      expect(callArgs.html).toContain(productUrl);
    });

    it('should encourage promotion', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'approval-id' },
        error: null,
      });

      await sendProductApprovalEmail(
        'seller@test.com',
        'Seller',
        'Product',
        'https://test.com'
      );

      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.html).toContain('visible to all buyers');
      expect(callArgs.html).toContain('promoting');
    });
  });

  describe('Email Content', () => {
    it('should include app name in all emails', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'test-id' },
        error: null,
      });

      await sendWelcomeEmail('user@test.com', 'User', 'BUYER');
      expect(mockSend.mock.calls[0][0].html).toContain(emailConfig.appName);

      await sendPurchaseConfirmation('user@test.com', 'User', 'Product', 50, 'USD', '123', 'url');
      expect(mockSend.mock.calls[1][0].html).toContain(emailConfig.appName);

      await sendSaleNotification('user@test.com', 'User', 'Product', 50, 'USD', 45);
      expect(mockSend.mock.calls[2][0].html).toContain(emailConfig.appName);
    });

    it('should include copyright year', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'test-id' },
        error: null,
      });

      const currentYear = new Date().getFullYear();

      await sendWelcomeEmail('user@test.com', 'User', 'BUYER');
      expect(mockSend.mock.calls[0][0].html).toContain(currentYear.toString());
    });

    it('should use proper HTML structure', async () => {
      const mockSend = resend.emails.send as jest.MockedFunction<any>;
      mockSend.mockResolvedValue({
        data: { id: 'test-id' },
        error: null,
      });

      await sendWelcomeEmail('user@test.com', 'User', 'BUYER');

      const html = mockSend.mock.calls[0][0].html;
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('<style>');
    });
  });
});
