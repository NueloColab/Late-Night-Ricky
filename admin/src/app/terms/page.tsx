import Navbar from '../../components/Navbar';

export const metadata = {
  title: 'Terms of Service — Late Night Ricky',
  description: 'Terms and conditions for Late Night Ricky.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f0e6d8] text-[#2a1a0a]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-32">
        <h1 className="text-[clamp(32px,4vw,48px)] font-black uppercase tracking-[-1px] mb-8" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Terms of Service
        </h1>

        <div className="space-y-6 text-[15px] leading-[1.8] text-[#5a3a1a]">
          <p><strong>Last updated: July 2026</strong></p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using the Late Night Ricky website, you agree to be bound by these terms. If you do not agree, please do not use the site.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">2. Services</h2>
          <p>Late Night Ricky provides DJ performance, music production, and related entertainment services. All bookings are subject to availability and confirmed via written agreement or invoice.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">3. Bookings & Payments</h2>
          <p>A deposit may be required to secure a booking. Payment terms will be specified in your invoice or contract. Late payments may result in cancellation or additional fees.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">4. Cancellations & Refunds</h2>
          <p>Cancellations must be made in writing. Deposit refunds are at our discretion and depend on the notice period given. Force majeure events (illness, travel restrictions, etc.) will be handled on a case-by-case basis.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">5. Intellectual Property</h2>
          <p>All content on this website — including images, music, logos, and text — is the property of Late Night Ricky or licensed to us. You may not reproduce, distribute, or use any content without written permission.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">6. Limitation of Liability</h2>
          <p>Late Night Ricky is not liable for any indirect, incidental, or consequential damages arising from the use of our website or services. Our total liability shall not exceed the amount paid for the specific service in question.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">7. Governing Law</h2>
          <p>These terms are governed by the laws of England and Wales. Any disputes shall be resolved in the courts of England.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">8. Changes to Terms</h2>
          <p>We may revise these terms at any time. Continued use of the site constitutes acceptance of the updated terms.</p>

          <p className="pt-6 text-sm text-[#5a3a1a]/60">Questions? Contact us at <a href="mailto:latenightricky@gmail.com" className="underline">latenightricky@gmail.com</a>.</p>
        </div>
      </div>
    </div>
  );
}
