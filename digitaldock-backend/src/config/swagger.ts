/**
 * Swagger/OpenAPI Configuration
 * API documentation specification
 */

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DigitalDock API',
    version: '1.0.0',
    description:
      'Digital Product Marketplace API - Buy and sell digital products like Notion templates, Figma assets, resume templates, and more.',
    contact: {
      name: 'DigitalDock Support',
      url: 'https://digitaldock.co',
      email: 'support@digitaldock.co',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://api.digitaldock.co',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token (obtained from /api/auth/login or /api/auth/register)',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
            },
            description: 'Detailed error information',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
          avatar: {
            type: 'string',
            description: 'Avatar image URL',
          },
          bio: {
            type: 'string',
            description: 'User biography',
          },
          role: {
            type: 'string',
            enum: ['BUYER', 'SELLER', 'ADMIN'],
            description: 'User role',
          },
          isVerifiedSeller: {
            type: 'boolean',
            description: 'Whether user is a verified seller',
          },
          isPremium: {
            type: 'boolean',
            description: 'Whether user has premium account',
          },
          sellerSlug: {
            type: 'string',
            description: 'Unique seller profile URL slug',
          },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          title: {
            type: 'string',
          },
          slug: {
            type: 'string',
          },
          description: {
            type: 'string',
          },
          category: {
            type: 'string',
            enum: [
              'NOTION_TEMPLATES',
              'FIGMA_ASSETS',
              'RESUME_TEMPLATES',
              'SPREADSHEET_TEMPLATES',
              'SOCIAL_MEDIA_TEMPLATES',
              'PRESENTATION_TEMPLATES',
              'WEBSITE_TEMPLATES',
              'ICON_PACKS',
              'EBOOKS_GUIDES',
              'CHEAT_SHEETS',
            ],
          },
          price: {
            type: 'number',
          },
          rating: {
            type: 'number',
            minimum: 0,
            maximum: 5,
          },
          reviewCount: {
            type: 'number',
          },
        },
      },
      Purchase: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Purchase ID',
          },
          buyer: {
            type: 'string',
            description: 'Buyer user ID',
          },
          product: {
            type: 'string',
            description: 'Product ID',
          },
          seller: {
            type: 'string',
            description: 'Seller user ID',
          },
          amount: {
            type: 'number',
            description: 'Purchase amount',
          },
          currency: {
            type: 'string',
            description: 'Currency code (e.g., USD, EUR)',
          },
          paymentProvider: {
            type: 'string',
            enum: ['PAYSTACK', 'STRIPE', 'MANUAL'],
            description: 'Payment provider used',
          },
          paymentReference: {
            type: 'string',
            description: 'Unique payment reference',
          },
          paymentStatus: {
            type: 'string',
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
            description: 'Payment status',
          },
          transactionId: {
            type: 'string',
            description: 'Transaction ID from payment provider',
          },
          downloadCount: {
            type: 'integer',
            description: 'Number of times product has been downloaded',
          },
          lastDownloadAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last download timestamp',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Purchase creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Purchase last update timestamp',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and registration',
    },
    {
      name: 'Users',
      description: 'User profile management',
    },
    {
      name: 'Products',
      description: 'Digital product listings',
    },
    {
      name: 'Purchases',
      description: 'Product purchases and transactions',
    },
    {
      name: 'Reviews',
      description: 'Product reviews and ratings',
    },
  ],
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
