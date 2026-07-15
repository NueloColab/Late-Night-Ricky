import Navbar from '../../components/Navbar';

export const metadata = {
  title: 'Privacy Policy — Late Night Ricky',
  description: 'Privacy policy for Late Night Ricky.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f0e6d8] text-[#2a1a0a]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-32">
        <h1 className="text-[clamp(32px,4vw,48px)] font-black uppercase tracking-[-1px] mb-8" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Privacy Policy
        </h1>

        <div className="space-y-6 text-[15px] leading-[1.8] text-[#5a3a1a]">
          <p><strong>Last updated: July 2026</strong></p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">1. Information We Collect</h2>
          <p>We may collect personal information you provide directly, such as your name, email address, and any messages submitted through our contact or enquiry forms. We also collect basic analytics data (page views, traffic sources) to improve our website.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">2. How We Use Your Information</h2>
          <p>Your information is used solely to respond to enquiries, manage bookings, and improve our services. We do not sell or share your personal data with third parties for marketing purposes.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">3. Cookies & Analytics</h2>
          <p>We use essential cookies to ensure the site functions correctly. Analytics cookies help us understand visitor behaviour. You can disable cookies in your browser settings at any time.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">4. Data Security</h2>
          <p>We implement appropriate technical and organisational measures to protect your data. However, no online transmission is 100% secure, and we cannot guarantee absolute security.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">5. Third-Party Links</h2>
          <p>Our website may contain links to external sites (e.g., Spotify, Instagram). We are not responsible for the privacy practices of these third-party platforms.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. To make a request, email us at <a href="mailto:latenightricky@gmail.com" className="underline">latenightricky@gmail.com</a>.</p>

          <h2 className="text-lg font-bold uppercase tracking-wide mt-8 mb-3">7. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Any changes will be posted on this page with an updated date.</p>

          <p className="pt-6 text-sm text-[#5a3a1a]/60">If you have any questions, contact us at <a href="mailto:latenightricky@gmail.com" className="underline">latenightricky@gmail.com</a>.</p>
        </div>
      </div>
    </div>
  );
}
