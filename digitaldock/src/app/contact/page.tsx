'use client';

import { IOSCard, IOSInput, IOSButton } from '@/components/ios';
import { Mail, MessageSquare, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-green-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-green-900/10">
      <div className="bg-gradient-to-r from-ios-green-600 to-ios-teal-600 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl">
          <h1 className="text-ios-large-title font-bold text-white mb-ios-sm">Contact Us</h1>
          <p className="text-ios-title3 text-white/90">We&apos;d love to hear from you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl -mt-8">
        <div className="grid md:grid-cols-3 gap-ios-md mb-ios-lg">
          {[
            { icon: Mail, title: 'Email', value: 'support@digitaldock.co' },
            { icon: MessageSquare, title: 'Live Chat', value: 'Available 24/7' },
            { icon: Phone, title: 'Phone', value: '+1 (555) 123-4567' },
          ].map((item, i) => (
            <IOSCard key={i} blur padding="md" className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-ios-green-500 to-ios-teal-500 rounded-ios-lg flex items-center justify-center mx-auto mb-ios-sm">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-ios-footnote font-bold text-gray-900 dark:text-white mb-ios-xs">{item.title}</h3>
              <p className="text-ios-caption1 text-gray-600 dark:text-gray-400">{item.value}</p>
            </IOSCard>
          ))}
        </div>

        <IOSCard blur padding="lg">
          <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-md">Send us a message</h2>
          <form className="space-y-ios-md">
            <div className="grid md:grid-cols-2 gap-ios-md">
              <IOSInput label="Name" type="text" placeholder="Your name" />
              <IOSInput label="Email" type="email" placeholder="your@email.com" />
            </div>
            <IOSInput label="Subject" type="text" placeholder="How can we help?" />
            <div>
              <label className="block text-ios-footnote font-semibold text-gray-700 dark:text-gray-300 mb-ios-xs">Message</label>
              <textarea
                rows={6}
                className="w-full px-ios-md py-ios-sm rounded-ios-lg bg-ios-gray-50 dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-ios-gray-400 focus:outline-none focus:ring-2 focus:ring-ios-green-500/50 focus:border-ios-green-500 transition-all resize-none"
                placeholder="Tell us more..."
              />
            </div>
            <IOSButton variant="primary" size="lg" fullWidth>Send Message</IOSButton>
          </form>
        </IOSCard>
      </div>
    </div>
  );
}
