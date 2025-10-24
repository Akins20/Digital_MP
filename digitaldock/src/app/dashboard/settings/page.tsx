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
import { IOSCard, IOSButton, IOSInput, IOSBadge } from '@/components/ios';
import { User, Mail, Lock, BadgeCheck, ShoppingBag, Package, DollarSign, LayoutGrid, AlertTriangle, Upload } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/20 flex items-center justify-center pt-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-ios-blue-500 border-t-transparent"></div>
          <p className="mt-ios-md text-ios-body text-ios-gray-600 dark:text-ios-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/20 pt-16">
      <main className="max-w-6xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl">
        {/* Header */}
        <div className="mb-ios-xl animate-ios-fade-in">
          <h1 className="text-ios-large-title font-bold text-gray-900 dark:text-white mb-ios-sm">Profile Settings</h1>
          <p className="text-ios-body text-ios-gray-600 dark:text-ios-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-ios-lg">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-ios-lg">
            {/* Profile Stats */}
            <IOSCard blur padding="lg" className="animate-ios-scale-in">
              <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white mb-ios-lg">
                Your Stats
              </h3>
              <div className="space-y-ios-lg">
                <div className="flex items-center gap-ios-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-ios-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Total Purchases</p>
                    <p className="text-ios-title2 font-bold text-gray-900 dark:text-white">
                      {profile.stats?.totalPurchases || 0}
                    </p>
                  </div>
                </div>
                {user?.role === 'SELLER' && (
                  <>
                    <div className="flex items-center gap-ios-md pt-ios-lg border-t border-ios-gray-200 dark:border-ios-gray-700">
                      <div className="w-12 h-12 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-ios-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Total Sales</p>
                        <p className="text-ios-title2 font-bold text-ios-green-600 dark:text-ios-green-400">
                          {profile.stats?.totalSales || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-ios-md">
                      <div className="w-12 h-12 bg-gradient-to-br from-ios-blue-500 to-ios-blue-600 rounded-ios-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Total Revenue</p>
                        <p className="text-ios-title2 font-bold text-ios-blue-600 dark:text-ios-blue-400">
                          ${(profile.stats?.totalRevenue || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-ios-md">
                      <div className="w-12 h-12 bg-gradient-to-br from-ios-purple-500 to-ios-pink-500 rounded-ios-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-ios-caption1 text-ios-gray-600 dark:text-ios-gray-400">Products Listed</p>
                        <p className="text-ios-title2 font-bold text-gray-900 dark:text-white">
                          {profile.stats?.totalProducts || 0}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </IOSCard>

            {/* Quick Links */}
            <IOSCard blur padding="lg" className="animate-ios-scale-in" style={{ animationDelay: '50ms' }}>
              <h3 className="text-ios-title3 font-semibold text-gray-900 dark:text-white mb-ios-md">
                Quick Links
              </h3>
              <div className="space-y-ios-xs">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-ios-sm px-ios-md py-ios-sm text-ios-footnote text-ios-gray-700 dark:text-ios-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 rounded-ios-lg transition-all active:scale-98"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/purchases"
                  className="flex items-center gap-ios-sm px-ios-md py-ios-sm text-ios-footnote text-ios-gray-700 dark:text-ios-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 rounded-ios-lg transition-all active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  My Purchases
                </Link>
                {user?.role === 'SELLER' && (
                  <>
                    <Link
                      href="/seller/products"
                      className="flex items-center gap-ios-sm px-ios-md py-ios-sm text-ios-footnote text-ios-gray-700 dark:text-ios-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 rounded-ios-lg transition-all active:scale-98"
                    >
                      <Package className="w-4 h-4" />
                      My Products
                    </Link>
                    <Link
                      href="/seller/sales"
                      className="flex items-center gap-ios-sm px-ios-md py-ios-sm text-ios-footnote text-ios-gray-700 dark:text-ios-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 rounded-ios-lg transition-all active:scale-98"
                    >
                      <DollarSign className="w-4 h-4" />
                      Sales Dashboard
                    </Link>
                  </>
                )}
              </div>
            </IOSCard>
          </div>

          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-ios-lg">
            {/* Profile Information */}
            <form onSubmit={handleUpdateProfile}>
              <IOSCard blur padding="lg" className="animate-ios-slide-up">
                <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-lg">
                  Profile Information
                </h2>

                <div className="space-y-ios-lg">
                  {/* Avatar */}
                  <div>
                    <label className="block text-ios-footnote font-semibold text-ios-gray-700 dark:text-ios-gray-300 mb-ios-sm">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-ios-md">
                      {profileForm.avatar ? (
                        <img
                          src={profileForm.avatar}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover border-2 border-ios-gray-200 dark:border-ios-gray-700 shadow-ios-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 flex items-center justify-center shadow-ios-sm">
                          <User className="w-10 h-10 text-white" />
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
                          <p className="mt-ios-xs text-ios-footnote text-ios-blue-600 dark:text-ios-blue-400">
                            <Upload className="w-4 h-4 inline mr-1 animate-bounce" />
                            Uploading...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div>
                    <IOSInput
                      label="Email"
                      type="email"
                      value={profile.user.email}
                      disabled
                      leftIcon={<Mail className="w-5 h-5" />}
                      helperText="Email cannot be changed"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <IOSInput
                      label="Display Name"
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      maxLength={100}
                      placeholder="Your name"
                      leftIcon={<User className="w-5 h-5" />}
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-ios-footnote font-medium text-ios-gray-700 dark:text-ios-gray-300 mb-ios-xs">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      maxLength={500}
                      rows={4}
                      className="w-full px-ios-md py-ios-sm text-ios-body bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent rounded-ios-lg focus:outline-none focus:ring-2 focus:ring-ios-blue-500/50 focus:border-ios-blue-500 transition-all duration-200 placeholder:text-ios-gray-400"
                      placeholder="Tell us about yourself"
                    />
                    <p className="mt-ios-xs text-ios-caption1 text-ios-gray-500 dark:text-ios-gray-400">
                      {profileForm.bio.length} / 500 characters
                    </p>
                  </div>

                  {/* Role & Seller Info */}
                  {user?.role === 'SELLER' && (
                    <div className="p-ios-md bg-ios-blue-50 dark:bg-ios-blue-900/20 border border-ios-blue-200 dark:border-ios-blue-800 rounded-ios-lg">
                      <div className="flex items-start gap-ios-sm">
                        <BadgeCheck className="w-6 h-6 text-ios-blue-600 dark:text-ios-blue-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-ios-body font-semibold text-ios-blue-900 dark:text-ios-blue-100">Seller Account</p>
                          <p className="text-ios-footnote text-ios-blue-700 dark:text-ios-blue-300 mt-ios-xs">
                            Seller Slug: <span className="font-mono">{profile.user.sellerSlug}</span>
                          </p>
                          {profile.user.isVerifiedSeller && (
                            <div className="flex items-center gap-ios-xs mt-ios-xs">
                              <IOSBadge variant="success">Verified Seller</IOSBadge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-end pt-ios-md">
                    <IOSButton
                      type="submit"
                      disabled={isSavingProfile}
                      variant="primary"
                      size="lg"
                      loading={isSavingProfile}
                    >
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </IOSButton>
                  </div>
                </div>
              </IOSCard>
            </form>

            {/* Change Password */}
            <IOSCard blur padding="lg" className="animate-ios-slide-up" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center gap-ios-sm mb-ios-lg">
                <Lock className="w-5 h-5 text-ios-blue-500" />
                <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white">
                  Security
                </h2>
              </div>

              {!showPasswordForm ? (
                <IOSButton
                  onClick={() => setShowPasswordForm(true)}
                  variant="secondary"
                  size="md"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </IOSButton>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-ios-md">
                  <IOSInput
                    label="Current Password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    leftIcon={<Lock className="w-5 h-5" />}
                    showPasswordToggle
                  />

                  <IOSInput
                    label="New Password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                    leftIcon={<Lock className="w-5 h-5" />}
                    showPasswordToggle
                  />

                  <IOSInput
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    leftIcon={<Lock className="w-5 h-5" />}
                    showPasswordToggle
                  />

                  <div className="flex gap-ios-sm pt-ios-md">
                    <IOSButton
                      type="submit"
                      disabled={isSavingPassword}
                      variant="primary"
                      size="md"
                      loading={isSavingPassword}
                      className="flex-1"
                    >
                      {isSavingPassword ? 'Changing...' : 'Change Password'}
                    </IOSButton>
                    <IOSButton
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      variant="ghost"
                      size="md"
                      className="flex-1"
                    >
                      Cancel
                    </IOSButton>
                  </div>
                </form>
              )}
            </IOSCard>

            {/* Upgrade to Seller */}
            {user?.role === 'BUYER' && (
              <IOSCard padding="lg" className="bg-gradient-to-br from-ios-blue-500 to-ios-purple-600 border-0 animate-ios-scale-in" style={{ animationDelay: '100ms' }}>
                <div className="text-white">
                  <h2 className="text-ios-title2 font-bold mb-ios-sm">Become a Seller</h2>
                  <p className="text-ios-body text-white/90 mb-ios-lg">
                    Start selling your digital products and reach thousands of buyers
                  </p>
                  <Link href="/dashboard/upgrade-to-seller">
                    <IOSButton variant="secondary" size="lg">
                      <Package className="w-4 h-4" />
                      Upgrade Now
                    </IOSButton>
                  </Link>
                </div>
              </IOSCard>
            )}

            {/* Danger Zone */}
            <IOSCard blur padding="lg" className="border-2 border-ios-red-200 dark:border-ios-red-800 animate-ios-slide-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-ios-sm mb-ios-lg">
                <AlertTriangle className="w-5 h-5 text-ios-red-500" />
                <h2 className="text-ios-title2 font-bold text-ios-red-600 dark:text-ios-red-400">
                  Danger Zone
                </h2>
              </div>
              <p className="text-ios-footnote text-ios-gray-600 dark:text-ios-gray-400 mb-ios-lg">
                Once you delete your account, there is no going back. Please be certain.
              </p>

              {!showDeleteConfirm ? (
                <IOSButton
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="danger"
                  size="md"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Delete Account
                </IOSButton>
              ) : (
                <div className="space-y-ios-md">
                  <p className="text-ios-footnote font-semibold text-gray-900 dark:text-white">
                    Enter your password to confirm account deletion:
                  </p>
                  <IOSInput
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    leftIcon={<Lock className="w-5 h-5" />}
                    showPasswordToggle
                  />
                  <div className="flex gap-ios-sm">
                    <IOSButton
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || !deletePassword}
                      variant="danger"
                      size="md"
                      loading={isDeleting}
                      className="flex-1"
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </IOSButton>
                    <IOSButton
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                      }}
                      variant="ghost"
                      size="md"
                      className="flex-1"
                    >
                      Cancel
                    </IOSButton>
                  </div>
                </div>
              )}
            </IOSCard>
          </div>
        </div>
      </main>
    </div>
  );
}
