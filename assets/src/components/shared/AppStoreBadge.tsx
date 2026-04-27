const APP_STORE_URL =
  'https://apps.apple.com/us/app/dailybrew-staff-attendance/id6761321594';

export function AppStoreBadge({ className }: { className?: string }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label="Download on the App Store"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 40"
        width={120}
        height={40}
      >
        <rect width="120" height="40" rx="6" fill="#000000" />
        <g fill="white">
          {/* Apple logo */}
          <path d="M24.77 20.3a4.95 4.95 0 012.36-4.15 5.07 5.07 0 00-3.99-2.16c-1.68-.18-3.31 1.01-4.17 1.01-.87 0-2.19-.99-3.61-.96a5.31 5.31 0 00-4.47 2.73c-1.93 3.34-.49 8.27 1.36 10.97.93 1.33 2.01 2.81 3.43 2.76 1.39-.06 1.91-.88 3.59-.88 1.67 0 2.15.88 3.59.85 1.49-.03 2.43-1.33 3.33-2.67a11.1 11.1 0 001.51-3.09 4.79 4.79 0 01-2.93-4.41zM22.04 12.21a4.87 4.87 0 001.12-3.5 4.96 4.96 0 00-3.21 1.66 4.64 4.64 0 00-1.14 3.37 4.11 4.11 0 003.23-1.53z" />
          {/* "Download on the" */}
          <text x="42.5" y="14" fontFamily="system-ui, -apple-system, sans-serif" fontSize="5.2" fontWeight="400" letterSpacing="0.02em">
            Download on the
          </text>
          {/* "App Store" */}
          <text x="42.5" y="28" fontFamily="system-ui, -apple-system, sans-serif" fontSize="11" fontWeight="600" letterSpacing="-0.01em">
            App Store
          </text>
        </g>
      </svg>
    </a>
  );
}
