'use client';

import { IOSCard, IOSBadge, IOSButton } from '@/components/ios';
import {
  Users,
  MessageCircle,
  Trophy,
  Zap,
  Heart,
  Star,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Gift,
} from 'lucide-react';

export default function CommunityPage() {
  const stats = [
    { label: 'Active Creators', value: '12,500+', icon: Users },
    { label: 'Products Listed', value: '45,000+', icon: Star },
    { label: 'Total Sales', value: '$2.5M+', icon: TrendingUp },
    { label: 'Community Members', value: '50,000+', icon: Heart },
  ];

  const features = [
    {
      icon: MessageCircle,
      title: 'Discussion Forums',
      description: 'Connect with fellow creators, ask questions, and share your knowledge in our active community forums.',
      badge: 'Coming Soon',
    },
    {
      icon: Lightbulb,
      title: 'Creator Showcase',
      description: 'Get featured in our weekly creator spotlight and showcase your best products to thousands of buyers.',
      badge: 'Active',
    },
    {
      icon: BookOpen,
      title: 'Learning Resources',
      description: 'Access free tutorials, guides, and best practices from successful sellers in the marketplace.',
      badge: 'Active',
    },
    {
      icon: Trophy,
      title: 'Monthly Challenges',
      description: 'Participate in themed creation challenges, win prizes, and get recognition for your work.',
      badge: 'Coming Soon',
    },
    {
      icon: Zap,
      title: 'Beta Features',
      description: 'Active community members get early access to new features and tools before public release.',
      badge: 'Exclusive',
    },
    {
      icon: Gift,
      title: 'Rewards Program',
      description: 'Earn points for engagement, referrals, and quality products. Redeem for platform credits and perks.',
      badge: 'Coming Soon',
    },
  ];

  const topCreators = [
    {
      name: 'Sarah Chen',
      avatar: 'SC',
      specialty: 'UI/UX Designer',
      products: 127,
      sales: 3420,
      rating: 4.9,
    },
    {
      name: 'Marcus Johnson',
      avatar: 'MJ',
      specialty: 'Developer Tools',
      products: 89,
      sales: 2815,
      rating: 4.8,
    },
    {
      name: 'Elena Rodriguez',
      avatar: 'ER',
      specialty: 'Digital Art',
      products: 215,
      sales: 4102,
      rating: 5.0,
    },
    {
      name: 'David Kim',
      avatar: 'DK',
      specialty: 'Photography',
      products: 156,
      sales: 2390,
      rating: 4.9,
    },
  ];

  const guidelines = [
    {
      title: 'Be Respectful',
      description: 'Treat all community members with respect and kindness. Harassment and hate speech are not tolerated.',
    },
    {
      title: 'Share Knowledge',
      description: 'Help others learn and grow. Share your experiences, tips, and constructive feedback.',
    },
    {
      title: 'Stay On Topic',
      description: 'Keep discussions relevant to digital creation, selling, and the DigitalDock platform.',
    },
    {
      title: 'No Spam',
      description: 'Avoid excessive self-promotion. Share your work when relevant to the discussion.',
    },
    {
      title: 'Original Content',
      description: 'Only share products and content you have the rights to. Respect intellectual property.',
    },
    {
      title: 'Report Issues',
      description: 'Help us maintain a healthy community by reporting violations and suspicious activity.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-green-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-green-900/10">
      <div className="bg-gradient-to-r from-ios-green-600 to-ios-teal-600 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl text-center">
          <h1 className="text-ios-large-title font-bold text-white mb-ios-sm">
            Join Our Creator Community
          </h1>
          <p className="text-ios-title3 text-white/90 max-w-2xl mx-auto">
            Connect with thousands of digital creators, share knowledge, and grow together
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl -mt-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-ios-md mb-ios-lg">
          {stats.map((stat, i) => (
            <IOSCard key={i} blur padding="md" className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-ios-lg flex items-center justify-center mx-auto mb-ios-sm">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-xs">
                {stat.value}
              </div>
              <div className="text-ios-caption1 text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </IOSCard>
          ))}
        </div>

        {/* Features */}
        <IOSCard blur padding="lg" className="mb-ios-lg">
          <h2 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-md">
            Community Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-ios-md">
            {features.map((feature, i) => (
              <div key={i} className="p-ios-md rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800/50">
                <div className="flex items-start justify-between mb-ios-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-ios-md flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <IOSBadge
                    variant={
                      feature.badge === 'Active'
                        ? 'green'
                        : feature.badge === 'Exclusive'
                        ? 'blue'
                        : 'gray'
                    }
                  >
                    {feature.badge}
                  </IOSBadge>
                </div>
                <h3 className="text-ios-body font-bold text-gray-900 dark:text-white mb-ios-xs">
                  {feature.title}
                </h3>
                <p className="text-ios-footnote text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </IOSCard>

        {/* Top Creators */}
        <IOSCard blur padding="lg" className="mb-ios-lg">
          <h2 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-md">
            Featured Creators
          </h2>
          <div className="grid md:grid-cols-2 gap-ios-md">
            {topCreators.map((creator, i) => (
              <div
                key={i}
                className="flex items-center gap-ios-md p-ios-md rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800/50"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-ios-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-ios-title2 font-bold text-white">{creator.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-ios-body font-bold text-gray-900 dark:text-white mb-ios-xs">
                    {creator.name}
                  </h3>
                  <p className="text-ios-caption1 text-gray-600 dark:text-gray-400 mb-ios-xs">
                    {creator.specialty}
                  </p>
                  <div className="flex items-center gap-ios-md text-ios-caption1 text-gray-500 dark:text-gray-400">
                    <span>{creator.products} products</span>
                    <span>•</span>
                    <span>{creator.sales.toLocaleString()} sales</span>
                    <span>•</span>
                    <div className="flex items-center gap-ios-xs">
                      <Star className="w-3 h-3 fill-ios-yellow-500 text-ios-yellow-500" />
                      <span>{creator.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </IOSCard>

        {/* Community Guidelines */}
        <IOSCard blur padding="lg" className="mb-ios-lg">
          <h2 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-md">
            Community Guidelines
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-ios-md">
            {guidelines.map((guideline, i) => (
              <div key={i} className="flex items-start gap-ios-sm">
                <div className="w-2 h-2 rounded-full bg-ios-green-500 mt-2 flex-shrink-0" />
                <div>
                  <h3 className="text-ios-footnote font-semibold text-gray-900 dark:text-white mb-ios-xs">
                    {guideline.title}
                  </h3>
                  <p className="text-ios-caption1 text-gray-600 dark:text-gray-400">
                    {guideline.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </IOSCard>

        {/* CTA */}
        <IOSCard blur padding="lg" className="text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-sm">
              Ready to Join?
            </h2>
            <p className="text-ios-body text-gray-700 dark:text-gray-300 mb-ios-md">
              Create your free account today and become part of the fastest-growing digital creator community.
              Share your work, learn from others, and build your creative business.
            </p>
            <div className="flex flex-col sm:flex-row gap-ios-sm justify-center">
              <IOSButton variant="primary" size="lg">
                Create Account
              </IOSButton>
              <IOSButton variant="secondary" size="lg">
                Learn More
              </IOSButton>
            </div>
          </div>
        </IOSCard>
      </div>
    </div>
  );
}
