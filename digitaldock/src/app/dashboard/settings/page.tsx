'use client';

/**
 * User Profile Settings Page
 * Manage profile, change password, upgrade to seller
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import * as usersApi from '@/lib/api/users';
import * as uploadApi from '@/lib/api/upload';
import FileUpload from '@/components/FileUpload';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { success, error: showError } = useNotification();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<usersApi.UserProfile | null>(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    avatar: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Delete account
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load profile
  useEffect(() => {
    if (token && isAuthenticated) {
      loadProfile();
    }
  }, [token, isAuthenticated]);

  const loadProfile = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await usersApi.getMyProfile(token);
      setProfile(data);
      setProfileForm({
        name: data.user.name || '',
        bio: data.user.bio || '',
        avatar: data.user.avatar || '',
      });
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      showError(error.message || 'Failed to load profile', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (files: File[]) => {
    if (!token || files.length === 0) return;

    try {
      setIsUploadingAvatar(true);
      const response = await uploadApi.uploadImage(token, files[0], 'avatars');

      if (response.file) {
        setProfileForm((prev) => ({ ...prev, avatar: response.file!.url }));
        success('Avatar uploaded successfully', 'Success');
      }
    } catch (error: any) {
      console.error('Failed to upload avatar:', error);
      showError(error.message || 'Failed to upload avatar', 'Error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showError('Authentication required', 'Error');
      return;
    }

    try {
      setIsSavingProfile(true);
      const updateData: usersApi.UpdateProfileData = {
        name: profileForm.name.trim() || undefined,
        bio: profileForm.bio.trim() || undefined,
        avatar: profileForm.avatar.trim() || undefined,
      };

      await usersApi.updateProfile(token, updateData);
      success('Profile updated successfully', 'Success');
      await refreshUser();
      await loadProfile();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      showError(error.message || 'Failed to update profile', 'Error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      showError('Authentication required', 'Error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('Passwords do not match', 'Error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showError('Password must be at least 6 characters', 'Error');
      return;
    }

    try {
      setIsSavingPassword(true);
      await usersApi.changePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      success('Password changed successfully', 'Success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      showError(error.message || 'Failed to change password', 'Error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token || !deletePassword) {
      showError('Please enter your password', 'Error');
      return;
    }

    try {
      setIsDeleting(true);
      await usersApi.deleteAccount(token, deletePassword);
      success('Account deleted successfully', 'Success');
      router.push('/register');
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      showError(error.message || 'Failed to delete account', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Stats
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.stats.totalPurchases}
                  </p>
                </div>
                {user?.role === 'SELLER' && (
                  <>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {profile.stats.totalSales}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${profile.stats.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Products Listed</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.stats.totalProducts}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/purchases"
                  className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition"
                >
                  My Purchases
                </Link>
                {user?.role === 'SELLER' && (
                  <>
                    <Link
                      href="/seller/products"
                      className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition"
                    >
                      My Products
                    </Link>
                    <Link
                      href="/seller/sales"
                      className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition"
                    >
                      Sales Dashboard
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Profile Information
              </h2>

              <div className="space-y-4">
                {/* Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    {profileForm.avatar ? (
                      <img
                        src={profileForm.avatar}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <FileUpload
                        accept="image/*"
                        multiple={false}
                        maxSizeMB={2}
                        maxFiles={1}
                        onFilesSelected={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                        helperText="Upload a profile picture (max 2MB)"
                      />
                      {isUploadingAvatar && (
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">Uploading...</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.user.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    maxLength={100}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {profileForm.bio.length} / 500 characters
                  </p>
                </div>

                {/* Role & Seller Info */}
                {user?.role === 'SELLER' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">Seller Account</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Seller Slug: <span className="font-mono">{profile.user.sellerSlug}</span>
                        </p>
                        {profile.user.isVerifiedSeller && (
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            ✓ Verified Seller
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>

            {/* Change Password */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Security
              </h2>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      {isSavingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Upgrade to Seller */}
            {user?.role === 'BUYER' && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
                <h2 className="text-xl font-semibold mb-2">Become a Seller</h2>
                <p className="text-blue-100 mb-4">
                  Start selling your digital products and reach thousands of buyers
                </p>
                <Link
                  href="/dashboard/upgrade-to-seller"
                  className="inline-block px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                >
                  Upgrade Now
                </Link>
              </div>
            )}

            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-900 p-6">
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                Danger Zone
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Enter your password to confirm account deletion:
                  </p>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || !deletePassword}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                      }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
