import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Seller Agreement | DigitalDock',
  description: 'Terms and conditions for sellers on DigitalDock marketplace',
};

export default function SellerAgreementPage() {
  return (
    <LegalLayout>
      <h1>SELLER AGREEMENT</h1>
      <p><strong>Last Updated: October 23, 2025</strong></p>

      <p>This Seller Agreement governs your use of DigitalDock as a seller of digital products.</p>

      <h2>1. Seller Obligations</h2>
      <ul>
        <li>Provide accurate product descriptions</li>
        <li>Deliver functional, complete digital files</li>
        <li>Respond to customer inquiries within 48 hours</li>
        <li>Maintain product quality standards</li>
        <li>Respect intellectual property rights</li>
      </ul>

      <h2>2. Commission Structure</h2>
      <p>DigitalDock charges a 10% commission on each sale, plus payment processing fees.</p>

      <h2>3. Payout Terms</h2>
      <ul>
        <li>Payouts processed weekly</li>
        <li>Minimum payout threshold: $50</li>
        <li>Funds held for 14 days after sale (chargeback protection)</li>
      </ul>

      <h2>4. Prohibited Products</h2>
      <ul>
        <li>Pirated or stolen content</li>
        <li>Malicious software or viruses</li>
        <li>Illegal or harmful content</li>
        <li>Products violating third-party rights</li>
      </ul>

      <p className="text-sm text-gray-500 mt-8">© 2025 DigitalDock. All rights reserved.</p>
    </LegalLayout>
  );
}
