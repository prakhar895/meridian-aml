import React from 'react';
import { CheckCheck, RotateCcw, Printer, FileText } from 'lucide-react';
import { DispositionRecord } from '../types';

interface ShiftSummaryProps {
  dispositionHistory: DispositionRecord[];
  onReloadQueue: () => void;
  onPrintRecord?: (record: DispositionRecord) => void;
}

export const ShiftSummary: React.FC<ShiftSummaryProps> = ({
  dispositionHistory,
  onReloadQueue,
  onPrintRecord,
}) => {
  const totalReviewed = 38 + dispositionHistory.length;
  const falsePositiveCount = dispositionHistory.filter((d) => d.dispositionType === 'clear_false_positive').length;
  const calculatedFpRate = dispositionHistory.length > 0
    ? Math.round(((24 + falsePositiveCount) / totalReviewed) * 100)
    : 68;

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-y-auto bg-[#0B0E14]"
      role="main"
      aria-label="Shift completion summary"
    >
      <div className="max-w-[620px] w-full flex flex-col items-center bg-[#141922] border border-[#1F2733] rounded-xl p-8 shadow-2xl relative animate-scale-in">
        {/* Cyan accent bar on top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#22D3EE] rounded-t-xl opacity-90" />

        {/* Central Glowing Icon */}
        <div className="w-20 h-20 rounded-full border border-[#22D3EE] flex items-center justify-center mb-6 bg-[#22D3EE]/5 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <CheckCheck className="w-10 h-10 text-[#22D3EE]" strokeWidth={2.5} />
        </div>

        {/* Heading */}
        <h1 className="font-['Inter'] text-[24px] font-bold text-[#d6e3f9] mb-6 tracking-tight">
          Queue clear
        </h1>

        {/* Shift Summary Metrics Card */}
        <div className="w-full bg-[#0B0E14] border border-[#1F2733] rounded-lg p-5 mb-6 flex justify-between items-center select-none font-['Inter']">
          <div className="flex flex-col items-start px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#859397] mb-1">
              Alerts Reviewed
            </span>
            <span className="font-['JetBrains_Mono'] text-[16px] font-semibold text-[#d6e3f9]">
              {totalReviewed}
            </span>
          </div>

          <div className="h-9 w-px bg-[#3c494c]/40" />

          <div className="flex flex-col items-start px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#859397] mb-1">
              Avg. Handling Time
            </span>
            <span className="font-['JetBrains_Mono'] text-[16px] font-semibold text-[#d6e3f9]">
              14m 22s
            </span>
          </div>

          <div className="h-9 w-px bg-[#3c494c]/40" />

          <div className="flex flex-col items-start px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#859397] mb-1">
              False Positive Rate
            </span>
            <span className="font-['JetBrains_Mono'] text-[16px] font-semibold text-[#d6e3f9]">
              {calculatedFpRate}%
            </span>
          </div>
        </div>

        {/* Disposed Case Records List */}
        {dispositionHistory.length > 0 && (
          <div className="w-full mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#859397]">
                Disposed Case Records ({dispositionHistory.length})
              </span>
              <span className="text-[11px] font-['JetBrains_Mono'] text-[#22D3EE]">
                Audit Ready
              </span>
            </div>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {dispositionHistory.map((item) => (
                <div
                  key={item.dispositionCode}
                  className="bg-[#0B0E14] border border-[#1F2733] rounded p-3 flex items-center justify-between gap-3 text-[12px]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-['JetBrains_Mono'] font-bold text-[#22D3EE]">
                        {item.alertId}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded font-['JetBrains_Mono'] ${
                          item.dispositionType === 'freeze_and_sar'
                            ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30'
                            : item.dispositionType === 'escalate_l2'
                            ? 'bg-[#FB923C]/20 text-[#FB923C] border border-[#FB923C]/30'
                            : 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30'
                        }`}
                      >
                        {item.dispositionType === 'freeze_and_sar'
                          ? 'Frozen & SAR'
                          : item.dispositionType === 'escalate_l2'
                          ? 'Escalated L2'
                          : 'Cleared FP'}
                      </span>
                    </div>
                    <p className="text-[#859397] text-[11px] truncate mt-0.5 font-['Inter'] italic">
                      "{item.rationale || 'Adjudicated without additional remarks.'}"
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onPrintRecord) {
                        onPrintRecord(item);
                      } else {
                        window.print();
                      }
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#132030] hover:bg-[#1e2f47] border border-[#22D3EE]/40 text-[#8aebff] hover:text-white text-[11px] font-['JetBrains_Mono'] transition-colors cursor-pointer shrink-0"
                    title={`Print 1-page case record for ${item.alertId}`}
                  >
                    <Printer className="w-3 h-3" />
                    <span>Print</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReloadQueue}
            className="flex items-center gap-2 px-5 py-2.5 border border-[#22D3EE] text-[#22D3EE] rounded text-[13px] font-medium font-['Inter'] hover:bg-[#22D3EE]/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#22D3EE]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Queue</span>
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="font-['JetBrains_Mono'] text-[12px] text-[#859397] opacity-80">
          Workspace synced. Awaiting new priority flags.
        </p>
      </div>
    </main>
  );
};

