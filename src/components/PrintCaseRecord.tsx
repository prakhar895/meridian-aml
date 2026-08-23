import React from 'react';
import { AlertData, DispositionRecord, GraphNodeData } from '../types';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface PrintCaseRecordProps {
  alert: AlertData;
  disposition: DispositionRecord;
}

export const PrintCaseRecord: React.FC<PrintCaseRecordProps> = ({ alert, disposition }) => {
  const isFreeze = disposition.dispositionType === 'freeze_and_sar';
  const isEscalate = disposition.dispositionType === 'escalate_l2';
  const isClear = disposition.dispositionType === 'clear_false_positive';

  const dispositionTitle = isFreeze
    ? 'FROZEN & FINCEN SAR FILED'
    : isEscalate
    ? 'ESCALATED TO TIER 2 SENIOR AML'
    : 'CLEARED — FALSE POSITIVE';

  const dispositionBg = isFreeze
    ? 'bg-rose-50 border-rose-600 text-rose-950'
    : isEscalate
    ? 'bg-amber-50 border-amber-600 text-amber-950'
    : 'bg-emerald-50 border-emerald-600 text-emerald-950';

  const dispositionBadgeBg = isFreeze
    ? 'bg-rose-600 text-white'
    : isEscalate
    ? 'bg-amber-600 text-white'
    : 'bg-emerald-700 text-white';

  const nodesById = new Map<string, GraphNodeData>(alert.nodes.map((n) => [n.id, n]));

  return (
    <div
      id="print-case-record"
      className="hidden print:block text-slate-900 bg-white p-6 font-sans antialiased text-[11px] leading-tight select-text w-full max-w-[800px] mx-auto"
      style={{ minHeight: '100%', boxSizing: 'border-box' }}
    >
      {/* ═══ HEADER BAR ═══ */}
      <div className="border-b-2 border-slate-800 pb-3 mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-black tracking-tight text-slate-900 font-mono">
              MERIDIAN AML
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-slate-900 text-white rounded">
              CASE AUDIT RECORD
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Automated BSA/AML Compliance Ledger • Case #{alert.caseNumber}
          </p>
        </div>
        <div className="text-right font-mono text-[10px] text-slate-600">
          <div><span className="font-bold text-slate-900">DISPOSITION CODE:</span> {disposition.dispositionCode}</div>
          <div><span className="font-bold text-slate-900">TIMESTAMP:</span> {new Date(disposition.timestamp).toLocaleString()}</div>
          <div><span className="font-bold text-slate-900">ANALYST:</span> {disposition.analyst} (ID: 8841-L2)</div>
        </div>
      </div>

      {/* ═══ CASE METADATA GRID ═══ */}
      <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded p-2.5 mb-3 text-[11px]">
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Alert ID</span>
          <span className="font-mono font-bold text-slate-900 text-[12px]">{alert.id}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Primary Subject</span>
          <span className="font-semibold text-slate-900">{alert.subjectName}</span>
          <span className="text-[9px] text-slate-500 font-mono block">{alert.targetAccount}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Rule Classification</span>
          <span className="font-bold text-slate-800">{alert.ruleCategory}</span>
          <span className="text-[9px] text-slate-500 font-mono block">{alert.ruleCode}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold uppercase text-slate-500 block">Risk Score</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono font-bold text-[14px] text-rose-700">{alert.initialScore}</span>
            <span className="text-[9px] text-slate-500">/ 100 Initial</span>
          </div>
        </div>
      </div>

      {/* ═══ DISPOSITION & RATIONALE SECTION ═══ */}
      <div className={`border-2 rounded p-3 mb-3 ${dispositionBg}`}>
        <div className="flex items-center justify-between mb-1.5 border-b border-slate-300 pb-1.5">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wide ${dispositionBadgeBg}`}>
              {dispositionTitle}
            </span>
            <span className="font-mono text-[10px] font-bold">
              Ref: {disposition.dispositionCode}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-600">
            Adjudicated by {disposition.analyst}
          </span>
        </div>

        <div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 block mb-0.5">
            Documented Compliance Rationale:
          </span>
          <p className="text-[11px] leading-relaxed font-sans text-slate-900 bg-white/80 border border-slate-200 rounded p-2 italic">
            "{disposition.rationale || 'No narrative rationale provided by analyst.'}"
          </p>
        </div>
      </div>

      {/* ═══ ENTITY GRAPH TOPOLOGY ═══ */}
      <div className="border border-slate-200 rounded p-2.5 mb-3 bg-white">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
            Entity Network Graph Topology
          </span>
          <span className="text-[9px] font-mono text-slate-500">
            {alert.nodes.length} Nodes • {alert.edges.length} Interconnected Links
          </span>
        </div>

        {/* Compact Print-Friendly SVG Vector Canvas */}
        <div className="w-full bg-slate-900 rounded border border-slate-700 overflow-hidden flex items-center justify-center">
          <svg
            viewBox="0 0 600 300"
            className="w-full h-[180px]"
            style={{ display: 'block' }}
          >
            <defs>
              <pattern id="print-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="600" height="300" fill="#0f172a" />
            <rect width="600" height="300" fill="url(#print-grid)" />

            {/* Edges */}
            {alert.edges.map((edge) => {
              const src = nodesById.get(edge.source);
              const tgt = nodesById.get(edge.target);
              if (!src || !tgt) return null;

              // Scale Y to fit 300 height
              const sy = (src.y / 380) * 270 + 15;
              const ty = (tgt.y / 380) * 270 + 15;
              const sx = src.x;
              const tx = tgt.x;
              const dx = tx - sx;
              const dy = ty - sy;
              const length = Math.sqrt(dx * dx + dy * dy);
              const perpOffset = 18;
              let nx = length > 0 ? -dy / length : 0;
              let ny = length > 0 ? dx / length : 0;
              if (ny > 0 || (ny === 0 && nx > 0)) {
                nx = -nx;
                ny = -ny;
              }
              const midX = (sx + tx) / 2 + nx * perpOffset;
              const midY = (sy + ty) / 2 + ny * perpOffset;
              const label = edge.amount || edge.label || '';

              return (
                <g key={`print-edge-${edge.id}`}>
                  <line
                    x1={sx}
                    y1={sy}
                    x2={tx}
                    y2={ty}
                    stroke={edge.isDashed ? '#64748b' : '#38bdf8'}
                    strokeWidth={edge.isDashed ? '1.5' : '2'}
                    strokeDasharray={edge.isDashed ? '4,4' : undefined}
                  />
                  {label && (
                    <g>
                      <rect
                        x={midX - (label.length * 3 + 8)}
                        y={midY - 7}
                        width={label.length * 6 + 16}
                        height={14}
                        rx={3}
                        fill="#020617"
                        stroke="#38bdf8"
                        strokeWidth="0.8"
                      />
                      <text
                        x={midX}
                        y={midY + 3}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8px"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {alert.nodes.map((node) => {
              const ny = (node.y / 380) * 270 + 15;
              const nx = node.x;
              const isSubj = node.type === 'subject';
              const r = isSubj ? 18 : 12;
              const isFlagged = node.details?.flagged || node.risk === 'critical';

              return (
                <g key={`print-node-${node.id}`}>
                  {/* Node Circle */}
                  <circle
                    cx={nx}
                    cy={ny}
                    r={r}
                    fill={isSubj ? '#0284c7' : isFlagged ? '#e11d48' : '#334155'}
                    stroke={isSubj ? '#bae6fd' : isFlagged ? '#fecdd3' : '#94a3b8'}
                    strokeWidth="1.5"
                  />
                  {/* Node Label Text */}
                  <text
                    x={nx}
                    y={ny + r + 11}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="9px"
                    fontWeight={isSubj ? 'bold' : 'normal'}
                    fontFamily="sans-serif"
                  >
                    {node.label}
                  </text>
                  {/* Jurisdiction tag */}
                  <text
                    x={nx}
                    y={ny + r + 20}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7.5px"
                    fontFamily="monospace"
                  >
                    {node.details?.jurisdiction || node.type}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ═══ DETECTED SIGNALS TABLE ═══ */}
      <div className="border border-slate-200 rounded p-2.5 mb-3 bg-white">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
            Detected Risk Signals & Corroborating Evidence
          </span>
          <span className="text-[9px] font-mono text-slate-500">
            {alert.signals.length} Signals Evaluated
          </span>
        </div>

        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono text-[9px]">
              <th className="py-1 px-1.5">CODE</th>
              <th className="py-1 px-1.5">SIGNAL NAME</th>
              <th className="py-1 px-1.5">SEVERITY</th>
              <th className="py-1 px-1.5">EVIDENCE & CORRELATION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alert.signals.map((sig) => {
              const isCrit = sig.severity === 'critical';
              const isHigh = sig.severity === 'high';
              return (
                <tr key={`print-sig-${sig.id}`}>
                  <td className="py-1 px-1.5 font-mono font-bold text-slate-800">{sig.code}</td>
                  <td className="py-1 px-1.5 font-semibold text-slate-900">{sig.label}</td>
                  <td className="py-1 px-1.5">
                    <span
                      className={`inline-block px-1 py-0.2 text-[8.5px] font-mono font-bold rounded ${
                        isCrit
                          ? 'bg-rose-100 text-rose-800'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sig.severity.toUpperCase()} ({sig.scoreDelta > 0 ? `+${sig.scoreDelta}` : sig.scoreDelta})
                    </span>
                  </td>
                  <td className="py-1 px-1.5 text-slate-700 leading-snug">{sig.description}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══ FOOTER COMPLIANCE ATTESTATION ═══ */}
      <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-[8.5px] text-slate-500 font-mono">
        <div>
          <span>MERIDIAN CORE COMPLIANCE ENGINE • BSA / AML 31 CFR § 1020.320</span>
        </div>
        <div className="text-right">
          <span>CONFIDENTIAL BANK RECORD • AUDIT HASH: {disposition.dispositionCode}-SHA256</span>
        </div>
      </div>
    </div>
  );
};
