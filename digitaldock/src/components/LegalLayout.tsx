'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IOSButton, IOSCard } from '@/components/ios';
import { FileText, Scale, Shield, Users, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';

const legalPages = [
  { href: '/legal/terms', label: 'Terms of Service', icon: FileText },
  { href: '/legal/privacy', label: 'Privacy Policy', icon: Shield },
  { href: '/legal/refund', label: 'Refund Policy', icon: AlertCircle },
  { href: '/legal/seller-agreement', label: 'Seller Agreement', icon: Users },
  { href: '/legal/content-guidelines', label: 'Content Guidelines', icon: Scale },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-blue-900/10">
      {/* Page Title */}
      <div className="bg-gradient-to-r from-ios-blue-600 to-ios-purple-600 dark:from-ios-blue-700 dark:to-ios-purple-700 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl">
          <h1 className="text-ios-large-title font-bold text-white mb-ios-xs animate-ios-fade-in">
            Legal & Policies
          </h1>
          <p className="text-ios-body text-white/90 animate-ios-fade-in" style={{ animationDelay: '100ms' }}>
            Our legal documents and policies governing the use of DigitalDock
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl -mt-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-ios-md">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 mb-ios-lg lg:mb-0">
            <IOSCard blur padding="sm" className="sticky top-24 animate-ios-fade-in">
              <h2 className="text-ios-title3 font-bold text-gray-900 dark:text-white mb-ios-sm px-ios-sm">
                Legal Documents
              </h2>
              <nav className="space-y-1">
                {legalPages.map((page, index) => {
                  const isActive = pathname === page.href;
                  const Icon = page.icon;
                  return (
                    <Link
                      key={page.href}
                      href={page.href}
                      className={`flex items-center gap-ios-sm px-ios-sm py-ios-xs rounded-ios-md text-ios-footnote font-medium transition-all ${
                        isActive
                          ? 'bg-ios-blue-100 dark:bg-ios-blue-900/30 text-ios-blue-700 dark:text-ios-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">{page.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </IOSCard>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            <IOSCard blur padding="lg" className="shadow-ios-md animate-ios-slide-up">
              <article className="prose prose-blue dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-ios-large-title prose-h2:text-ios-title1 prose-h3:text-ios-title2 prose-p:text-ios-footnote prose-li:text-ios-footnote prose-a:text-ios-blue-600 dark:prose-a:text-ios-blue-400">
                {children}
              </article>
            </IOSCard>

            {/* Contact Info */}
            <IOSCard
              blur
              padding="md"
              className="mt-ios-md bg-ios-blue-50/80 dark:bg-ios-blue-900/20 border-ios-blue-200 dark:border-ios-blue-800 animate-ios-fade-in"
            >
              <div className="flex items-start gap-ios-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-ios-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-ios-footnote font-bold text-ios-blue-900 dark:text-ios-blue-300 mb-ios-xs">
                    Questions about our policies?
                  </h3>
                  <p className="text-ios-caption1 text-ios-blue-800 dark:text-ios-blue-400">
                    If you have any questions about our legal documents, please contact us at{' '}
                    <a href="mailto:legal@digitaldock.co" className="underline font-semibold hover:text-ios-blue-600">
                      legal@digitaldock.co
                    </a>
                  </p>
                </div>
              </div>
            </IOSCard>
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
