interface EmptyStateProps {
  label: string;
  onClick?: () => void;
}

export function EmptyState({ label, onClick }: EmptyStateProps) {
  return (
    <div
      onClick={onClick}
      className="border-[1.5px] border-dashed border-[#EBE2D6] rounded-2xl bg-white/30 flex flex-col items-center justify-center min-h-[120px] cursor-pointer transition-colors hover:bg-[#EBE2D6]/30"
    >
      <span className="text-2xl text-[#AE9D95] mb-1.5">+</span>
      <span className="text-[13px] text-[#AE9D95] font-sans">{label}</span>
    </div>
  );
}
