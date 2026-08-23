import React, { useState } from 'react';
import { AlertData } from '../types';
import { useTypewriter } from '../hooks/useTypewriter';
import { Sparkles, RotateCw, Check } from 'lucide-react';

interface AnalystSummaryProps {
  alert: AlertData;
}

export const AnalystSummary: React.FC<AnalystSummaryProps> = ({ alert }) => {
  const [summaryIndex, setSummaryIndex] = useState(0);
  const [regenerateCount, setRegenerateCount] = useState(0);

  const currentSummaryObj = alert.summaries[summaryIndex % alert.summaries.length] || alert.summaries[0];
  const summaryText = currentSummaryObj?.summary || '';

  const { displayedText, isTyping, isPending, isComplete } = useTypewriter(
    summaryText,
    `${alert.id}-${summaryIndex}-${regenerateCount}`
  );

  const handleRegenerate = () => {
    if (isPending || isTyping) return;
    const nextIndex = (summaryIndex + 1) % alert.summaries.length;
    setSummaryIndex(nextIndex);
    setRegenerateCount((prev) => prev + 1);
  };

  return (
    <section className="space-y-3" aria-live="polite">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#22D3EE] animate-pulse" />
          <h3 className="font-['Inter'] text-[11px] font-bold uppercase tracking-wider text-[#bbc9cd]">
            Auto-Summary
          </h3>
          <span className="text-[10px] text-[#859397] font-['JetBrains_Mono']">
            ({summaryIndex + 1}/{alert.summaries.length})
          </span>
        </div>

        {/* Regenerate Alternate Phrasing Button */}
        <button
          id="regenerate-summary-btn"
          onClick={handleRegenerate}
          disabled={isPending || isTyping}
          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-['Inter'] font-medium transition-colors border ${
            isPending || isTyping
              ? 'opacity-40 border-[#1F2733] text-[#859397] cursor-not-allowed'
              : 'border-[#1F2733] text-[#22D3EE] hover:bg-[#22D3EE]/10 hover:border-[#22D3EE]/40'
          }`}
          title="Replay with alternative synthesis"
          aria-label="Replay alternative summary phrasing"
        >
          <RotateCw className={`w-3 h-3 ${isPending || isTyping ? 'animate-spin' : ''}`} />
          <span>Regenerate</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="p-3.5 rounded-md bg-[#071423] border border-[#3c494c]/50 text-[#d6e3f9] text-[13px] leading-relaxed relative min-h-[90px] select-text">
        {isPending ? (
          <div className="flex items-center gap-1.5 text-[#859397] py-2">
            <span className="text-[12px] font-['Inter']">Synthesizing telemetry</span>
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-bounce" />
            </span>
          </div>
        ) : (
          <div>
            <p className="font-['Inter'] font-normal text-[#d6e3f9]">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#22D3EE] align-middle animate-pulse" />
              )}
            </p>

            {/* Key Factors bullets when complete */}
            {isComplete && currentSummaryObj?.keyFactors && (
              <div className="mt-3 pt-2.5 border-t border-[#1F2733] space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#859397]">
                  Key Corroborating Signals
                </div>
                {currentSummaryObj.keyFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#bbc9cd]">
                    <Check className="w-3 h-3 text-[#22D3EE] mt-0.5 shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
