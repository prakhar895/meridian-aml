import React, { useEffect } from 'react';
import { ToastMessage, DispositionRecord } from '../types';
import { CheckCircle2, AlertTriangle, Info, X, Undo2, Printer } from 'lucide-react';
import { ANIMATION_TIMINGS } from '../lib/timing';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  onUndo?: (toast: ToastMessage) => void;
  onPrint?: (record: DispositionRecord) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss, onUndo, onPrint }) => {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, ANIMATION_TIMINGS.TOAST_AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 max-w-[440px] w-full animate-slide-up no-print"
      role="status"
      aria-live="polite"
    >
      <div className="bg-[#141922] border border-[#22D3EE]/60 rounded-md p-4 shadow-2xl flex items-start gap-3 backdrop-blur-md">
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-[#FB923C]" />
          ) : toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-[#F43F5E]" />
          ) : (
            <Info className="w-5 h-5 text-[#22D3EE]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 font-['Inter']">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-[13px] font-semibold text-[#d6e3f9]">
              {toast.title}
            </h4>
            {toast.dispositionCode && (
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#22D3EE] bg-[#071423] px-1.5 py-0.5 rounded border border-[#22D3EE]/30">
                {toast.dispositionCode}
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#bbc9cd] mt-0.5 leading-relaxed">
            {toast.message}
          </p>

          {/* Action Buttons: Undo & Print Case Record */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {toast.previousRecord && (
              <button
                id="btn-toast-print-record"
                onClick={() => {
                  if (onPrint && toast.previousRecord) {
                    onPrint(toast.previousRecord);
                  } else {
                    window.print();
                  }
                }}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#8aebff] hover:text-white cursor-pointer bg-[#0e2a3a] hover:bg-[#133d54] px-2 py-0.5 rounded border border-[#22D3EE]/40 transition-colors"
                title="Print official one-page BSA/AML case record"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Record</span>
              </button>
            )}

            {toast.canUndo && onUndo && (
              <button
                onClick={() => onUndo(toast)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#22D3EE] hover:underline cursor-pointer bg-[#22D3EE]/10 px-2 py-0.5 rounded border border-[#22D3EE]/40"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo Disposition</span>
              </button>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          className="text-[#859397] hover:text-[#d6e3f9] transition-colors p-1 rounded shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
