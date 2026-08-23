import React, { useState, useEffect, useRef } from 'react';
import { AlertData } from '../types';
import { AlertTriangle, Lock, Info, X } from 'lucide-react';

interface FreezeModalProps {
  alert: AlertData;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const FreezeModal: React.FC<FreezeModalProps> = ({
  alert,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [typedId, setTypedId] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTypedId('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetId = alert.targetAccount || alert.subjectAccountId;
  const isMatch = typedId.trim() === targetId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMatch) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="freeze-modal-title"
    >
      <div className="relative w-full max-w-[560px] bg-[#141922] border border-[#8794A8] rounded-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-[#93000a] bg-[#141922]">
          <div className="flex items-center gap-2 text-[#F43F5E]">
            <AlertTriangle className="w-5 h-5 fill-[#F43F5E]/20" />
            <h2 id="freeze-modal-title" className="font-['Inter'] font-semibold text-[17px] text-[#d6e3f9]">
              File SAR & Freeze Account
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-[#859397] hover:text-[#d6e3f9] transition-colors p-1 rounded"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
          {/* Summary Table */}
          <div className="bg-[#030f1e] border border-[#3c494c] rounded p-4 flex flex-col gap-3 font-['Inter']">
            <div className="flex justify-between items-center border-b border-[#3c494c]/60 pb-2">
              <span className="text-[11px] font-bold text-[#859397] uppercase tracking-wider">
                Target Account
              </span>
              <span className="font-['JetBrains_Mono'] font-medium text-[13px] text-[#d6e3f9]">
                {targetId}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#3c494c]/60 pb-2">
              <span className="text-[11px] font-bold text-[#859397] uppercase tracking-wider">
                Current Balance
              </span>
              <span className="font-['JetBrains_Mono'] font-medium text-[13px] text-[#d6e3f9]">
                {alert.subjectBalance}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#859397] uppercase tracking-wider">
                Affected Counterparties
              </span>
              <span className="font-['JetBrains_Mono'] font-medium text-[13px] text-[#d6e3f9]">
                {alert.affectedCounterpartiesCount} Linked Entities
              </span>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="flex items-start gap-2.5 bg-[#93000a]/15 border-l-4 border-[#F43F5E] p-3.5 rounded-r">
            <Info className="w-4 h-4 text-[#F43F5E] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#F43F5E] font-medium leading-relaxed">
              This action freezes {alert.affectedCounterpartiesCount} linked accounts and cannot be undone from this console.
            </p>
          </div>

          {/* Verification Input */}
          <div className="flex flex-col gap-2 pt-1">
            <label htmlFor="accountIdConfirm" className="text-[12px] text-[#bbc9cd] font-medium">
              Type the account ID to confirm:
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="font-['JetBrains_Mono'] text-[13px] text-[#d6e3f9] select-all bg-[#1e2b3b] px-2.5 py-1 rounded w-max border border-[#3c494c]">
                {targetId}
              </span>
              <input
                ref={inputRef}
                id="accountIdConfirm"
                type="text"
                value={typedId}
                onChange={(e) => setTypedId(e.target.value)}
                placeholder="Enter ID exactly as shown..."
                autoComplete="off"
                className="bg-[#0B0E14] border border-[#1F2733] focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] w-full px-3.5 py-2 rounded font-['JetBrains_Mono'] text-[13px] text-[#d6e3f9] placeholder-[#859397]/50 mt-1 outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3 pt-3 border-t border-[#1F2733] -mx-6 px-6 -mb-6 pb-4 bg-[#030f1e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-[13px] font-medium border border-[#3c494c] text-[#bbc9cd] hover:bg-[#141922] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isMatch}
              className={`px-4 py-2 rounded text-[13px] font-semibold transition-all flex items-center gap-2 ${
                isMatch
                  ? 'bg-[#F43F5E] text-[#E6EAF0] hover:bg-[#F43F5E]/90 cursor-pointer shadow-md'
                  : 'bg-[#3f1922] text-[#859397]/40 cursor-not-allowed'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Confirm Freeze & File SAR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
