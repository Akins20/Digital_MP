/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { authenticateUser } from '@/lib/auth/middleware';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isVerifiedSeller:
 *                       type: boolean
 *                     isPremium:
 *                       type: boolean
 *                     sellerSlug:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error } = await authenticateUser(request);
    if (error) return error;

    await connectDB();

    // Find user
    const currentUser = await User.findById(user!.userId);

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data
    return NextResponse.json(
      {
        user: {
          id: currentUser._id.toString(),
          email: currentUser.email,
          name: currentUser.name,
          avatar: currentUser.avatar,
          bio: currentUser.bio,
          role: currentUser.role,
          isVerifiedSeller: currentUser.isVerifiedSeller,
          isPremium: currentUser.isPremium,
          premiumUntil: currentUser.premiumUntil,
          sellerSlug: currentUser.sellerSlug,
          website: currentUser.website,
          twitter: currentUser.twitter,
          instagram: currentUser.instagram,
          totalEarnings: currentUser.totalEarnings,
          totalSales: currentUser.totalSales,
          createdAt: currentUser.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'An error occurred fetching profile' }, { status: 500 });
  }
}
