import React, { useState, useEffect } from 'react';
import { AlertData, DispositionType } from '../types';
import { Lock, ShieldAlert, CheckCircle2, ArrowUpRight, HelpCircle } from 'lucide-react';

interface DispositionPanelProps {
  alert: AlertData;
  onDisposition: (type: DispositionType, rationale: string) => void;
  rationale: string;
  onRationaleChange: (text: string) => void;
  onOpenFreezeModal: () => void;
}

export const DispositionPanel: React.FC<DispositionPanelProps> = ({
  alert,
  onDisposition,
  rationale,
  onRationaleChange,
  onOpenFreezeModal,
}) => {
  const MIN_CHARS = 50;
  const charCount = rationale.trim().length;
  const isSatisfied = charCount >= MIN_CHARS;

  const handleClear = () => {
    if (!isSatisfied) return;
    onDisposition('clear_false_positive', rationale);
  };

  const handleEscalate = () => {
    if (!isSatisfied) return;
    onDisposition('escalate_l2', rationale);
  };

  const handleFreeze = () => {
    if (!isSatisfied) return;
    onOpenFreezeModal();
  };

  return (
    <section className="space-y-3" id="disposition-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-['Inter'] text-[11px] font-bold uppercase tracking-wider text-[#bbc9cd]">
          Disposition Decision
        </h3>
        <span className="text-[10px] text-[#859397] font-['JetBrains_Mono']">
          Audit Mandatory
        </span>
      </div>

      {/* Rationale Input */}
      <div className="space-y-1.5">
        <div className="relative">
          <textarea
            id="disposition-rationale-input"
            value={rationale}
            onChange={(e) => onRationaleChange(e.target.value)}
            rows={3}
            placeholder="Document rationale for audit trail (min 50 chars)..."
            className="w-full bg-[#071423] border border-[#1F2733] focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] rounded-md p-3 text-[13px] text-[#d6e3f9] placeholder-[#859397]/50 resize-none outline-none transition-all"
          />
        </div>

        {/* Live Character Counter & Audit Requirement Helper */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-[#859397]">
            {!isSatisfied ? (
              <span className="text-[#FB923C] text-[10px] flex items-center gap-1">
                <HelpCircle className="w-3 h-3 shrink-0" />
                Need {MIN_CHARS - charCount} more characters for audit compliance
              </span>
            ) : (
              <span className="text-[#34D399] text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                Audit requirement satisfied
              </span>
            )}
          </div>

          <span
            className={`font-['JetBrains_Mono'] text-[11px] font-medium ${
              isSatisfied ? 'text-[#34D399]' : 'text-[#859397]'
            }`}
          >
            {charCount} / {MIN_CHARS} min
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        {/* Clear — False Positive */}
        <button
          id="btn-disposition-clear"
          onClick={handleClear}
          disabled={!isSatisfied}
          className={`w-full py-2.5 px-3 rounded text-[13px] font-medium font-['Inter'] border transition-all flex items-center justify-between ${
            isSatisfied
              ? 'border-[#34D399] text-[#34D399] hover:bg-[#34D399]/10 cursor-pointer'
              : 'border-[#1F2733] text-[#859397]/40 bg-[#071423]/50 cursor-not-allowed'
          }`}
          title={!isSatisfied ? 'Enter 50+ characters rationale to unlock' : 'Clear alert as false positive'}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Clear — False Positive</span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[10px] bg-[#071423] border border-current px-1.5 py-0.5 rounded opacity-70">
            Alt+C
          </span>
        </button>

        {/* Escalate to L2 */}
        <button
          id="btn-disposition-escalate"
          onClick={handleEscalate}
          disabled={!isSatisfied}
          className={`w-full py-2.5 px-3 rounded text-[13px] font-medium font-['Inter'] transition-all flex items-center justify-between ${
            isSatisfied
              ? 'bg-[#FB923C] text-[#0B0E14] hover:bg-[#FB923C]/90 font-semibold cursor-pointer shadow-sm'
              : 'bg-[#1e2b3b] text-[#859397]/40 cursor-not-allowed'
          }`}
          title={!isSatisfied ? 'Enter 50+ characters rationale to unlock' : 'Escalate alert to Level 2 Investigation'}
        >
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" />
            <span>Escalate to L2</span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[10px] bg-[#0B0E14]/20 border border-current px-1.5 py-0.5 rounded">
            Alt+E
          </span>
        </button>

        {/* File SAR & Freeze */}
        <button
          id="btn-disposition-freeze"
          onClick={handleFreeze}
          disabled={!isSatisfied}
          className={`w-full py-2.5 px-3 rounded text-[13px] font-medium font-['Inter'] transition-all flex items-center justify-between ${
            isSatisfied
              ? 'bg-[#F43F5E] text-[#E6EAF0] hover:bg-[#F43F5E]/90 font-semibold cursor-pointer shadow-sm'
              : 'bg-[#3f1922] text-[#859397]/40 cursor-not-allowed'
          }`}
          title={!isSatisfied ? 'Enter 50+ characters rationale to unlock' : 'File FinCEN SAR & Freeze Account'}
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>File SAR & Freeze</span>
          </div>
          <span className="font-['JetBrains_Mono'] text-[10px] bg-[#0B0E14]/20 border border-current px-1.5 py-0.5 rounded">
            Alt+S
          </span>
        </button>
      </div>
    </section>
  );
};
