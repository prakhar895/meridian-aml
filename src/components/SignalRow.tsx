import React from 'react';
import { RiskSignal } from '../types';
import {
  AlertTriangle,
  Globe,
  Gauge,
  Smartphone,
  ShieldCheck,
  Gavel,
  Landmark,
  Building,
  ArrowUpRight,
  Fingerprint,
} from 'lucide-react';

interface SignalRowProps {
  signal: RiskSignal;
  index: number;
  isHighlighted: boolean;
  isDimmed: boolean;
  onHover: (id: string | null) => void;
}

export const SignalRow: React.FC<SignalRowProps> = ({
  signal,
  index,
  isHighlighted,
  isDimmed,
  onHover,
}) => {
  // Icon selector
  const renderIcon = () => {
    const iconClass = 'w-4 h-4 shrink-0';
    switch (signal.iconName) {
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-[#F43F5E]`} />;
      case 'public':
        return <Globe className={`${iconClass} text-[#FB923C]`} />;
      case 'speed':
        return <Gauge className={`${iconClass} text-[#FB923C]`} />;
      case 'devices':
      case 'devices_fold':
        return <Smartphone className={`${iconClass} text-[#22D3EE]`} />;
      case 'verified_user':
        return <ShieldCheck className={`${iconClass} text-[#34D399]`} />;
      case 'gavel':
        return <Gavel className={`${iconClass} text-[#F43F5E]`} />;
      case 'account_balance':
        return <Landmark className={`${iconClass} text-[#8aebff]`} />;
      case 'corporate_fare':
        return <Building className={`${iconClass} text-[#F43F5E]`} />;
      case 'move_up':
        return <ArrowUpRight className={`${iconClass} text-[#FB923C]`} />;
      case 'badge':
        return <Fingerprint className={`${iconClass} text-[#F43F5E]`} />;
      default:
        return <AlertTriangle className={`${iconClass} text-[#FB923C]`} />;
    }
  };

  const isPositive = signal.scoreDelta > 0;
  const isNeutralOrNegative = signal.scoreDelta <= 0;

  return (
    <div
      id={`signal-row-${signal.id}`}
      tabIndex={0}
      role="button"
      aria-label={`${signal.label}: ${isPositive ? `+${signal.scoreDelta}` : signal.scoreDelta} risk score`}
      onMouseEnter={() => onHover(signal.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(signal.id)}
      onBlur={() => onHover(null)}
      className={`group flex items-start justify-between p-2.5 rounded-md cursor-pointer transition-all duration-150 border outline-none ${
        isHighlighted
          ? 'bg-[#1e2b3b] border-[#22D3EE] shadow-[0_0_10px_rgba(34,211,238,0.2)] ring-1 ring-[#22D3EE]/60'
          : 'border-transparent hover:bg-[#1e2b3b]/60 hover:border-[#1F2733]'
      }`}
      style={{
        opacity: isDimmed ? 0.25 : 1,
        transition: 'opacity 150ms ease, background-color 150ms ease, border-color 150ms ease',
      }}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
        {/* Keyboard Shortcut Keycap (1-7) */}
        <span className="w-4 h-4 rounded bg-[#0B0E14] border border-[#1F2733] flex items-center justify-center font-['JetBrains_Mono'] text-[10px] text-[#859397] group-hover:text-[#22D3EE] group-hover:border-[#22D3EE]/40 shrink-0 mt-0.5">
          {index + 1}
        </span>

        <div className="mt-0.5 shrink-0">
          {renderIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-['Inter'] text-[13px] font-medium text-[#d6e3f9] leading-snug">
            {signal.label}
          </div>
          <div className="font-['Inter'] text-[11px] text-[#859397] line-clamp-2 leading-relaxed mt-0.5 break-words">
            {signal.description}
          </div>
        </div>
      </div>

      {/* Delta Score Badge */}
      <span
        className={`font-['JetBrains_Mono'] text-[13px] font-bold shrink-0 ml-2 mt-0.5 ${
          signal.severity === 'critical'
            ? 'text-[#F43F5E]'
            : signal.severity === 'high'
            ? 'text-[#FB923C]'
            : signal.severity === 'medium'
            ? 'text-[#FBBF24]'
            : 'text-[#34D399]'
        }`}
      >
        {isPositive ? `+${signal.scoreDelta}` : signal.scoreDelta}
      </span>
    </div>
  );
};
