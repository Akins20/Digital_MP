'use client';

import { useState } from 'react';
import { IOSCard, IOSInput, IOSButton } from '@/components/ios';
import {
  Search,
  BookOpen,
  CreditCard,
  Upload,
  ShoppingCart,
  Settings,
  MessageSquare,
  FileText,
  Shield,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn the basics of DigitalDock',
      articles: [
        { title: 'Creating your account', href: '#' },
        { title: 'Setting up your seller profile', href: '#' },
        { title: 'Understanding the dashboard', href: '#' },
        { title: 'First time buyer guide', href: '#' },
      ],
    },
    {
      icon: Upload,
      title: 'Selling Products',
      description: 'Everything about listing and managing products',
      articles: [
        { title: 'How to create your first product listing', href: '#' },
        { title: 'Supported file types and sizes', href: '#' },
        { title: 'Writing effective product descriptions', href: '#' },
        { title: 'Pricing strategies for digital products', href: '#' },
        { title: 'Managing product updates and versions', href: '#' },
      ],
    },
    {
      icon: CreditCard,
      title: 'Payments & Payouts',
      description: 'Payment processing and withdrawals',
      articles: [
        { title: 'How payments work on DigitalDock', href: '#' },
        { title: 'Understanding commission rates', href: '#' },
        { title: 'Setting up your payout account', href: '#' },
        { title: 'Payout schedule and minimum thresholds', href: '#' },
        { title: 'Handling refunds and chargebacks', href: '#' },
      ],
    },
    {
      icon: ShoppingCart,
      title: 'Buying Products',
      description: 'Making purchases and downloads',
      articles: [
        { title: 'How to purchase digital products', href: '#' },
        { title: 'Downloading your purchased files', href: '#' },
        { title: 'Accessing your purchase history', href: '#' },
        { title: 'Requesting refunds', href: '#' },
      ],
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Keeping your account safe',
      articles: [
        { title: 'Account security best practices', href: '#' },
        { title: 'Two-factor authentication setup', href: '#' },
        { title: 'Privacy settings and data control', href: '#' },
        { title: 'Reporting suspicious activity', href: '#' },
      ],
    },
    {
      icon: Settings,
      title: 'Account Management',
      description: 'Managing your account settings',
      articles: [
        { title: 'Updating profile information', href: '#' },
        { title: 'Changing your password', href: '#' },
        { title: 'Email preferences and notifications', href: '#' },
        { title: 'Closing your account', href: '#' },
      ],
    },
  ];

  const popularArticles = [
    {
      title: 'How do I upload my first product?',
      excerpt: 'Step-by-step guide to creating and publishing your first digital product listing.',
      views: '12.5k views',
    },
    {
      title: 'What file types are supported?',
      excerpt: 'Complete list of supported file formats including archives, documents, media, and more.',
      views: '8.2k views',
    },
    {
      title: 'When will I receive my payout?',
      excerpt: 'Understanding the payout schedule, processing times, and minimum thresholds.',
      views: '6.8k views',
    },
    {
      title: 'How do refunds work?',
      excerpt: 'Learn about our refund policy, eligibility criteria, and the refund process.',
      views: '5.3k views',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/10">
      <div className="bg-gradient-to-r from-ios-blue-600 to-ios-teal-600 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl text-center">
          <h1 className="text-ios-large-title font-bold text-white mb-ios-sm">Help Center</h1>
          <p className="text-ios-title3 text-white/90 mb-ios-lg max-w-2xl mx-auto">
            Find answers to your questions and learn how to make the most of DigitalDock
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-ios-md py-ios-sm rounded-ios-lg bg-white dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl -mt-8">
        <IOSCard blur padding="lg" className="mb-ios-lg">
          <h2 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-md">
            Popular Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-ios-md">
            {popularArticles.map((article, i) => (
              <Link key={i} href="#" className="group">
                <div className="p-ios-md rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800/50 hover:bg-ios-blue-50 dark:hover:bg-ios-blue-900/20 transition-colors">
                  <div className="flex items-start gap-ios-sm mb-ios-sm">
                    <FileText className="w-5 h-5 text-ios-blue-500 flex-shrink-0 mt-0.5" />
                    <h3 className="text-ios-body font-semibold text-gray-900 dark:text-white group-hover:text-ios-blue-600 dark:group-hover:text-ios-blue-400 transition-colors">
                      {article.title}
                    </h3>
                  </div>
                  <p className="text-ios-footnote text-gray-600 dark:text-gray-400 mb-ios-xs">
                    {article.excerpt}
                  </p>
                  <p className="text-ios-caption1 text-gray-500">
                    {article.views}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </IOSCard>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-ios-md mb-ios-lg">
          {categories.map((category, i) => (
            <IOSCard key={i} blur padding="md">
              <div className="flex items-center gap-ios-sm mb-ios-md">
                <div className="w-12 h-12 bg-gradient-to-br from-ios-blue-500 to-ios-teal-500 rounded-ios-lg flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-ios-title3 font-bold text-gray-900 dark:text-white">
                    {category.title}
                  </h3>
                  <p className="text-ios-caption1 text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="space-y-ios-sm">
                {category.articles.map((article, j) => (
                  <Link
                    key={j}
                    href={article.href}
                    className="block text-ios-footnote text-ios-blue-600 dark:text-ios-blue-400 hover:underline"
                  >
                    {article.title}
                  </Link>
                ))}
              </div>
            </IOSCard>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-ios-md">
          <IOSCard blur padding="lg">
            <div className="flex items-start gap-ios-md">
              <div className="w-12 h-12 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-ios-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-sm">
                  Contact Support
                </h3>
                <p className="text-ios-body text-gray-700 dark:text-gray-300 mb-ios-md">
                  Can't find what you're looking for? Our support team is here to help you 24/7.
                </p>
                <Link href="/contact">
                  <IOSButton variant="primary" size="md">
                    Get in Touch
                  </IOSButton>
                </Link>
              </div>
            </div>
          </IOSCard>

          <IOSCard blur padding="lg">
            <div className="flex items-start gap-ios-md">
              <div className="w-12 h-12 bg-gradient-to-br from-ios-purple-500 to-ios-pink-500 rounded-ios-lg flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-sm">
                  Visit FAQ
                </h3>
                <p className="text-ios-body text-gray-700 dark:text-gray-300 mb-ios-md">
                  Quick answers to the most frequently asked questions about DigitalDock.
                </p>
                <Link href="/faq">
                  <IOSButton variant="secondary" size="md">
                    View FAQs
                  </IOSButton>
                </Link>
              </div>
            </div>
          </IOSCard>
        </div>
      </div>
    </div>
  );
}
