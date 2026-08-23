import React, { useState, useMemo } from 'react';
import { AlertData } from '../types';
import { AlertCard } from './AlertCard';
import { Filter, CheckCircle2, Search, X } from 'lucide-react';

interface AlertQueueProps {
  alerts: AlertData[];
  selectedAlertId: string | null;
  onSelectAlert: (alert: AlertData) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const AlertQueue: React.FC<AlertQueueProps> = ({
  alerts,
  selectedAlertId,
  onSelectAlert,
  searchQuery,
  onSearchChange,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        searchQuery === '' ||
        alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.ruleCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'ALL' || alert.ruleCategory === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [alerts, searchQuery, categoryFilter]);

  return (
    <aside
      className="w-[300px] bg-[#0B0E14] border-r border-[#1F2733] flex flex-col flex-shrink-0 z-20 h-full select-none"
      aria-label="Alert Queue"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#1F2733] bg-[#0B0E14]">
        <div className="flex items-center gap-3">
          <h2 className="font-['Inter'] font-semibold text-[16px] text-[#d6e3f9] tracking-tight">
            Alert Queue
          </h2>
          <span className="bg-[#1e2b3b] border border-[#3c494c]/40 px-2 py-0.5 rounded font-['Inter'] text-[11px] font-bold text-[#bbc9cd] tracking-wider uppercase">
            {alerts.length} OPEN
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="queue-filter-button"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`p-1.5 rounded transition-colors ${
              showFilterDropdown || categoryFilter !== 'ALL'
                ? 'bg-[#22D3EE]/20 text-[#22D3EE]'
                : 'text-[#859397] hover:text-[#d6e3f9] hover:bg-[#141922]'
            }`}
            title="Filter Alerts"
            aria-label="Filter alerts"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar if active */}
      {(showFilterDropdown || searchQuery) && (
        <div className="p-2.5 bg-[#141922] border-b border-[#1F2733] space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#859397]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search queue (ID, entity, rule)..."
              className="w-full bg-[#071423] border border-[#1F2733] rounded px-8 py-1.5 text-[12px] text-[#d6e3f9] placeholder-[#859397] focus:outline-none focus:border-[#22D3EE]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#859397] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 flex-wrap text-[10px]">
            {['ALL', 'STRUCTURING', 'VELOCITY', 'SANCTIONS', 'DEVICE_ANOMALY'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded font-['Inter'] font-semibold transition-colors ${
                  categoryFilter === cat
                    ? 'bg-[#22D3EE] text-[#0B0E14]'
                    : 'bg-[#1e2b3b] text-[#bbc9cd] hover:bg-[#293646]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 focus:outline-none" tabIndex={0}>
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#859397]">
            <CheckCircle2 className="w-10 h-10 mb-2 opacity-40 text-[#22D3EE]" />
            <p className="text-[13px] font-medium text-[#bbc9cd]">No matching alerts</p>
            <p className="text-[11px] mt-1 text-[#859397]">
              {alerts.length === 0 ? 'All alerts triaged for this shift' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert, idx) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              index={idx}
              isSelected={alert.id === selectedAlertId}
              onSelect={() => onSelectAlert(alert)}
            />
          ))
        )}
      </div>

      {/* Footer shortcut tip */}
      <div className="p-2 border-t border-[#1F2733] bg-[#071423] text-center text-[10px] text-[#859397] font-['JetBrains_Mono']">
        <span className="bg-[#141922] px-1.5 py-0.5 rounded border border-[#1F2733] mr-1 text-[#bbc9cd]">J</span>
        <span className="bg-[#141922] px-1.5 py-0.5 rounded border border-[#1F2733] mr-1.5 text-[#bbc9cd]">K</span>
        navigate queue
      </div>
    </aside>
  );
};
