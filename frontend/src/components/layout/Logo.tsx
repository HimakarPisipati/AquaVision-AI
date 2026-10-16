export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--primary-glow)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="10" fill="var(--surface)" stroke="var(--border)" />
      <path d="M8 11V8h3M29 8h3v3M32 29v3h-3M11 32H8v-3" stroke="url(#lg)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M9 23c3-3 5.5-3 8 0s5 3 7.5 0 5-3 7.5 0" stroke="url(#lg)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M9 28c3-2.4 5.5-2.4 8 0s5 2.4 7.5 0 5-2.4 7.5 0" stroke="var(--primary)" strokeOpacity=".5" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="15" r="3" fill="url(#lg)" />
    </svg>
  );
}
