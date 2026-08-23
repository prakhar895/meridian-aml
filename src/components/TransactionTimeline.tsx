import React, { useState } from 'react';
import { AlertData, TimelineTransaction } from '../types';
import { StagedRevealState } from '../hooks/useStagedReveal';
import { formatCurrency } from '../lib/format';

interface TransactionTimelineProps {
  alert: AlertData;
  revealState: StagedRevealState;
  highlightedBarIds: Set<string>;
  forceShowThresholdLine: boolean;
  hasActiveHighlight: boolean;
  onHoverBar: (id: string | null) => void;
}

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({
  alert,
  revealState,
  highlightedBarIds,
  forceShowThresholdLine,
  hasActiveHighlight,
  onHoverBar,
}) => {
  const [hoveredTx, setHoveredTx] = useState<TimelineTransaction | null>(null);

  // Constants for SVG chart layout
  const width = 640;
  const height = 300;
  const paddingX = 40;
  const paddingY = 35;
  const chartHeight = height - paddingY * 2;
  const axisY = paddingY + chartHeight / 2; // Exact center axis

  const maxAmount = 12000; // CTR threshold reference scale ($10k is ~83% of scale)
  const ctrThresholdY = axisY - (10000 / maxAmount) * (chartHeight / 2 - 10);

  // Calculate X positions for transactions
  const totalTransactions = alert.transactions.length;
  const barWidth = 14;
  const slotWidth = (width - paddingX * 2) / Math.max(1, totalTransactions);

  // Single trigger marker calculation
  const triggerTxIndex = alert.transactions.findIndex((tx) => tx.isTrigger);
  const triggerX =
    triggerTxIndex !== -1
      ? paddingX + triggerTxIndex * slotWidth + slotWidth / 2
      : null;

  // Solid background pill dimensions & offset positioning above the plot area
  const pillWidth = 98;
  const pillHeight = 18;
  const pillY = paddingY - 17;
  // Offset horizontally so it stays cleanly within bounds and never collides with $10k CTR threshold label at right
  const pillCenterX =
    triggerX !== null
      ? Math.max(
          paddingX + pillWidth / 2,
          Math.min(width - paddingX - pillWidth / 2 - 120, triggerX)
        )
      : null;

  return (
    <div
      id="transaction-timeline-container"
      className="h-[340px] p-6 flex flex-col bg-[#0B0E14] relative select-none"
    >
      {/* Header with Legend */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <h3 className="font-['Inter'] text-[14px] text-[#d6e3f9] font-semibold tracking-tight">
            Transaction Timeline
          </h3>
          <span className="text-[11px] text-[#859397] font-['JetBrains_Mono']">
            {alert.transactions.length} events logged
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-['Inter']">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#8aebff] rounded-sm" />
            <span className="text-[#bbc9cd]">Deposits (Inflow)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#444c59] rounded-sm" />
            <span className="text-[#bbc9cd]">Transfers (Outflow)</span>
          </div>
        </div>
      </div>

      {/* Main SVG Timeline */}
      <div className="flex-1 relative flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full max-w-[760px] overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background subtle grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#1F2733"
            strokeDasharray="2 4"
            opacity="0.5"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#1F2733"
            strokeDasharray="2 4"
            opacity="0.5"
          />

          {/* $10,000 CTR Threshold Reference Line */}
          <g
            className="transition-all duration-300"
            style={{
              opacity: forceShowThresholdLine ? 1 : 0.45,
            }}
          >
            <line
              x1={paddingX}
              y1={ctrThresholdY}
              x2={width - paddingX}
              y2={ctrThresholdY}
              stroke={forceShowThresholdLine ? '#F43F5E' : '#F43F5E'}
              strokeWidth={forceShowThresholdLine ? '1.8' : '1'}
              strokeDasharray={forceShowThresholdLine ? '4 2' : '4 4'}
            />
            <text
              x={width - paddingX}
              y={ctrThresholdY - 6}
              textAnchor="end"
              fill={forceShowThresholdLine ? '#F43F5E' : '#F43F5E'}
              fontSize="10px"
              fontFamily="JetBrains Mono, monospace"
              fontWeight={forceShowThresholdLine ? '700' : '500'}
            >
              $10,000 CTR threshold
            </text>
          </g>

          {/* Central Baseline Axis */}
          <line
            x1={paddingX - 10}
            y1={axisY}
            x2={width - paddingX + 10}
            y2={axisY}
            stroke="#3c494c"
            strokeWidth="1.5"
          />

          {/* Single Alert Trigger Marker & Solid Background Pill */}
          {triggerX !== null && pillCenterX !== null && (
            <g className="trigger-marker pointer-events-none">
              {/* Single Vertical dashed line */}
              <line
                x1={triggerX}
                y1={paddingY - 6}
                x2={triggerX}
                y2={height - paddingY + 8}
                stroke="#22D3EE"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity="0.85"
              />

              {/* Small solid-background pill anchored above the plot area */}
              <g transform={`translate(${pillCenterX}, ${pillY})`}>
                <rect
                  x={-pillWidth / 2}
                  y={-pillHeight / 2}
                  width={pillWidth}
                  height={pillHeight}
                  rx={4}
                  ry={4}
                  fill="#071423"
                  stroke="#22D3EE"
                  strokeWidth="1"
                />
                <text
                  x={0}
                  y={0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#22D3EE"
                  fontSize="8.5px"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="700"
                  letterSpacing="0.04em"
                >
                  Alert triggered
                </text>
              </g>
            </g>
          )}

          {/* Bars Rendering */}
          {alert.transactions.map((tx, idx) => {
            const isRevealed = revealState.revealedBarIds.has(tx.id);
            const isHighlighted = highlightedBarIds.has(tx.id);
            const isDimmed = hasActiveHighlight && !isHighlighted;

            const x = paddingX + idx * slotWidth + slotWidth / 2 - barWidth / 2;

            // Height scaling
            const clampedAmount = Math.min(tx.amount, maxAmount);
            const barHeight = ((clampedAmount / maxAmount) * (chartHeight / 2 - 15));

            const isDeposit = tx.type === 'deposit';
            const y = isDeposit ? axisY - (isRevealed ? barHeight : 0) : axisY;
            const renderedHeight = isRevealed ? barHeight : 0;

            // Highlighting only changes brightness and opacity, never the color category:
            // - Deposits stay cyan and upward
            // - Transfers stay grey and downward
            const depositBaseColor = '#8aebff';
            const depositHighlightColor = '#22D3EE';
            const transferBaseColor = '#444c59';
            const transferHighlightColor = '#94a3b8';

            const barColor = isDeposit
              ? (isHighlighted ? depositHighlightColor : depositBaseColor)
              : (isHighlighted ? transferHighlightColor : transferBaseColor);

            return (
              <g
                key={tx.id}
                tabIndex={0}
                role="button"
                aria-label={`${tx.date}: ${tx.type} of ${formatCurrency(tx.amount)}`}
                className={`cursor-pointer outline-none transition-all duration-200 ${
                  isDeposit ? 'focus:ring-1 focus:ring-[#22D3EE]' : 'focus:ring-1 focus:ring-[#94a3b8]'
                }`}
                onMouseEnter={() => {
                  setHoveredTx(tx);
                  onHoverBar(tx.id);
                }}
                onMouseLeave={() => {
                  setHoveredTx(null);
                  onHoverBar(null);
                }}
                onFocus={() => {
                  setHoveredTx(tx);
                  onHoverBar(tx.id);
                }}
                onBlur={() => {
                  setHoveredTx(null);
                  onHoverBar(null);
                }}
                style={{
                  opacity: isDimmed ? 0.25 : 1,
                  transition: 'opacity 200ms ease',
                }}
              >
                {/* Highlight Glow */}
                {isHighlighted && (
                  <rect
                    x={x - 2}
                    y={isDeposit ? axisY - barHeight - 2 : axisY - 2}
                    width={barWidth + 4}
                    height={barHeight + 4}
                    fill={isDeposit ? '#22D3EE' : '#94a3b8'}
                    opacity="0.25"
                    rx="3"
                  />
                )}

                {/* Main Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={renderedHeight}
                  fill={barColor}
                  rx={isDeposit ? 2 : 2}
                  style={{
                    transition: 'height 350ms cubic-bezier(0.34, 1.56, 0.64, 1), y 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </g>
            );
          })}

          {/* Date Ticks on Bottom */}
          <g className="date-ticks">
            {['Oct 01', 'Oct 04', 'Oct 07', 'Oct 10', 'Oct 14'].map((dateLabel, i) => {
              const xPos = paddingX + i * ((width - paddingX * 2) / 4);
              return (
                <text
                  key={dateLabel}
                  x={xPos}
                  y={height - 8}
                  textAnchor="middle"
                  fill="#859397"
                  fontSize="10px"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {dateLabel}
                </text>
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip */}
        {hoveredTx && (
          <div className="absolute top-2 right-6 z-30 bg-[#141922] border border-[#22D3EE]/50 rounded p-2.5 shadow-xl text-[11px] font-['JetBrains_Mono'] pointer-events-none">
            <div className="flex items-center justify-between gap-3 text-[#bbc9cd] border-b border-[#1F2733] pb-1 mb-1">
              <span>{hoveredTx.date}</span>
              <span className="text-[#859397]">{hoveredTx.timestamp.split(' ')[1]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={hoveredTx.type === 'deposit' ? 'text-[#8aebff]' : 'text-[#FB923C]'}>
                {hoveredTx.type === 'deposit' ? 'INFLOW (Deposit)' : 'OUTFLOW (Wire)'}:
              </span>
              <span className="font-bold text-[#d6e3f9]">
                {formatCurrency(hoveredTx.amount)}
              </span>
            </div>
            <div className="text-[10px] text-[#859397] mt-0.5 max-w-[220px] truncate">
              {hoveredTx.counterparty}
            </div>
            {hoveredTx.isNearThreshold && (
              <div className="text-[10px] text-[#F43F5E] mt-1 font-bold">
                ⚠️ Near CTR $10,000 threshold
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
