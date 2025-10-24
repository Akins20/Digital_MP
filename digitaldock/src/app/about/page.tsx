'use client';

import { IOSCard } from '@/components/ios';
import Footer from '@/components/Footer';
import { Users, Target, Award, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-purple-900/10">
      <div className="bg-gradient-to-r from-ios-blue-600 to-ios-purple-600 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl">
          <h1 className="text-ios-large-title font-bold text-white mb-ios-sm">About DigitalDock</h1>
          <p className="text-ios-title3 text-white/90">Empowering digital creators worldwide</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl -mt-8">
        <IOSCard blur padding="lg" className="mb-ios-lg">
          <h2 className="text-ios-title1 font-bold text-gray-900 dark:text-white mb-ios-md">Our Mission</h2>
          <p className="text-ios-body text-gray-700 dark:text-gray-300 leading-relaxed">
            DigitalDock is a marketplace built for digital creators by digital creators. We believe in empowering creators
            to monetize their work while providing buyers with high-quality digital products at fair prices.
          </p>
        </IOSCard>

        <div className="grid md:grid-cols-2 gap-ios-md mb-ios-lg">
          {[
            { icon: Users, title: 'Creator First', desc: 'Built with creators in mind' },
            { icon: Target, title: 'Quality Focus', desc: 'High standards for all products' },
            { icon: Award, title: 'Fair Pricing', desc: 'Low fees, fair commissions' },
            { icon: Heart, title: 'Community', desc: 'Supporting creative communities' },
          ].map((item, i) => (
            <IOSCard key={i} blur padding="md">
              <div className="flex items-start gap-ios-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-ios-blue-500 to-ios-purple-500 rounded-ios-lg flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-ios-title3 font-bold text-gray-900 dark:text-white mb-ios-xs">{item.title}</h3>
                  <p className="text-ios-footnote text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            </IOSCard>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
