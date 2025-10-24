import LegalLayout from '@/components/LegalLayout';

export const metadata = {
  title: 'Content Guidelines | DigitalDock',
  description: 'Content guidelines and acceptable use policy for DigitalDock',
};

export default function ContentGuidelinesPage() {
  return (
    <LegalLayout>
      <h1>CONTENT GUIDELINES</h1>
      <p><strong>Last Updated: October 23, 2025</strong></p>

      <p>These guidelines ensure a safe, legal, and high-quality marketplace for all users.</p>

      <h2>1. Acceptable Content</h2>
      <ul>
        <li>Original creative works</li>
        <li>Properly licensed content</li>
        <li>Content you have rights to distribute</li>
      </ul>

      <h2>2. Prohibited Content</h2>
      <ul>
        <li>Copyrighted material without permission</li>
        <li>Malware, viruses, or harmful code</li>
        <li>Adult or explicit content</li>
        <li>Hate speech or discriminatory content</li>
        <li>Illegal or dangerous content</li>
      </ul>

      <h2>3. Quality Standards</h2>
      <ul>
        <li>Products must match descriptions</li>
        <li>Files must be functional and complete</li>
        <li>Clear documentation required</li>
      </ul>

      <p className="text-sm text-gray-500 mt-8">© 2025 DigitalDock. All rights reserved.</p>
    </LegalLayout>
  );
}
