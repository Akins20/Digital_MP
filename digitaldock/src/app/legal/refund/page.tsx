import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Refund Policy | DigitalDock',
  description: 'Refund and return policy for digital products on DigitalDock',
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout>
      <h1>REFUND POLICY</h1>
      <p><strong>Last Updated: October 23, 2025</strong></p>

      <p>All digital product sales are generally final. However, refunds are available for technical issues, misrepresentation, or duplicate purchases within 7 days of purchase.</p>

      <h2>1. Eligible Refund Scenarios</h2>
      <ul>
        <li>Corrupted or incomplete files</li>
        <li>Product differs significantly from description</li>
        <li>Technical defects preventing use</li>
        <li>Duplicate accidental purchases (within 24 hours)</li>
      </ul>

      <h2>2. How to Request a Refund</h2>
      <p>Contact <a href="mailto:refunds@digitaldock.co">refunds@digitaldock.co</a> with your order ID and reason for refund.</p>

      <p className="text-sm text-gray-500 mt-8">© 2025 DigitalDock. All rights reserved.</p>
    </LegalLayout>
  );
}
