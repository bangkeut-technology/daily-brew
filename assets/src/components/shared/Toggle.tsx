import { Check, X } from 'lucide-react';

interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ id, checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 rounded-full
        cursor-pointer transition-colors duration-200 ease-in-out
        border-2
        focus:outline-none focus:ring-2 focus:ring-coffee/20 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? 'bg-coffee border-coffee' : 'bg-cream-3 border-cream-3'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-flex items-center justify-center
          h-5 w-5 rounded-full bg-white shadow-md
          transform transition-transform duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      >
        {checked ? (
          <Check size={10} className="text-coffee" strokeWidth={3} />
        ) : (
          <X size={10} className="text-text-tertiary" strokeWidth={3} />
        )}
      </span>
    </button>
  );
}
