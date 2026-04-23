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
          {/* Play triangle */}
          <path d="M19.5 10.1l-1.2-.7c-.4-.2-.8-.1-1 .2L10 19.4l7.3 9.8c.2.3.6.4 1 .2l1.2-.7L13 19.4l6.5-9.3z" />
          <path d="M24.7 17.4L21 15.2l-3.5 4.2 3.5 4.2 3.7-2.2c1-.6 1-1.6 0-2.2l-.8-.5-.2-.1-.3-.2-.7-.4-.3-.2-.2-.1z" opacity="0.8" />
          <path d="M10 19.4L17.3 9.6c.2-.3.6-.4 1-.2l1.2.7L13 19.4l6.5 9.3-1.2.7c-.4.2-.8.1-1-.2L10 19.4z" opacity="0.6" />
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
