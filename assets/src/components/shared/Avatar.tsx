const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #C17F3B, #6B4226)',
  'linear-gradient(135deg, #3B6FA0, #1a3a5c)',
  'linear-gradient(135deg, #4A7C59, #2a4a35)',
  'linear-gradient(135deg, #9B6B45, #5a3a1a)',
  'linear-gradient(135deg, #7C5C9B, #3a2a5c)',
  'linear-gradient(135deg, #C0392B, #6b1a10)',
];

interface AvatarProps {
  name: string;
  index?: number;
  size?: number;
  radius?: string;
  /** When provided, renders the image at the same size + radius and falls
   *  back to initials on load error. */
  imageUrl?: string | null;
}

export function Avatar({ name, index = 0, size = 32, radius = '50%', imageUrl }: AvatarProps) {
  // filter(Boolean) drops empty tokens so a `name` of '' or '   ' doesn't
  // collapse to "undefined" → slice → "UN" — that looked like a real user's
  // initials in the topbar avatar when fullName/firstName/lastName/email
  // were all missing. `|| '?'` is the final fallback.
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: 'cover',
          flexShrink: 0,
          display: 'block',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 600,
        color: 'white',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
