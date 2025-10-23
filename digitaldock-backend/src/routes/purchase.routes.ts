/**
 * Purchase Routes
 * Handles purchase and payment endpoints
 */

import { Router } from 'express';
import {
  initializePurchase,
  verifyPurchase,
  getMyPurchases,
  getMySales,
  getDownloadLink,
  paystackWebhook,
} from '../controllers/purchase.controller';
import { authenticate, requireSeller } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/purchases/initialize:
 *   post:
 *     summary: Initialize a purchase (create payment intent)
 *     tags: [Purchases]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: The ID of the product to purchase
 *     responses:
 *       201:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 purchase:
 *                   $ref: '#/components/schemas/Purchase'
 *                 paymentUrl:
 *                   type: string
 *                 reference:
 *                   type: string
 *       400:
 *         description: Bad request (product not available, already owned, etc.)
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 */
router.post('/initialize', authenticate, initializePurchase);

/**
 * @swagger
 * /api/purchases/verify/{reference}:
 *   get:
 *     summary: Verify payment and complete purchase
 *     tags: [Purchases]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference from initialization
 *     responses:
 *       200:
 *         description: Purchase completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 purchase:
 *                   $ref: '#/components/schemas/Purchase'
 *       400:
 *         description: Payment not successful
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Purchase not found
 */
router.get('/verify/:reference', authenticate, verifyPurchase);

/**
 * @swagger
 * /api/purchases/my-purchases:
 *   get:
 *     summary: Get user's purchase history
 *     tags: [Purchases]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Purchases retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 purchases:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Purchase'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Authentication required
 */
router.get('/my-purchases', authenticate, getMyPurchases);

/**
 * @swagger
 * /api/purchases/my-sales:
 *   get:
 *     summary: Get seller's sales history
 *     tags: [Purchases]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sales:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Purchase'
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     currency:
 *                       type: string
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Seller access required
 */
router.get('/my-sales', authenticate, requireSeller, getMySales);

/**
 * @swagger
 * /api/purchases/{purchaseId}/download:
 *   get:
 *     summary: Get download link for purchased product
 *     tags: [Purchases]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: purchaseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase ID
 *     responses:
 *       200:
 *         description: Download link retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       url:
 *                         type: string
 *                       size:
 *                         type: number
 *                 downloadCount:
 *                   type: integer
 *       400:
 *         description: Purchase not completed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Purchase not found
 */
router.get('/:purchaseId/download', authenticate, getDownloadLink);

/**
 * @swagger
 * /api/purchases/webhook/paystack:
 *   post:
 *     summary: Paystack webhook handler (for internal use)
 *     tags: [Purchases]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       500:
 *         description: Webhook processing failed
 */
router.post('/webhook/paystack', paystackWebhook);

export default router;
