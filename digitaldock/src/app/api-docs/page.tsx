'use client';

/**
 * API Documentation Page
 * Displays Swagger UI for API documentation
 */

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">DigitalDock API Documentation</h1>
          <p className="text-lg text-gray-600">
            Explore and test the DigitalDock API endpoints
          </p>
        </div>

        <SwaggerUI url="/api/docs" />
      </div>
    </div>
  );
}
