const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #C17F3B, #6B4226)",
  "linear-gradient(135deg, #3B6FA0, #1a3a5c)",
  "linear-gradient(135deg, #4A7C59, #2a4a35)",
  "linear-gradient(135deg, #9B6B45, #5a3a1a)",
  "linear-gradient(135deg, #7C5C9B, #3a2a5c)",
  "linear-gradient(135deg, #C0392B, #6b1a10)",
];

interface AvatarProps {
  name: string;
  index?: number;
  size?: number;
  radius?: string;
  /** Uploaded headshot; falls back to the initials tile when absent. */
  imageUrl?: string | null;
}

export function Avatar({ name, index = 0, size = 32, radius = "50%", imageUrl }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const base = {
    width: size,
    height: size,
    borderRadius: radius,
    flexShrink: 0,
  } as const;

  if (imageUrl) {
    return (
      // Plain <img>, not next/image: these are same-origin Symfony-served
      // uploads behind auth, so the optimizer would add a round trip for no
      // gain and would need remotePatterns config per environment.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        style={{ ...base, objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      style={{
        ...base,
        background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 600,
        color: "white",
      }}
    >
      {initials}
    </div>
  );
}
