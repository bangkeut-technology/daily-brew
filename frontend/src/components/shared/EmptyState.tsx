"use client";

interface EmptyStateProps {
  label: string;
  onClick?: () => void;
}

export function EmptyState({ label, onClick }: EmptyStateProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-[120px] cursor-pointer transition-colors hover:bg-cream-3/30"
    >
      <span className="text-2xl text-text-tertiary mb-1.5">+</span>
      <span className="text-[15px] text-text-tertiary">{label}</span>
    </button>
  );
}
