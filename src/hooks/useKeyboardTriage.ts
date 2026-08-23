import { useEffect } from 'react';
import { AlertData, DispositionType } from '../types';

export interface KeyboardTriageOptions {
  alerts: AlertData[];
  selectedAlertIndex: number;
  onSelectAlert: (index: number) => void;
  onTriggerDisposition: (type: DispositionType) => void;
  onToggleSignal: (signalIndex: number) => void;
  onOpenShortcuts: () => void;
  onCloseModals: () => void;
  isModalOpen: boolean;
  onToggleSearch?: () => void;
}

export function useKeyboardTriage({
  alerts,
  selectedAlertIndex,
  onSelectAlert,
  onTriggerDisposition,
  onToggleSignal,
  onOpenShortcuts,
  onCloseModals,
  isModalOpen,
  onToggleSearch,
}: KeyboardTriageOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // If user is currently typing in an input or textarea
      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      // Always handle Esc regardless of active input
      if (e.key === 'Escape') {
        onCloseModals();
        return;
      }

      // Handle Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        onToggleSearch?.();
        return;
      }

      // If user is typing in textarea or input, do not capture single key triage shortcuts
      if (isInput) return;

      // Handle Alt combinations (Alt+C, Alt+E, Alt+S/F) as per shortcut modal or direct keys
      if (e.altKey) {
        if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          onTriggerDisposition('clear_false_positive');
          return;
        }
        if (e.key.toLowerCase() === 'e') {
          e.preventDefault();
          onTriggerDisposition('escalate_l2');
          return;
        }
        if (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'f') {
          e.preventDefault();
          onTriggerDisposition('freeze_and_sar');
          return;
        }
      }

      // Help overlay
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        onOpenShortcuts();
        return;
      }

      if (isModalOpen) return;

      // Queue navigation
      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (alerts.length > 0) {
          const nextIndex = (selectedAlertIndex + 1) % alerts.length;
          onSelectAlert(nextIndex);
        }
        return;
      }

      if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (alerts.length > 0) {
          const prevIndex = (selectedAlertIndex - 1 + alerts.length) % alerts.length;
          onSelectAlert(prevIndex);
        }
        return;
      }

      // Dispositions direct single-letter triggers
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onTriggerDisposition('clear_false_positive');
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        onTriggerDisposition('escalate_l2');
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onTriggerDisposition('freeze_and_sar');
        return;
      }

      // Number keys 1-7 for risk signals
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 7) {
        e.preventDefault();
        onToggleSignal(num - 1);
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    alerts,
    selectedAlertIndex,
    onSelectAlert,
    onTriggerDisposition,
    onToggleSignal,
    onOpenShortcuts,
    onCloseModals,
    isModalOpen,
    onToggleSearch,
  ]);
}
