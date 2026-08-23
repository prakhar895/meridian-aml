import React from 'react';
import { X } from 'lucide-react';

interface ShortcutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutOverlay: React.FC<ShortcutOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div className="relative w-full max-w-[640px] bg-[#141922] border border-[#1F2733] rounded shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1F2733] bg-[#141922]">
          <h2 id="shortcuts-modal-title" className="font-['Inter'] font-semibold text-[17px] text-[#d6e3f9]">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-[#859397] hover:text-[#22D3EE] transition-colors p-1 rounded focus:outline-none focus:ring-1 focus:ring-[#22D3EE]"
            aria-label="Close shortcuts dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 font-['Inter'] text-[13px]">
          {/* Left Column */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between py-1.5 border-b border-[#1F2733]/50">
              <span className="text-[#bbc9cd]">Search Queue</span>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-[#d6e3f9]">
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">⌘ / Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">K</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1F2733]/50">
              <span className="text-[#bbc9cd]">Next Alert</span>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-[#d6e3f9]">
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">J</kbd>
                <span className="text-[#859397] text-[10px]">or</span>
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">↓</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1F2733]/50">
              <span className="text-[#bbc9cd]">Previous Alert</span>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-[#d6e3f9]">
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">K</kbd>
                <span className="text-[#859397] text-[10px]">or</span>
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">↑</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1F2733]/50">
              <span className="text-[#bbc9cd]">Focus Risk Signal</span>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-[#d6e3f9]">
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">1</kbd>
                <span className="text-[#859397] text-[10px]">-</span>
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">7</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1F2733]/50">
              <span className="text-[#bbc9cd]">Toggle Fullscreen</span>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-[#d6e3f9]">
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">F</kbd>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between py-1.5 border-b border-[#1F2733]/50">
              <span className="text-[#34D399] font-medium">Clear Alert</span>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-[#d6e3f9]">
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">Alt</kbd>
                <span>+</span>
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">C</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1F2733]/50">
              <span className="text-[#FB923C] font-medium">Escalate Alert</span>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-[#d6e3f9]">
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">Alt</kbd>
                <span>+</span>
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">E</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1F2733]/50">
              <span className="text-[#F43F5E] font-medium">File SAR / Freeze</span>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-[#d6e3f9]">
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">Alt</kbd>
                <span>+</span>
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">S</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1F2733]/50">
              <span className="text-[#bbc9cd]">Open Shortcuts Help</span>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-[#d6e3f9]">
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">?</kbd>
              </div>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#1F2733]/50">
              <span className="text-[#bbc9cd]">Close Dialogs / Clear</span>
              <div className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-[#d6e3f9]">
                <kbd className="px-2 py-0.5 rounded bg-[#071423] border border-[#1F2733]">Esc</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-[#0B0E14] border-t border-[#1F2733] text-center text-[11px] text-[#859397]">
          Keyboard-first compliance workstation. All commands run locally with zero latency.
        </div>
      </div>
    </div>
  );
};
