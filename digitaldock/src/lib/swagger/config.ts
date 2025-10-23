/**
 * Swagger/OpenAPI Configuration
 * Defines API documentation structure
 */

import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DigitalDock API',
    version: '1.0.0',
    description:
      'Digital Product Marketplace API - Buy and sell digital products like Notion templates, Figma assets, and more',
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
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://digitaldock.co',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
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
            description: 'User email',
          },
          name: {
            type: 'string',
            description: 'User name',
          },
          avatar: {
            type: 'string',
            description: 'Avatar URL',
          },
          bio: {
            type: 'string',
            description: 'User bio',
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
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Product ID',
          },
          title: {
            type: 'string',
            description: 'Product title',
          },
          slug: {
            type: 'string',
            description: 'URL-friendly product slug',
          },
          description: {
            type: 'string',
            description: 'Product description',
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
            description: 'Product category',
          },
          price: {
            type: 'number',
            description: 'Product price in USD',
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Product images',
          },
          rating: {
            type: 'number',
            description: 'Average rating (0-5)',
          },
          reviewCount: {
            type: 'number',
            description: 'Number of reviews',
          },
          status: {
            type: 'string',
            enum: ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'UNLISTED', 'REJECTED'],
            description: 'Product status',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Products',
      description: 'Product management endpoints',
    },
    {
      name: 'Purchases',
      description: 'Purchase and transaction endpoints',
    },
    {
      name: 'Reviews',
      description: 'Product review endpoints',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/app/api/**/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJSDoc(options);
