interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * DailyBrew logo — a warm coffee cup with steam in the brand palette.
 * Used in navbar, sidebar, auth pages, and loading screens.
 */
export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Steam lines */}
      <path
        d="M16 14c0-3 2-5 0-8"
        stroke="#C17F3B"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M24 12c0-3 2-5 0-8"
        stroke="#C17F3B"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M20 13c0-3 2-5 0-8"
        stroke="#C17F3B"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Cup body */}
      <rect
        x="8"
        y="18"
        width="24"
        height="20"
        rx="4"
        fill="url(#cup-gradient)"
      />
      {/* Coffee surface */}
      <ellipse cx="20" cy="24" rx="10" ry="2.5" fill="#9B6B45" opacity="0.6" />
      {/* Handle */}
      <path
        d="M32 22c4 0 7 2 7 6s-3 6-7 6"
        stroke="#6B4226"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Saucer */}
      <ellipse cx="20" cy="40" rx="14" ry="3" fill="#6B4226" opacity="0.15" />
      {/* Gradient definition */}
      <defs>
        <linearGradient id="cup-gradient" x1="8" y1="18" x2="8" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E8A85A" />
          <stop offset="1" stopColor="#6B4226" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Full brand mark: logo icon + "DailyBrew" text
 */
export function LogoBrand({ size = 32, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={size} />
      <span
        className="font-semibold text-[#6B4226]"
        style={{
          fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
          fontSize: size * 0.56,
        }}
      >
        DailyBrew
      </span>
    </div>
  );
}
