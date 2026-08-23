import React, { useState, useCallback, useMemo } from 'react';
import { INITIAL_ALERTS } from './data/alerts';
import { AlertData, DispositionType, DispositionRecord, ToastMessage } from './types';
import { AlertQueue } from './components/AlertQueue';
import { EntityGraph } from './components/EntityGraph';
import { TransactionTimeline } from './components/TransactionTimeline';
import { RiskPanel } from './components/RiskPanel';
import { FreezeModal } from './components/FreezeModal';
import { ShortcutOverlay } from './components/ShortcutOverlay';
import { Toast } from './components/Toast';
import { ShiftSummary } from './components/ShiftSummary';
import { PrintCaseRecord } from './components/PrintCaseRecord';
import { useStagedReveal } from './hooks/useStagedReveal';
import { useHighlightLink } from './hooks/useHighlightLink';
import { useKeyboardTriage } from './hooks/useKeyboardTriage';
import {
  ChevronRight,
  HelpCircle,
  Bell,
  Clock,
  MoreVertical,
  Search,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [alerts, setAlerts] = useState<AlertData[]>(INITIAL_ALERTS);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(INITIAL_ALERTS[0]?.id || null);
  const [rationale, setRationale] = useState<string>('');
  const [clearedTodayCount, setClearedTodayCount] = useState<number>(12);
  const [dispositionHistory, setDispositionHistory] = useState<DispositionRecord[]>([]);
  const [printTargetRecord, setPrintTargetRecord] = useState<DispositionRecord | null>(null);

  // Modals & Drawers
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState<boolean>(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Selected Alert Data
  const selectedAlert = useMemo(() => {
    return alerts.find((a) => a.id === selectedAlertId) || null;
  }, [alerts, selectedAlertId]);

  const selectedAlertIndex = useMemo(() => {
    return alerts.findIndex((a) => a.id === selectedAlertId);
  }, [alerts, selectedAlertId]);

  // Compute Active Print Data for window.print()
  const activePrintData = useMemo(() => {
    if (printTargetRecord) {
      const alert = INITIAL_ALERTS.find((a) => a.id === printTargetRecord.alertId) || INITIAL_ALERTS[0];
      return { alert, record: printTargetRecord };
    }
    if (dispositionHistory.length > 0) {
      const record = dispositionHistory[0];
      const alert = INITIAL_ALERTS.find((a) => a.id === record.alertId) || INITIAL_ALERTS[0];
      return { alert, record };
    }
    // Fallback if window.print() called before disposing
    const currentAlert = selectedAlert || INITIAL_ALERTS[0];
    const fallbackRecord: DispositionRecord = {
      alertId: currentAlert.id,
      dispositionType: 'clear_false_positive',
      rationale: rationale || 'Case record generated for transaction monitoring audit compliance review.',
      timestamp: new Date().toISOString(),
      analyst: 'S. Rao',
      dispositionCode: 'AUDIT-REC-8841',
    };
    return { alert: currentAlert, record: fallbackRecord };
  }, [printTargetRecord, dispositionHistory, selectedAlert, rationale]);

  const handlePrintRecord = useCallback((record: DispositionRecord) => {
    setPrintTargetRecord(record);
    setTimeout(() => {
      window.print();
    }, 50);
  }, []);

  // Hooks
  const revealState = useStagedReveal(selectedAlert);

  const {
    activeSignalId,
    activeNodeId,
    activeEdgeId,
    activeBarId,
    highlightedNodeIds,
    highlightedEdgeIds,
    highlightedBarIds,
    highlightedSignalIds,
    forceShowThresholdLine,
    hasActiveHighlight,
    hoverSignal,
    hoverNode,
    hoverEdge,
    hoverBar,
    clearHighlight,
  } = useHighlightLink(selectedAlert);

  // Switch Alert
  const handleSelectAlert = useCallback((alert: AlertData) => {
    setSelectedAlertId(alert.id);
    setRationale('');
    clearHighlight();
  }, [clearHighlight]);

  const handleSelectAlertByIndex = useCallback((index: number) => {
    if (alerts[index]) {
      handleSelectAlert(alerts[index]);
    }
  }, [alerts, handleSelectAlert]);

  // Execute Disposition
  const handleExecuteDisposition = useCallback((type: DispositionType, textRationale: string) => {
    if (!selectedAlert) return;

    const currentAlert = selectedAlert;
    const currentAlertId = currentAlert.id;
    const currentIndex = alerts.findIndex((a) => a.id === currentAlertId);

    // Generate compliant disposition code
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    let codePrefix = 'DISP-CL';
    let titleText = 'Alert Cleared';
    let messageText = `${currentAlertId} closed as False Positive.`;
    let canUndo = true;

    if (type === 'escalate_l2') {
      codePrefix = 'DISP-ESC';
      titleText = 'Alert Escalated';
      messageText = `${currentAlertId} transferred to Senior AML Tier 2.`;
      canUndo = true;
    } else if (type === 'freeze_and_sar') {
      codePrefix = 'SAR-FRZ';
      titleText = 'SAR Filed & Account Frozen';
      messageText = `Asset freeze instituted on ${currentAlert.targetAccount}. FinCEN SAR generated.`;
      canUndo = false; // Freeze is irreversible
    }

    const dispCode = `${codePrefix}-${randomSuffix}`;

    const record: DispositionRecord = {
      alertId: currentAlertId,
      dispositionType: type,
      rationale: textRationale,
      timestamp: new Date().toISOString(),
      analyst: 'S. Rao',
      dispositionCode: dispCode,
    };

    // Update history & counter
    setDispositionHistory((prev) => [record, ...prev]);
    setClearedTodayCount((prev) => prev + 1);

    // Filter alert out of queue
    const remainingAlerts = alerts.filter((a) => a.id !== currentAlertId);
    setAlerts(remainingAlerts);

    // Reset rationale
    setRationale('');
    setIsFreezeModalOpen(false);

    // Auto-load next alert in queue if available
    if (remainingAlerts.length > 0) {
      const nextIndex = Math.min(currentIndex, remainingAlerts.length - 1);
      setSelectedAlertId(remainingAlerts[nextIndex].id);
    } else {
      setSelectedAlertId(null);
    }

    // Trigger Toast
    setToast({
      id: `toast-${Date.now()}`,
      type: type === 'freeze_and_sar' ? 'error' : 'success',
      title: titleText,
      message: messageText,
      dispositionCode: dispCode,
      canUndo,
      alertId: currentAlertId,
      previousRecord: record,
    });
  }, [selectedAlert, alerts]);

  // Undo Disposition (Only for Clear and Escalate)
  const handleUndo = useCallback((toastMessage: ToastMessage) => {
    if (!toastMessage.alertId) return;

    // Find the alert template from INITIAL_ALERTS
    const originalAlert = INITIAL_ALERTS.find((a) => a.id === toastMessage.alertId);
    if (!originalAlert) return;

    setAlerts((prev) => [originalAlert, ...prev]);
    setSelectedAlertId(originalAlert.id);
    setClearedTodayCount((prev) => Math.max(0, prev - 1));
    setDispositionHistory((prev) => prev.filter((d) => d.alertId !== toastMessage.alertId));
    setToast(null);
  }, []);

  // Reload Queue for Demo Testing
  const handleResetQueue = useCallback(() => {
    setAlerts(INITIAL_ALERTS);
    setSelectedAlertId(INITIAL_ALERTS[0]?.id || null);
    setRationale('');
    setDispositionHistory([]);
    clearHighlight();
    setToast({
      id: `toast-reset-${Date.now()}`,
      type: 'info',
      title: 'Demo Reset',
      message: 'All 5 compliance alerts restored to open state.',
      canUndo: false,
    });
  }, [clearHighlight]);

  // Keyboard Triage Hook
  const isAnyModalOpen = isFreezeModalOpen || isShortcutModalOpen || isSearchOpen;

  const handleTriggerDispositionFromKey = useCallback((type: DispositionType) => {
    if (type === 'freeze_and_sar') {
      setIsFreezeModalOpen(true);
    } else {
      const textarea = document.getElementById('disposition-rationale-input');
      textarea?.focus();
    }
  }, []);

  const handleToggleSignalFromKey = useCallback((signalIndex: number) => {
    if (selectedAlert && selectedAlert.signals[signalIndex]) {
      const targetSignal = selectedAlert.signals[signalIndex];
      if (activeSignalId === targetSignal.id) {
        hoverSignal(null);
      } else {
        hoverSignal(targetSignal.id);
      }
    }
  }, [selectedAlert, activeSignalId, hoverSignal]);

  const handleCloseAllModals = useCallback(() => {
    setIsFreezeModalOpen(false);
    setIsShortcutModalOpen(false);
    setIsSearchOpen(false);
    setIsRightDrawerOpen(false);
    clearHighlight();
  }, [clearHighlight]);

  useKeyboardTriage({
    alerts,
    selectedAlertIndex,
    onSelectAlert: handleSelectAlertByIndex,
    onTriggerDisposition: handleTriggerDispositionFromKey,
    onToggleSignal: handleToggleSignalFromKey,
    onOpenShortcuts: () => setIsShortcutModalOpen(true),
    onCloseModals: handleCloseAllModals,
    isModalOpen: isAnyModalOpen,
    onToggleSearch: () => setIsSearchOpen((prev) => !prev),
  });

  return (
    <>
      <div
        id="screen-app-container"
        className="h-screen w-full flex flex-col bg-[#0B0E14] text-[#d6e3f9] font-['Inter'] overflow-hidden select-none no-print"
      >
        {/* ═══ TOP NAV BAR ═══ */}
        <header
          className="bg-[#132030] border-b border-[#3c494c]/60 flex justify-between items-center h-[56px] w-full px-6 flex-shrink-0 z-40"
          role="banner"
        >
          {/* Brand & Breadcrumbs */}
          <div className="flex items-center gap-6">
            <span className="font-['Inter'] text-[22px] font-bold text-[#8aebff] tracking-tight">
              Meridian
            </span>
            <nav className="flex items-center gap-2 text-[#bbc9cd] text-[13px] font-medium" aria-label="Breadcrumb">
              <span className="hover:text-white transition-colors cursor-pointer">
                Transaction Monitoring
              </span>
              <ChevronRight className="w-4 h-4 text-[#859397]" />
              <span className="text-[#22D3EE] font-semibold">Queue</span>
            </nav>
          </div>

          {/* Global Controls & User Status */}
          <div className="flex items-center gap-5">
            {/* Quick Search trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-[#071423] border border-[#3c494c]/70 text-[#859397] hover:text-[#d6e3f9] hover:border-[#22D3EE]/50 transition-colors text-[12px] font-['JetBrains_Mono']"
              aria-label="Search alerts"
            >
              <Search className="w-3.5 h-3.5" />
              <span>⌘K to search</span>
            </button>

            {/* Cleared Counter */}
            <div className="flex items-center gap-2 text-[12px] text-[#bbc9cd] font-['JetBrains_Mono']">
              <span>Cleared today:</span>
              <span className="text-[#34D399] font-bold text-[13px] bg-[#34D399]/10 px-2 py-0.5 rounded border border-[#34D399]/30">
                {clearedTodayCount}
              </span>
            </div>

            {/* Icon Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShortcutModalOpen(true)}
                className="text-[#859397] hover:text-[#22D3EE] hover:bg-[#141922] p-1.5 rounded transition-colors"
                title="Keyboard Shortcuts (?)"
                aria-label="Keyboard Shortcuts"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetQueue}
                className="text-[#859397] hover:text-[#22D3EE] hover:bg-[#141922] p-1.5 rounded transition-colors"
                title="Reset Demo Data"
                aria-label="Reset Demo Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#3c494c]/60">
              <div className="w-8 h-8 rounded-full bg-[#1e2b3b] border border-[#3c494c] overflow-hidden flex items-center justify-center font-['JetBrains_Mono'] text-[12px] font-bold text-[#8aebff]">
                SR
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-semibold leading-tight text-[#d6e3f9]">
                  S. Rao
                </span>
                <span className="text-[10px] text-[#859397] font-['JetBrains_Mono'] leading-tight">
                  L2 Analyst
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ═══ MAIN WORKSPACE (LEFT QUEUE + CENTER WORKSPACE + RIGHT RISK PANEL) ═══ */}
        <div className="flex flex-1 h-[calc(100vh-56px-24px)] overflow-hidden relative">
          {/* Left Alert Queue */}
          <AlertQueue
            alerts={alerts}
            selectedAlertId={selectedAlertId}
            onSelectAlert={handleSelectAlert}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Center Workspace or Shift Summary (When Queue is Empty) */}
          {selectedAlert ? (
            <div className="flex-1 flex flex-col bg-[#0B0E14] relative overflow-hidden z-10">
              {/* Sticky Header */}
              <div className="h-[60px] border-b border-[#1F2733] flex items-center px-6 justify-between flex-shrink-0 bg-[#0B0E14]/95 backdrop-blur-sm z-30">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-['JetBrains_Mono'] text-[18px] font-bold text-[#d6e3f9] tracking-tight">
                    {selectedAlert.id}
                  </h1>
                  <div className="h-4 w-px bg-[#3c494c]" />
                  <span className="font-['Inter'] text-[14px] font-medium text-[#d6e3f9]">
                    {selectedAlert.title}
                  </span>
                  <span className="px-2 py-0.5 rounded border border-[#22D3EE] text-[#22D3EE] font-['Inter'] font-bold text-[10px] tracking-wider uppercase">
                    {selectedAlert.ruleCategory}
                  </span>
                  <span className="px-2 py-0.5 rounded border border-[#3c494c] text-[#859397] font-['JetBrains_Mono'] text-[11px]">
                    {selectedAlert.ruleCode}
                  </span>
                </div>

                {/* SLA Timer & Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-[#FB923C] bg-[#FB923C]/10 border border-[#FB923C]/30 px-3 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-['JetBrains_Mono'] text-[12px] font-bold">
                      {selectedAlert.slaRemaining} SLA
                    </span>
                  </div>

                  {/* Toggle Right Panel Drawer for smaller screens */}
                  <button
                    onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}
                    className="xl:hidden p-1.5 text-[#859397] hover:text-[#d6e3f9] hover:bg-[#141922] rounded transition-colors"
                    title="Toggle Risk Details"
                    aria-label="Toggle Risk Details"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Center Panels: Entity Graph + Transaction Timeline */}
              <div className="flex-1 overflow-y-auto">
                {/* Upper Panel: Entity Network */}
                <EntityGraph
                  alert={selectedAlert}
                  revealState={revealState}
                  highlightedNodeIds={highlightedNodeIds}
                  highlightedEdgeIds={highlightedEdgeIds}
                  hasActiveHighlight={hasActiveHighlight}
                  onHoverNode={hoverNode}
                  onHoverEdge={hoverEdge}
                />

                {/* Lower Panel: Transaction Timeline */}
                <TransactionTimeline
                  alert={selectedAlert}
                  revealState={revealState}
                  highlightedBarIds={highlightedBarIds}
                  forceShowThresholdLine={forceShowThresholdLine}
                  hasActiveHighlight={hasActiveHighlight}
                  onHoverBar={hoverBar}
                />
              </div>
            </div>
          ) : (
            /* Empty Queue Shift Summary */
            <ShiftSummary
              dispositionHistory={dispositionHistory}
              onReloadQueue={handleResetQueue}
              onPrintRecord={handlePrintRecord}
            />
          )}

          {/* Right Panel (Risk Assessment, Auto-Summary, Disposition) */}
          {selectedAlert && (
            <div className="hidden xl:flex">
              <RiskPanel
                alert={selectedAlert}
                highlightedSignalIds={highlightedSignalIds}
                hasActiveHighlight={hasActiveHighlight}
                onHoverSignal={hoverSignal}
                onDisposition={handleExecuteDisposition}
                rationale={rationale}
                onRationaleChange={setRationale}
                onOpenFreezeModal={() => setIsFreezeModalOpen(true)}
              />
            </div>
          )}

          {/* Responsive Mobile Drawer for Right Panel */}
          {selectedAlert && isRightDrawerOpen && (
            <div className="xl:hidden">
              <div
                className="fixed inset-0 bg-black/60 z-40"
                onClick={() => setIsRightDrawerOpen(false)}
              />
              <RiskPanel
                alert={selectedAlert}
                highlightedSignalIds={highlightedSignalIds}
                hasActiveHighlight={hasActiveHighlight}
                onHoverSignal={hoverSignal}
                onDisposition={handleExecuteDisposition}
                rationale={rationale}
                onRationaleChange={setRationale}
                onOpenFreezeModal={() => setIsFreezeModalOpen(true)}
                isDrawerOpen={true}
                onCloseDrawer={() => setIsRightDrawerOpen(false)}
              />
            </div>
          )}
        </div>

        {/* ═══ FOOTER LINE (ALWAYS VISIBLE) ═══ */}
        <footer className="h-[28px] bg-[#071423] border-t border-[#1F2733] px-6 flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#859397] select-none z-50">
          <div className="flex items-center gap-3">
            <span>Demonstration prototype — synthetic data. Not a production compliance system.</span>
            <span className="text-[#3c494c]">•</span>
            <button
              id="btn-reset-demo-footer"
              onClick={handleResetQueue}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[#22D3EE] hover:text-[#56e2f5] hover:bg-[#22D3EE]/10 border border-[#22D3EE]/30 hover:border-[#22D3EE]/60 transition-colors cursor-pointer"
              title="Restore all alerts to open state and reset demonstration queue"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset demo</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span>Active Analyst: S. Rao (ID: 8841-L2)</span>
            <span>Meridian Core v2.4</span>
          </div>
        </footer>

        {/* ═══ MODALS & TOAST NOTIFICATIONS ═══ */}
        {/* File SAR & Freeze Account Modal */}
        {selectedAlert && (
          <FreezeModal
            alert={selectedAlert}
            isOpen={isFreezeModalOpen}
            onClose={() => setIsFreezeModalOpen(false)}
            onConfirm={() => handleExecuteDisposition('freeze_and_sar', rationale || 'Account frozen. SAR filed.')}
          />
        )}

        {/* Keyboard Shortcuts Overlay */}
        <ShortcutOverlay
          isOpen={isShortcutModalOpen}
          onClose={() => setIsShortcutModalOpen(false)}
        />

        {/* Search Modal */}
        {isSearchOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <div
              className="w-full max-w-[500px] bg-[#141922] border border-[#22D3EE] rounded-lg shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-[#1F2733] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#22D3EE]" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alerts by ID, entity name, or rule code..."
                  className="w-full bg-transparent text-[13px] text-[#d6e3f9] placeholder-[#859397] outline-none"
                />
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto space-y-1">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      handleSelectAlert(a);
                      setIsSearchOpen(false);
                    }}
                    className="p-2 rounded hover:bg-[#1e2b3b] cursor-pointer flex justify-between items-center text-[12px]"
                  >
                    <div>
                      <span className="font-['JetBrains_Mono'] font-bold text-[#22D3EE] mr-2">
                        {a.id}
                      </span>
                      <span className="text-[#d6e3f9]">{a.title}</span>
                      <span className="text-[#859397] ml-2">({a.subjectName})</span>
                    </div>
                    <span className="text-[#FB923C] text-[10px] font-['JetBrains_Mono']">
                      Score: {a.initialScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        <Toast
          toast={toast}
          onDismiss={() => setToast(null)}
          onUndo={handleUndo}
          onPrint={handlePrintRecord}
        />
      </div>

      {/* ═══ DEDICATED PRINT RECORD (VISIBLE ONLY IN WINDOW.PRINT) ═══ */}
      <PrintCaseRecord
        alert={activePrintData.alert}
        disposition={activePrintData.record}
      />
    </>
  );
}
