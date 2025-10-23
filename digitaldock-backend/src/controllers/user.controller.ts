/**
 * User Controllers
 * Handles user profile and account management
 */

import { Response } from 'express';
import { User, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'An error occurred while fetching user profile' });
  }
};

/**
 * Get user by ID or slug
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let user = null;

    // Check if id is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      user = await User.findById(id);
    }

    // If not found by ID, try by sellerSlug
    if (!user) {
      user = await User.findOne({ sellerSlug: id });
    }

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'An error occurred while fetching user' });
  }
};

/**
 * Update current user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { name, bio, avatar, website, socialLinks } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update allowed fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (website !== undefined) user.website = website;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'An error occurred while updating profile' });
  }
};

/**
 * Upgrade to seller (become a seller)
 */
export const upgradeToSeller = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === UserRole.SELLER || user.role === UserRole.ADMIN) {
      res.status(400).json({ error: 'User is already a seller' });
      return;
    }

    user.role = UserRole.SELLER;
    await user.save();

    res.status(200).json({
      message: 'Successfully upgraded to seller account',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Upgrade to seller error:', error);
    res.status(500).json({ error: 'An error occurred while upgrading to seller' });
  }
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, isPremium, isVerifiedSeller, page = 1, limit = 20 } = req.query;

    const query: any = {};

    if (role) query.role = role;
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';
    if (isVerifiedSeller !== undefined) query.isVerifiedSeller = isVerifiedSeller === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    const usersJson = users.map((u) => u.toJSON());

    res.status(200).json({
      users: usersJson,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'An error occurred while fetching users' });
  }
};

/**
 * Update user role (Admin only)
 */
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(UserRole).includes(role)) {
      res.status(400).json({ error: 'Valid role is required' });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: 'User role updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'An error occurred while updating user role' });
  }
};

/**
 * Verify seller (Admin only)
 */
export const verifySeller = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role !== UserRole.SELLER && user.role !== UserRole.ADMIN) {
      res.status(400).json({ error: 'User is not a seller' });
      return;
    }

    user.isVerifiedSeller = true;
    await user.save();

    res.status(200).json({
      message: 'Seller verified successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Verify seller error:', error);
    res.status(500).json({ error: 'An error occurred while verifying seller' });
  }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent self-deletion
    if (req.user && req.user.userId === id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    await user.deleteOne();

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'An error occurred while deleting user' });
  }
};
