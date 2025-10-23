import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Refund Policy | DigitalDock',
  description: 'Refund Policy for DigitalDock digital marketplace - 7-day refund window and buyer protection',
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout>
      <h1>REFUND POLICY</h1>
      <p><strong>Last Updated: October 23, 2025</strong></p>

      <p>
        DigitalDock is committed to customer satisfaction. This Refund Policy outlines the terms and conditions for requesting refunds
        on digital product purchases made through our platform.
      </p>

      <h2>1. REFUND ELIGIBILITY</h2>

      <h3>1.1 Refund Window</h3>
      <p>
        You may request a refund within <strong>7 days</strong> of your purchase date. Refund requests submitted after this period
        will not be eligible for processing.
      </p>
      <p>The 7-day period begins at the time of successful payment confirmation, not the time of download.</p>

      <h3>1.2 Eligible Reasons for Refund</h3>
      <p>Refunds may be granted for the following reasons:</p>

      <p><strong>Product Not as Described:</strong></p>
      <ul>
        <li>Product does not match its description or preview images</li>
        <li>Missing files or incomplete product delivery</li>
        <li>Product fundamentally different from advertised features</li>
      </ul>

      <p><strong>Technical Issues:</strong></p>
      <ul>
        <li>Product files are corrupted or won&apos;t open</li>
        <li>Product is incompatible with specified software/platforms</li>
        <li>Product contains errors that prevent normal use</li>
        <li>Missing critical files or components</li>
      </ul>

      <p><strong>Duplicate Purchase:</strong></p>
      <ul>
        <li>Accidentally purchased the same product twice</li>
        <li>Already owned the product under a different account</li>
      </ul>

      <p><strong>Quality Issues:</strong></p>
      <ul>
        <li>Product is of significantly lower quality than represented</li>
        <li>Product contains broken links or non-functional elements</li>
        <li>Product lacks promised features or functionality</li>
      </ul>

      <h3>1.3 Non-Refundable Situations</h3>
      <p>Refunds will <strong>NOT</strong> be granted in the following cases:</p>

      <p><strong>After Download (with exceptions):</strong></p>
      <ul>
        <li>General policy: Downloaded products are non-refundable</li>
        <li><strong>Exception:</strong> Refunds may still be granted if product files are defective, corrupted, or do not match description (subject to verification)</li>
      </ul>

      <p><strong>Change of Mind:</strong></p>
      <ul>
        <li>You no longer want or need the product</li>
        <li>You found a better or cheaper alternative</li>
        <li>You didn&apos;t read the product description carefully</li>
      </ul>

      <p><strong>User Error:</strong></p>
      <ul>
        <li>You don&apos;t know how to use the product</li>
        <li>The product doesn&apos;t work with software/tools not specified in requirements</li>
        <li>You lack the technical skills needed to use the product</li>
        <li>You didn&apos;t check system requirements before purchase</li>
      </ul>

      <p><strong>External Factors:</strong></p>
      <ul>
        <li>Your payment method was charged (this is normal and not grounds for refund)</li>
        <li>You experienced buyer&apos;s remorse</li>
        <li>The product doesn&apos;t solve your specific problem (if not promised)</li>
      </ul>

      <p><strong>Abuse or Violation:</strong></p>
      <ul>
        <li>You violated our Terms of Service</li>
        <li>You attempt to resell or redistribute the product</li>
        <li>You make fraudulent refund claims</li>
        <li>You attempt multiple refunds of the same type of product</li>
      </ul>

      <h2>2. HOW TO REQUEST A REFUND</h2>

      <h3>2.1 Refund Request Process</h3>
      <p>To request a refund, follow these steps:</p>

      <ol>
        <li>
          <strong>Login to Your Account</strong>
          <ul>
            <li>Go to https://digitaldock.com/login</li>
            <li>Access your account dashboard</li>
          </ul>
        </li>
        <li>
          <strong>Navigate to Purchase History</strong>
          <ul>
            <li>Go to Dashboard → Purchases</li>
            <li>Find the product you want to refund</li>
          </ul>
        </li>
        <li>
          <strong>Submit Refund Request</strong>
          <ul>
            <li>Click &quot;Request Refund&quot; button</li>
            <li>Select a reason from dropdown menu</li>
            <li>Provide detailed explanation (required)</li>
            <li>Attach screenshots if applicable</li>
            <li>Submit the request</li>
          </ul>
        </li>
        <li>
          <strong>Alternative Method: Email</strong>
          <ul>
            <li>Email: <a href="mailto:refunds@digitaldock.co">refunds@digitaldock.co</a></li>
            <li>Subject: &quot;Refund Request - Order #[ORDER_ID]&quot;</li>
            <li>Include: Order number, product name, reason for refund</li>
            <li>Include: Screenshots or evidence of the issue</li>
          </ul>
        </li>
      </ol>

      <h3>2.2 Required Information</h3>
      <p>Your refund request must include:</p>
      <ul>
        <li>Order number / Purchase ID</li>
        <li>Product name</li>
        <li>Date of purchase</li>
        <li>Clear reason for refund request</li>
        <li>Supporting evidence (screenshots, error messages, etc.)</li>
        <li>Description of steps you&apos;ve taken to resolve the issue</li>
      </ul>
      <p><strong>Insufficient Information:</strong> Requests without adequate details may be delayed or denied.</p>

      <h3>2.3 Response Time</h3>
      <p>We aim to respond to refund requests within:</p>
      <ul>
        <li><strong>Initial Response:</strong> 1-2 business days</li>
        <li><strong>Decision:</strong> 3-5 business days</li>
        <li><strong>Processing (if approved):</strong> 5-10 business days</li>
      </ul>
      <p>You will receive email notifications at each stage of the process.</p>

      <h2>3. REFUND REVIEW PROCESS</h2>

      <h3>3.1 Evaluation Criteria</h3>
      <p>Each refund request is reviewed individually based on:</p>
      <ul>
        <li>Validity of the reason provided</li>
        <li>Evidence and documentation supplied</li>
        <li>Product seller&apos;s refund policy (if specified)</li>
        <li>Purchase and download history</li>
        <li>Previous refund history</li>
        <li>Time since purchase</li>
        <li>Compliance with this Refund Policy</li>
      </ul>

      <h3>3.2 Seller Involvement</h3>
      <p>For seller-specific issues, we may:</p>
      <ul>
        <li>Contact the seller for their perspective</li>
        <li>Request the seller to provide support or product updates</li>
        <li>Mediate between buyer and seller</li>
        <li>Make a final decision if resolution cannot be reached</li>
      </ul>
      <p>Sellers have 48 hours to respond to refund-related inquiries.</p>

      <h3>3.3 Decision Outcomes</h3>
      <p>After review, your request will result in one of the following:</p>

      <p><strong>Approved:</strong></p>
      <ul>
        <li>Full refund processed to original payment method</li>
        <li>Access to product may be revoked</li>
        <li>Confirmation email sent with refund timeline</li>
      </ul>

      <p><strong>Partially Approved:</strong></p>
      <ul>
        <li>Partial refund offered (e.g., 50% for minor issues)</li>
        <li>Access to product retained</li>
        <li>Explanation provided for partial approval</li>
      </ul>

      <p><strong>Denied:</strong></p>
      <ul>
        <li>No refund issued</li>
        <li>Detailed explanation of denial reason</li>
        <li>Alternative solutions suggested (if applicable)</li>
        <li>Appeal option available</li>
      </ul>

      <h3>3.4 Appeal Process</h3>
      <p>If your refund request is denied and you disagree:</p>
      <ul>
        <li>You may appeal the decision within 7 days</li>
        <li>Email <a href="mailto:appeals@digitaldock.co">appeals@digitaldock.co</a> with subject &quot;Refund Appeal - Order #[ORDER_ID]&quot;</li>
        <li>Provide additional evidence or clarification</li>
        <li>Appeals are reviewed by a senior team member</li>
        <li>Final decision will be communicated within 5 business days</li>
      </ul>

      <h2>4. REFUND PROCESSING</h2>

      <h3>4.1 Refund Methods</h3>
      <p>Refunds are processed using the same payment method used for the original purchase:</p>

      <p><strong>Credit/Debit Card (via Paystack):</strong></p>
      <ul>
        <li>Refund appears in 5-10 business days</li>
        <li>Timing depends on your bank&apos;s processing time</li>
        <li>Shows as credit from &quot;DigitalDock&quot; or &quot;Paystack&quot;</li>
      </ul>

      <p><strong>PayPal:</strong></p>
      <ul>
        <li>Refund appears in 3-5 business days</li>
        <li>Credited to your PayPal account balance</li>
      </ul>

      <h3>4.2 Refund Amount</h3>
      <p><strong>Full Refund:</strong></p>
      <ul>
        <li>100% of the purchase price</li>
        <li>Platform fee and payment processing fees are not refunded (absorbed by DigitalDock)</li>
      </ul>

      <p><strong>Partial Refund:</strong></p>
      <ul>
        <li>Percentage determined on case-by-case basis</li>
        <li>Typically 25%, 50%, or 75% depending on circumstances</li>
      </ul>

      <h3>4.3 Refund Confirmation</h3>
      <p>Once processed, you will receive:</p>
      <ul>
        <li>Email confirmation with refund details</li>
        <li>Refund amount and method</li>
        <li>Expected timeline for funds to appear</li>
        <li>Transaction reference number</li>
      </ul>

      <p>
        <strong>Important:</strong> If you do not receive your refund within the specified timeframe, contact your bank or payment
        provider first, then contact our support team.
      </p>

      <h2>5. PRODUCT ACCESS AFTER REFUND</h2>

      <h3>5.1 Access Revocation</h3>
      <p>Upon refund approval:</p>
      <ul>
        <li>Your access to the product will be revoked</li>
        <li>Download links will be deactivated</li>
        <li>Product will be removed from your purchase history</li>
        <li>You must delete all copies of the product from your devices</li>
      </ul>

      <p>
        <strong>Legal Obligation:</strong> Keeping refunded products constitutes theft of intellectual property and may result in
        legal action.
      </p>

      <h3>5.2 Re-Purchase Policy</h3>
      <p>If you receive a refund and later wish to purchase the same product again:</p>
      <ul>
        <li>You may re-purchase at the current listing price</li>
        <li>Previous refund will not affect your ability to re-purchase</li>
        <li>Multiple refunds of the same product may trigger review</li>
      </ul>

      <h2>6. CHARGEBACKS</h2>

      <h3>6.1 Chargeback Policy</h3>
      <p><strong>Before Filing a Chargeback:</strong></p>
      <ul>
        <li>Contact us first through the refund request process</li>
        <li>Most issues can be resolved without involving your bank</li>
        <li>Chargebacks should be a last resort</li>
      </ul>

      <p><strong>Chargeback Consequences:</strong></p>
      <p>If you file a chargeback without first contacting us:</p>
      <ul>
        <li>Your account may be suspended immediately</li>
        <li>Access to all purchased products may be revoked</li>
        <li>You may be banned from future purchases</li>
        <li>We may contest the chargeback with evidence</li>
      </ul>

      <p><strong>Legitimate Chargebacks:</strong></p>
      <p>File a chargeback if:</p>
      <ul>
        <li>We deny your refund request unfairly</li>
        <li>We do not respond within reasonable timeframe</li>
        <li>You suspect fraudulent activity on your account</li>
        <li>You did not authorize the purchase</li>
      </ul>

      <h2>7. EXCEPTIONS AND SPECIAL CASES</h2>

      <h3>7.1 Exceptional Circumstances</h3>
      <p>Refunds beyond the 7-day window may be considered for:</p>
      <ul>
        <li><strong>Medical or Family Emergencies:</strong> With documentation</li>
        <li><strong>Seller Fraud:</strong> Product was misrepresented or fraudulent</li>
        <li><strong>Platform Errors:</strong> Purchase made due to platform malfunction</li>
        <li><strong>Account Compromise:</strong> Unauthorized purchase on your account</li>
      </ul>
      <p><strong>How to Request:</strong> Email <a href="mailto:refunds@digitaldock.co">refunds@digitaldock.co</a> with detailed explanation and supporting documentation.</p>

      <h3>7.2 Promotional or Discounted Products</h3>
      <p>Products purchased during promotions or at discounted prices:</p>
      <ul>
        <li>Are subject to the same refund policy</li>
        <li>Refund amount is based on the price you paid, not original price</li>
        <li>May have additional restrictions stated at time of purchase</li>
      </ul>

      <h3>7.3 Bundled Products</h3>
      <p>For products sold as bundles:</p>
      <ul>
        <li>Refunds apply to the entire bundle, not individual items</li>
        <li>Cannot request refund for only part of a bundle</li>
        <li>If one item in bundle is defective, the entire bundle may be refunded</li>
      </ul>

      <h2>8. CONTACT INFORMATION</h2>

      <p>For refund-related inquiries:</p>

      <ul>
        <li>
          <strong>Refund Requests:</strong><br />
          Email: <a href="mailto:refunds@digitaldock.co">refunds@digitaldock.co</a><br />
          Subject: Refund Request - Order #[ORDER_ID]
        </li>
        <li>
          <strong>Refund Status:</strong><br />
          Email: <a href="mailto:refunds@digitaldock.co">refunds@digitaldock.co</a><br />
          Subject: Refund Status Inquiry - Order #[ORDER_ID]
        </li>
        <li>
          <strong>Appeals:</strong><br />
          Email: <a href="mailto:appeals@digitaldock.co">appeals@digitaldock.co</a><br />
          Subject: Refund Appeal - Order #[ORDER_ID]
        </li>
        <li>
          <strong>General Support:</strong><br />
          Email: <a href="mailto:support@digitaldock.co">support@digitaldock.co</a>
        </li>
      </ul>

      <p><strong>Response Time:</strong> 1-2 business days for initial response</p>

      <h2>9. IMPORTANT NOTES</h2>

      <p><strong>Read Before Purchase:</strong></p>
      <ul>
        <li>Review product descriptions carefully before purchasing</li>
        <li>Check system requirements and compatibility</li>
        <li>Read seller ratings and reviews</li>
        <li>Contact seller with questions before purchase</li>
        <li>Save all purchase confirmations and receipts</li>
      </ul>

      <p><strong>After Purchase:</strong></p>
      <ul>
        <li>Download and test products immediately</li>
        <li>Report issues within the 7-day window</li>
        <li>Keep evidence of any problems (screenshots, error messages)</li>
        <li>Attempt to resolve issues with the seller first</li>
      </ul>

      <p><strong>Refund Abuse:</strong></p>
      <ul>
        <li>We monitor refund patterns and may suspend accounts showing refund abuse</li>
        <li>Requesting refunds for properly described products repeatedly may result in account restrictions</li>
        <li>Fraudulent refund claims may result in permanent ban and legal action</li>
      </ul>

      <hr />

      <h2>ACKNOWLEDGMENT</h2>
      <p>
        BY MAKING A PURCHASE ON DIGITALDOCK, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO THIS REFUND POLICY.
      </p>

      <p className="text-sm text-gray-500 mt-8">
        <strong>Last Updated: October 23, 2025</strong><br />
        <strong>Version: 1.0</strong><br />
        © 2025 DigitalDock. All rights reserved.
      </p>
    </LegalLayout>
  );
}
