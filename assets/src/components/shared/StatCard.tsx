interface StatCardProps {
  label: string;
  value: number;
  subtitle: string;
  accent: string;
  emoji: string;
}

export function StatCard({ label, value, subtitle, accent, emoji }: StatCardProps) {
  return (
    <div className="relative bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl p-5 shadow-sm cursor-default overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
        style={{ backgroundColor: accent }}
      />
      <p className="text-[10.5px] uppercase tracking-[0.8px] font-medium text-[#7C6860] mb-2.5">
        {label}
      </p>
      <p className="text-[32px] font-semibold text-[#2C2420] leading-none tracking-[-1px] mb-1.5">
        {value}
      </p>
      <p className="text-xs text-[#AE9D95]">{subtitle}</p>
      <span className="absolute top-4 right-4 text-xl opacity-[0.18] select-none">{emoji}</span>
    </div>
  );
}
