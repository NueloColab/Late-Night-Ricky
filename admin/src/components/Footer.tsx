export default function Footer() {
  return (
    <footer className="bg-[#3a3a3a] px-6 py-12 text-center">
      <div className="flex justify-center gap-6 mb-10">
        {['facebook','instagram','twitter'].map((s) => (
          <a key={s} href="#" className="w-12 h-12 rounded-full border border-[rgba(163,181,196,0.25)] flex items-center justify-center text-[#b0b0b0] hover:border-[#d0d0d0] hover:text-white hover:-translate-y-1 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {s === 'facebook' && <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />}
              {s === 'instagram' && <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></>}
              {s === 'twitter' && <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />}
            </svg>
          </a>
        ))}
      </div>
      <p className="text-[#777] text-[13px] tracking-wide">Late Night Ricky &copy; 2026. All rights reserved.</p>
    </footer>
  );
}
