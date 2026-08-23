import React from 'react';
import { AlertData } from '../types';
import { getRiskColorClasses, getRiskLevel } from '../lib/scoring';
import { Clock } from 'lucide-react';

interface AlertCardProps {
  alert: AlertData;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  isSelected,
  onSelect,
  index,
}) => {
  const risk = getRiskLevel(alert.initialScore);
  const colorClasses = getRiskColorClasses(risk);

  return (
    <div
      id={`alert-card-${alert.id}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`relative rounded-md p-3 cursor-pointer transition-all duration-150 outline-none select-none group border ${
        isSelected
          ? 'bg-[#141922] border-[#22D3EE] shadow-[0_0_12px_rgba(34,211,238,0.15)] ring-1 ring-[#22D3EE]/50'
          : 'bg-[#0B0E14] border-[#1F2733] hover:border-[#3c494c] hover:bg-[#141922]/60'
      }`}
      aria-selected={isSelected}
    >
      {/* 4px Vertical Severity Strip */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-l-md ${
          risk === 'critical'
            ? 'bg-[#F43F5E]'
            : risk === 'high'
            ? 'bg-[#FB923C]'
            : risk === 'medium'
            ? 'bg-[#FBBF24]'
            : 'bg-[#34D399]'
        }`}
      />

      {/* Header Row: ID + Score Badge */}
      <div className="flex justify-between items-center mb-1.5 pl-2">
        <div className="flex items-center gap-2">
          <span className="font-['JetBrains_Mono'] text-[13px] font-semibold text-[#d6e3f9] tracking-tight">
            {alert.id}
          </span>
          <span className="text-[10px] text-[#859397] font-['JetBrains_Mono']">
            #{index + 1}
          </span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded-sm font-['JetBrains_Mono'] text-[10px] font-bold tracking-tight ${colorClasses.badgeBg} ${colorClasses.badgeText}`}
          title={`Risk Score: ${alert.initialScore} / 100`}
        >
          {alert.initialScore}
        </span>
      </div>

      {/* Title & Entity */}
      <div className="pl-2 mb-2.5">
        <div
          className={`font-['Inter'] text-[13px] font-medium truncate ${
            isSelected ? 'text-[#d6e3f9]' : 'text-[#bbc9cd] group-hover:text-[#d6e3f9]'
          }`}
        >
          {alert.title}
        </div>
        <div className="font-['Inter'] text-[12px] text-[#859397] truncate">
          {alert.subjectName}
        </div>
      </div>

      {/* SLA Timer */}
      <div className="flex items-center justify-between pl-2 text-[11px] font-['JetBrains_Mono']">
        <div className="flex items-center gap-1.5 text-[#FB923C]">
          <Clock className="w-3.5 h-3.5" />
          <span>{alert.slaRemainingShort}</span>
        </div>
        <span className="text-[#859397] text-[10px] uppercase font-['Inter'] font-semibold tracking-wider">
          {alert.ruleCategory}
        </span>
      </div>
    </div>
  );
};
