import React from 'react';
import { AlertData, DispositionType } from '../types';
import { SignalRow } from './SignalRow';
import { AnalystSummary } from './AnalystSummary';
import { DispositionPanel } from './DispositionPanel';
import { calculateRiskScore, getRiskColorClasses, getRiskLevel, getRiskLabel } from '../lib/scoring';
import { ShieldAlert, X } from 'lucide-react';

interface RiskPanelProps {
  alert: AlertData;
  highlightedSignalIds: Set<string>;
  hasActiveHighlight: boolean;
  onHoverSignal: (id: string | null) => void;
  onDisposition: (type: DispositionType, rationale: string) => void;
  rationale: string;
  onRationaleChange: (text: string) => void;
  onOpenFreezeModal: () => void;
  isDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
}

export const RiskPanel: React.FC<RiskPanelProps> = ({
  alert,
  highlightedSignalIds,
  hasActiveHighlight,
  onHoverSignal,
  onDisposition,
  rationale,
  onRationaleChange,
  onOpenFreezeModal,
  isDrawerOpen = false,
  onCloseDrawer,
}) => {
  const currentScore = alert.initialScore;
  const risk = getRiskLevel(currentScore);
  const riskLabel = getRiskLabel(risk);
  const colorClasses = getRiskColorClasses(risk);

  return (
    <div
      id="right-risk-panel"
      className={`bg-[#141922] border-l border-[#1F2733] flex flex-col flex-shrink-0 z-30 overflow-y-auto shadow-[-4px_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 ${
        isDrawerOpen
          ? 'fixed inset-y-0 right-0 w-[400px] max-w-full z-50'
          : 'w-[380px] xl:w-[400px]'
      }`}
    >
      {/* Mobile / Drawer Close Header if active */}
      {isDrawerOpen && onCloseDrawer && (
        <div className="p-3 border-b border-[#1F2733] flex justify-between items-center bg-[#0B0E14]">
          <span className="font-['Inter'] font-semibold text-[13px] text-[#d6e3f9]">
            Risk & Investigation
          </span>
          <button
            onClick={onCloseDrawer}
            className="text-[#859397] hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Risk Assessment */}
        <section aria-labelledby="risk-assessment-heading">
          <div className="flex items-center justify-between mb-3">
            <h3
              id="risk-assessment-heading"
              className="font-['Inter'] text-[11px] font-bold uppercase tracking-wider text-[#bbc9cd]"
            >
              Risk Assessment
            </h3>
            <span
              className={`text-[11px] font-['Inter'] font-semibold px-2 py-0.5 rounded ${colorClasses.bg} ${colorClasses.text}`}
            >
              {riskLabel}
            </span>
          </div>

          {/* Big Score Display */}
          <div className="flex items-end gap-3 mb-3">
            <span
              className={`font-['JetBrains_Mono'] text-[44px] font-bold leading-none tracking-tight ${colorClasses.text}`}
            >
              {currentScore}
            </span>
            <span className="font-['JetBrains_Mono'] text-[14px] text-[#859397] pb-1 font-medium">
              / 100
            </span>
          </div>

          {/* Segmented Risk Distribution Bar */}
          <div
            className="flex h-2 w-full rounded overflow-hidden mb-5 bg-[#1e2b3b] border border-[#1F2733]"
            title={`Risk Level: ${currentScore}/100`}
          >
            <div className="w-[20%] bg-[#293646]" title="Normal / Low Tier" />
            <div className="w-[30%] bg-[#FBBF24]" title="Medium Risk Tier" />
            <div className="w-[25%] bg-[#FB923C]" title="High Risk Tier" />
            <div className="w-[25%] bg-[#F43F5E]" title="Critical Risk Tier" />
          </div>

          {/* Signals List */}
          <div className="space-y-1.5" role="list" aria-label="Risk signals">
            {alert.signals.map((signal, idx) => {
              const isHighlighted = highlightedSignalIds.has(signal.id);
              const isDimmed = hasActiveHighlight && !isHighlighted;
              return (
                <SignalRow
                  key={signal.id}
                  signal={signal}
                  index={idx}
                  isHighlighted={isHighlighted}
                  isDimmed={isDimmed}
                  onHover={onHoverSignal}
                />
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-[#1F2733]" />

        {/* Auto Summary */}
        <AnalystSummary alert={alert} />

        {/* Divider */}
        <div className="h-px bg-[#1F2733]" />

        {/* Disposition Decision */}
        <DispositionPanel
          alert={alert}
          onDisposition={onDisposition}
          rationale={rationale}
          onRationaleChange={onRationaleChange}
          onOpenFreezeModal={onOpenFreezeModal}
        />
      </div>
    </div>
  );
};
