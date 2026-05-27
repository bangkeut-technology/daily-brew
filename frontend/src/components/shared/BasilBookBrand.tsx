import { cn } from "@/lib/utils";

interface BasilBookBrandProps {
  className?: string;
}

/**
 * Renders "BasilBook" with their brand gradient (teal→green).
 */
export function BasilBookBrand({ className }: BasilBookBrandProps) {
  return (
    <span
      className={cn("font-extrabold tracking-tight", className)}
      style={{
        background: "linear-gradient(to right, #1ea67a, #2bb673, #5ec06e)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      BasilBook
    </span>
  );
}
