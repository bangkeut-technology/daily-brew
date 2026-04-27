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
        <rect width="135" height="40" rx="6" fill="#000000" />
        {/* Google Play 4-color icon */}
        <polygon points="10,8 10,15 18,15" fill="#00D7FE" />
        <polygon points="10,8 18,15 22,15" fill="#FFCE00" />
        <polygon points="10,22 10,15 18,15" fill="#00F176" />
        <polygon points="10,22 18,15 22,15" fill="#FF3D00" />
        <g fill="white">
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
