'use client';

/**
 * Footer Component
 * iOS-styled footer for the entire application
 */

import Link from 'next/link';
import { Mail, Twitter, Github, Linkedin, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Marketplace', href: '/marketplace' },
      { label: 'Features', href: '/#features' },
      { label: 'How It Works', href: '/#how-it-works' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Community', href: '/community' },
    ],
    legal: [
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Refund Policy', href: '/legal/refund' },
      { label: 'Seller Agreement', href: '/legal/seller-agreement' },
      { label: 'Content Guidelines', href: '/legal/content-guidelines' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/digitaldock', label: 'Twitter' },
    { icon: Facebook, href: 'https://facebook.com/digitaldock', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/digitaldock', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/digitaldock', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com/digitaldock', label: 'GitHub' },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-ios-orange-900/20 dark:from-black dark:via-black dark:to-ios-orange-950/30 text-white">
      <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-2xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-ios-lg pb-ios-xl border-b border-white/10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="inline-block">
              <h3 className="text-ios-title1 font-bold bg-gradient-to-r from-ios-orange-400 to-ios-orange-600 bg-clip-text text-transparent mb-ios-sm">
                DigitalDock
              </h3>
            </Link>
            <p className="text-ios-footnote text-gray-400 mb-ios-md leading-relaxed">
              The marketplace for digital creators. Buy and sell digital products with ease.
            </p>

            {/* Newsletter */}
            <div className="mb-ios-md">
              <label className="block text-ios-caption1 font-semibold text-gray-300 mb-ios-xs">
                Stay Updated
              </label>
              <div className="flex gap-ios-xs">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-ios-sm py-ios-xs rounded-ios-md bg-white/10 border border-white/20 text-ios-caption1 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-orange-500/50 focus:border-ios-orange-500"
                />
                <button className="px-ios-sm py-ios-xs bg-gradient-to-r from-ios-orange-500 to-ios-orange-600 hover:from-ios-orange-600 hover:to-ios-orange-700 rounded-ios-md text-ios-caption1 font-semibold transition-all active:scale-95">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-ios-xs">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-8 h-8 rounded-ios-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-ios-footnote font-bold text-white mb-ios-sm">Product</h4>
            <ul className="space-y-ios-xs">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ios-caption1 text-gray-400 hover:text-ios-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-ios-footnote font-bold text-white mb-ios-sm">Company</h4>
            <ul className="space-y-ios-xs">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ios-caption1 text-gray-400 hover:text-ios-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-ios-footnote font-bold text-white mb-ios-sm">Support</h4>
            <ul className="space-y-ios-xs">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ios-caption1 text-gray-400 hover:text-ios-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-ios-footnote font-bold text-white mb-ios-sm">Legal</h4>
            <ul className="space-y-ios-xs">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ios-caption1 text-gray-400 hover:text-ios-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-ios-lg flex flex-col md:flex-row justify-between items-center gap-ios-sm">
          <p className="text-ios-caption1 text-gray-400">
            © {currentYear} DigitalDock. All rights reserved.
          </p>

          <div className="flex items-center gap-ios-md">
            <a
              href="mailto:support@digitaldock.co"
              className="flex items-center gap-ios-xs text-ios-caption1 text-gray-400 hover:text-ios-orange-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>support@digitaldock.co</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
