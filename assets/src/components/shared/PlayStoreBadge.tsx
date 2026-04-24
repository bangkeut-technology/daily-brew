const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=work.dailybrew.mobile';

export function PlayStoreBadge({ className }: { className?: string }) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label="Get it on Google Play"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 135 40"
        width={135}
        height={40}
      >
        <rect width="135" height="40" rx="6" fill="currentColor" className="text-text-primary" />
        <g fill="white">
          {/* Google Play icon */}
          <path d="M11.1 8.05l8.28 4.78c.56.32.56.84 0 1.16l-8.28 4.78c-.56.32-1.02.06-1.02-.58V8.63c0-.64.46-.9 1.02-.58z" />
          {/* "GET IT ON" */}
          <text x="32" y="14" fontFamily="system-ui, -apple-system, sans-serif" fontSize="5" fontWeight="400" letterSpacing="0.05em">
            GET IT ON
          </text>
          {/* "Google Play" */}
          <text x="32" y="28" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="600" letterSpacing="-0.01em">
            Google Play
          </text>
        </g>
      </svg>
    </a>
  );
}
