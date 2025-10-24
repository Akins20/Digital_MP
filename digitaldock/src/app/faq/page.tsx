'use client';

import { useState } from 'react';
import { IOSCard } from '@/components/ios';
import { ChevronDown, Search } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      category: 'General',
      questions: [
        {
          question: 'What is DigitalDock?',
          answer: 'DigitalDock is a digital product marketplace that connects creators with buyers. We provide a platform where you can sell digital products like templates, graphics, ebooks, software, courses, and more. Our mission is to empower digital creators to monetize their work while providing buyers with high-quality digital products.'
        },
        {
          question: 'Is DigitalDock free to use?',
          answer: 'Yes! DigitalDock is completely free to join and use. We only charge a small commission (10%) on successful sales. There are no monthly fees, listing fees, or hidden charges. You only pay when you make a sale.'
        },
        {
          question: 'How do I get started?',
          answer: 'Getting started is easy! Simply create a free account, complete your seller profile, and you can start listing your digital products immediately. For buyers, you can browse and purchase products without creating an account, though we recommend creating one to access your purchase history and downloads.'
        },
        {
          question: 'What makes DigitalDock different?',
          answer: 'DigitalDock stands out with our creator-first approach, fair commission rates (only 10%), comprehensive file format support, iOS-inspired beautiful design, secure payment processing, and dedicated customer support. We focus on building a community rather than just a marketplace.'
        },
      ],
    },
    {
      category: 'Selling',
      questions: [
        {
          question: 'What can I sell on DigitalDock?',
          answer: 'You can sell any digital product including: design templates, graphics and illustrations, fonts, photography, UI kits, themes, plugins, ebooks, courses, music, sound effects, 3D models, code snippets, spreadsheets, and much more. As long as it\'s digital and you have the rights to sell it, you can list it on DigitalDock.'
        },
        {
          question: 'What file types are supported?',
          answer: 'We support over 110 file types including all major formats. This includes archives (ZIP, 7Z, RAR), documents (PDF, DOCX), images (JPG, PNG, SVG), videos (MP4, MOV), audio (MP3, WAV), 3D files (OBJ, FBX), executables (EXE, DMG), and many more. Files can be up to 500MB each.'
        },
        {
          question: 'How do I price my products?',
          answer: 'Pricing is entirely up to you. We recommend researching similar products in the marketplace to understand competitive pricing. Consider your product\'s value, quality, file size, and included bonuses. You can offer promotional pricing, bundle discounts, and adjust prices anytime from your dashboard.'
        },
        {
          question: 'Can I update my products after listing?',
          answer: 'Absolutely! You can update your product at any time - including the files, description, images, pricing, and tags. Buyers who previously purchased your product will be notified of updates and can download the latest version. This is perfect for bug fixes, improvements, or adding new features.'
        },
        {
          question: 'How long does it take for my product to go live?',
          answer: 'Products are published instantly and appear in the marketplace immediately. However, we reserve the right to review products and may remove listings that violate our content guidelines. Make sure your product description is accurate and your files are complete before publishing.'
        },
      ],
    },
    {
      category: 'Payments & Payouts',
      questions: [
        {
          question: 'How do I get paid?',
          answer: 'We process payouts weekly via Paystack to your connected bank account. Funds are held for 14 days after the sale to protect against chargebacks and fraud. Once the holding period is over, your earnings are automatically added to your available balance and included in the next weekly payout.'
        },
        {
          question: 'What is the commission rate?',
          answer: 'DigitalDock charges a flat 10% commission on all sales. This is significantly lower than many competitors. Additionally, standard payment processing fees apply (typically 2.9% + $0.30 per transaction). For example, on a $100 sale, you\'d receive approximately $87 after all fees.'
        },
        {
          question: 'What is the minimum payout threshold?',
          answer: 'The minimum payout threshold is $50. Once your available balance reaches $50, it will be included in the next weekly payout. If your balance is below $50, it will roll over to the following week until you reach the minimum threshold.'
        },
        {
          question: 'Which payment methods do you accept?',
          answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as various local payment methods depending on your region. All payments are securely processed through Paystack, our trusted payment partner.'
        },
        {
          question: 'Can I offer refunds?',
          answer: 'Yes, you can offer refunds at your discretion. Our refund policy allows buyers to request refunds within 30 days if the product doesn\'t match the description or has technical issues. As a seller, you can approve or deny refund requests. Approved refunds are deducted from your next payout.'
        },
      ],
    },
    {
      category: 'Buying',
      questions: [
        {
          question: 'How do I purchase a product?',
          answer: 'Simply browse the marketplace, click on a product you\'re interested in, review the details, and click "Purchase". You\'ll be taken to our secure checkout page powered by Paystack. After completing payment, you\'ll immediately receive download links via email and in your account dashboard.'
        },
        {
          question: 'Can I download my purchases again?',
          answer: 'Yes! All your purchases are stored in your account dashboard under "My Purchases". You can re-download them anytime, and you\'ll always have access to the latest version if the seller updates the product. We recommend keeping backups of important files.'
        },
        {
          question: 'What if a product doesn\'t work?',
          answer: 'First, contact the seller directly through their product page - most issues can be resolved quickly. If you don\'t receive a satisfactory response within 48 hours, or if the product doesn\'t match the description, you can request a refund through your purchase page. Our team will review the case and ensure a fair resolution.'
        },
        {
          question: 'Are the products safe to download?',
          answer: 'We take security seriously. All files are scanned for malware and viruses before being made available. Additionally, our content guidelines prohibit malicious software. However, we always recommend using antivirus software and exercising caution when downloading and running any files from the internet.'
        },
        {
          question: 'Can I use purchased products commercially?',
          answer: 'License terms vary by product and are set by the seller. Always check the product description and license information before purchasing. Common license types include personal use only, commercial use allowed, and extended commercial licenses. If unclear, contact the seller before purchasing.'
        },
      ],
    },
    {
      category: 'Account & Security',
      questions: [
        {
          question: 'How do I reset my password?',
          answer: 'Click the "Forgot Password" link on the login page. Enter your email address, and we\'ll send you a secure link to reset your password. The link expires after 1 hour for security purposes. If you don\'t receive the email, check your spam folder or contact support.'
        },
        {
          question: 'Is my payment information secure?',
          answer: 'Absolutely. We never store your full credit card information on our servers. All payment data is securely processed and stored by Paystack, which is PCI DSS Level 1 certified - the highest level of payment security. Your financial information is encrypted and protected using industry-standard security measures.'
        },
        {
          question: 'Can I change my email address?',
          answer: 'Yes, you can update your email address from your account settings. After changing your email, you\'ll need to verify the new address by clicking the confirmation link we send you. This ensures account security and helps prevent unauthorized access.'
        },
        {
          question: 'How do I delete my account?',
          answer: 'You can delete your account from the settings page. Please note that this action is permanent and cannot be undone. All your products will be delisted, and your account data will be removed. You should withdraw any remaining balance and backup your purchase downloads before deleting your account.'
        },
        {
          question: 'Do you offer two-factor authentication?',
          answer: 'Yes! We highly recommend enabling two-factor authentication (2FA) for added security. You can set this up in your account security settings. Once enabled, you\'ll need both your password and a time-based code from your authenticator app to log in.'
        },
      ],
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          question: 'Why can\'t I upload my file?',
          answer: 'File upload issues are usually caused by: 1) File size exceeding 500MB limit, 2) Unsupported file type (though we support 110+ formats), 3) Poor internet connection, or 4) Browser issues. Try using a modern browser (Chrome, Firefox, Safari, Edge), clearing your cache, or compressing large files into a ZIP archive.'
        },
        {
          question: 'My download is failing or incomplete',
          answer: 'Download issues are typically related to internet connectivity. Try: 1) Using a stable internet connection, 2) Disabling browser extensions that might interfere, 3) Using a download manager for large files, or 4) Trying a different browser. If the problem persists, contact support with details about the error.'
        },
        {
          question: 'Why can\'t I see my product in the marketplace?',
          answer: 'Ensure your product is published (not in draft status). Check that it doesn\'t violate our content guidelines. Clear your browser cache or try viewing in an incognito/private window. Products appear immediately after publishing, but search indexing may take a few minutes. If it\'s still not visible after 1 hour, contact support.'
        },
        {
          question: 'The website isn\'t loading properly',
          answer: 'Try these troubleshooting steps: 1) Clear your browser cache and cookies, 2) Disable browser extensions, 3) Try a different browser or device, 4) Check our status page to see if there are any ongoing issues. If problems persist, take a screenshot and contact our support team.'
        },
      ],
    },
  ];

  const allQuestions = faqCategories.flatMap((cat, catIndex) =>
    cat.questions.map((q, qIndex) => ({
      ...q,
      category: cat.category,
      index: catIndex * 100 + qIndex,
    }))
  );

  const filteredQuestions = searchQuery
    ? allQuestions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ios-gray-50 via-white to-ios-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-ios-purple-900/10">
      <div className="bg-gradient-to-r from-ios-purple-600 to-ios-pink-600 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl text-center">
          <h1 className="text-ios-large-title font-bold text-white mb-ios-sm">
            Frequently Asked Questions
          </h1>
          <p className="text-ios-title3 text-white/90 mb-ios-lg max-w-2xl mx-auto">
            Find quick answers to common questions about DigitalDock
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-12 pr-ios-md py-ios-sm rounded-ios-lg bg-white dark:bg-ios-gray-800 border-2 border-transparent text-ios-body text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-ios-md sm:px-ios-lg lg:px-ios-xl py-ios-xl -mt-8">
        {filteredQuestions ? (
          // Search Results
          <IOSCard blur padding="lg">
            <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-md">
              Search Results ({filteredQuestions.length})
            </h2>
            {filteredQuestions.length === 0 ? (
              <p className="text-ios-body text-gray-600 dark:text-gray-400 text-center py-ios-lg">
                No questions found matching "{searchQuery}". Try different keywords or browse all categories below.
              </p>
            ) : (
              <div className="space-y-ios-sm">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.index}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-ios-sm"
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === q.index ? null : q.index)}
                      className="w-full text-left flex items-start justify-between gap-ios-sm py-ios-sm group"
                    >
                      <div>
                        <span className="text-ios-caption1 text-ios-purple-600 dark:text-ios-purple-400 font-semibold">
                          {q.category}
                        </span>
                        <h3 className="text-ios-body font-semibold text-gray-900 dark:text-white group-hover:text-ios-purple-600 dark:group-hover:text-ios-purple-400 transition-colors">
                          {q.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                          openIndex === q.index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openIndex === q.index && (
                      <div className="pl-ios-sm pr-ios-xl pb-ios-sm">
                        <p className="text-ios-footnote text-gray-700 dark:text-gray-300 leading-relaxed">
                          {q.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </IOSCard>
        ) : (
          // Category View
          <div className="space-y-ios-lg">
            {faqCategories.map((category, catIndex) => (
              <IOSCard key={catIndex} blur padding="lg">
                <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-md">
                  {category.category}
                </h2>
                <div className="space-y-ios-sm">
                  {category.questions.map((q, qIndex) => {
                    const questionIndex = catIndex * 100 + qIndex;
                    return (
                      <div
                        key={qIndex}
                        className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-ios-sm"
                      >
                        <button
                          onClick={() =>
                            setOpenIndex(openIndex === questionIndex ? null : questionIndex)
                          }
                          className="w-full text-left flex items-start justify-between gap-ios-sm py-ios-sm group"
                        >
                          <h3 className="text-ios-body font-semibold text-gray-900 dark:text-white group-hover:text-ios-purple-600 dark:group-hover:text-ios-purple-400 transition-colors">
                            {q.question}
                          </h3>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                              openIndex === questionIndex ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {openIndex === questionIndex && (
                          <div className="pl-ios-sm pr-ios-xl pb-ios-sm">
                            <p className="text-ios-footnote text-gray-700 dark:text-gray-300 leading-relaxed">
                              {q.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </IOSCard>
            ))}
          </div>
        )}

        <IOSCard blur padding="lg" className="mt-ios-lg text-center">
          <h2 className="text-ios-title2 font-bold text-gray-900 dark:text-white mb-ios-sm">
            Still have questions?
          </h2>
          <p className="text-ios-body text-gray-700 dark:text-gray-300 mb-ios-md">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block px-ios-lg py-ios-sm bg-gradient-to-r from-ios-purple-500 to-ios-pink-500 hover:from-ios-purple-600 hover:to-ios-pink-600 text-white rounded-ios-lg font-semibold transition-all active:scale-95"
          >
            Contact Support
          </a>
        </IOSCard>
      </div>
    </div>
  );
}
