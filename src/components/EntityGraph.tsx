import React, { useState, useMemo } from 'react';
import { AlertData, GraphNodeData } from '../types';
import { GraphNode } from './GraphNode';
import { Maximize2, Minimize2, Info, X } from 'lucide-react';
import { StagedRevealState } from '../hooks/useStagedReveal';

interface EntityGraphProps {
  alert: AlertData;
  revealState: StagedRevealState;
  highlightedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
  hasActiveHighlight: boolean;
  onHoverNode: (id: string | null) => void;
  onHoverEdge?: (id: string | null) => void;
}

export const EntityGraph: React.FC<EntityGraphProps> = ({
  alert,
  revealState,
  highlightedNodeIds,
  highlightedEdgeIds,
  hasActiveHighlight,
  onHoverNode,
  onHoverEdge,
}) => {
  const [hopDepth, setHopDepth] = useState<1 | 2>(2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Filter nodes & edges by hopDepth
  const visibleNodes = useMemo(() => {
    return alert.nodes.filter((node) => node.hopLevel <= hopDepth);
  }, [alert.nodes, hopDepth]);

  const visibleEdges = useMemo(() => {
    return alert.edges.filter((edge) => {
      if (edge.hopLevel > hopDepth) return false;
      const sourceExists = visibleNodes.some((n) => n.id === edge.source);
      const targetExists = visibleNodes.some((n) => n.id === edge.target);
      return sourceExists && targetExists;
    });
  }, [alert.edges, visibleNodes, hopDepth]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNodeData>();
    alert.nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [alert.nodes]);

  return (
    <div
      id="entity-network-container"
      className={`border-b border-[#1F2733] relative flex flex-col bg-[#0B0E14] ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen w-screen'
          : 'h-[380px]'
      }`}
    >
      {/* Panel Header */}
      <div className="px-6 py-2.5 flex justify-between items-center z-20 border-b border-[#1F2733]/50 bg-[#0B0E14]/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h3 className="font-['Inter'] text-[14px] text-[#d6e3f9] font-semibold tracking-tight">
            Entity Network
          </h3>
          <span className="text-[11px] text-[#859397] font-['JetBrains_Mono']">
            {visibleNodes.length} entities • {visibleEdges.length} connections
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 1 HOP / 2 HOPS Toggle */}
          <div className="flex bg-[#1e2b3b] rounded p-0.5 border border-[#3c494c]/50">
            <button
              id="hop-depth-1-btn"
              onClick={() => setHopDepth(1)}
              className={`px-3 py-1 rounded-sm font-['Inter'] font-bold text-[10px] tracking-wider transition-all ${
                hopDepth === 1
                  ? 'bg-[#141922] text-[#22D3EE] shadow-sm'
                  : 'text-[#859397] hover:text-[#d6e3f9]'
              }`}
            >
              1 HOP
            </button>
            <button
              id="hop-depth-2-btn"
              onClick={() => setHopDepth(2)}
              className={`px-3 py-1 rounded-sm font-['Inter'] font-bold text-[10px] tracking-wider transition-all ${
                hopDepth === 2
                  ? 'bg-[#293646] text-[#22D3EE] shadow-sm'
                  : 'text-[#859397] hover:text-[#d6e3f9]'
              }`}
            >
              2 HOPS
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-[#859397] hover:text-[#d6e3f9] hover:bg-[#141922] rounded transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main SVG Graph Canvas */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#141922] to-[#0B0E14] flex items-center justify-center">
        {/* Background Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#d6e3f9 1px, transparent 1px), linear-gradient(90deg, #d6e3f9 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Inline SVG */}
        <svg
          viewBox="0 0 600 380"
          className="w-full h-full max-w-[700px] max-h-[360px] select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Arrow Marker for Directional Flows */}
            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#22D3EE" />
            </marker>
            <marker
              id="arrow-muted"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#3c494c" />
            </marker>
          </defs>

          {/* EDGES */}
          <g className="edges-layer">
            {visibleEdges.map((edge) => {
              const source = nodeMap.get(edge.source);
              const target = nodeMap.get(edge.target);
              if (!source || !target) return null;

              const isEdgeHighlighted = highlightedEdgeIds.has(edge.id);
              const isConnectedNodeHovered =
                highlightedNodeIds.has(edge.source) || highlightedNodeIds.has(edge.target);
              const isEdgeDirectHover = hoveredEdgeId === edge.id;
              const isHoveredOrActive =
                isEdgeDirectHover || isConnectedNodeHovered || isEdgeHighlighted;

              const isEdgeDimmed = hasActiveHighlight && !isHoveredOrActive;

              // Calculate length and unit normal vector for 24px perpendicular offset
              const dx = target.x - source.x;
              const dy = target.y - source.y;
              const length = Math.sqrt(dx * dx + dy * dy);

              // 24px perpendicular offset
              const perpOffset = 24;
              let nx = length > 0 ? -dy / length : 0;
              let ny = length > 0 ? dx / length : 0;

              // Ensure normal vector points upward away from node labels below nodes
              if (ny > 0 || (ny === 0 && nx > 0)) {
                nx = -nx;
                ny = -ny;
              }

              // Position label at the exact midpoint (50%) between endpoints, shifted 24px perpendicular
              const midX = (source.x + target.x) / 2 + nx * perpOffset;
              const midY = (source.y + target.y) / 2 + ny * perpOffset;

              // Display transfer amount or connection label
              const displayLabel = edge.amount || edge.label;
              const labelLength = displayLabel ? displayLabel.length : 0;
              const badgeWidth = Math.max(36, labelLength * 6.5 + 14);
              const badgeHeight = 18;

              return (
                <g
                  key={edge.id}
                  className="transition-opacity duration-200"
                  style={{ opacity: isEdgeDimmed ? 0.2 : 1 }}
                >
                  {/* Invisible wide hit-area line for easy hovering */}
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="transparent"
                    strokeWidth="16"
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredEdgeId(edge.id);
                      onHoverEdge?.(edge.id);
                    }}
                    onMouseLeave={() => {
                      setHoveredEdgeId(null);
                      onHoverEdge?.(null);
                    }}
                  />

                  {/* Visible Edge Line */}
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={
                      isHoveredOrActive
                        ? '#22D3EE'
                        : edge.isDashed
                        ? '#859397'
                        : '#3c494c'
                    }
                    strokeWidth={isHoveredOrActive ? '2.5' : edge.isDashed ? '1.5' : '1.8'}
                    strokeDasharray={
                      revealState.edgesDrawn
                        ? edge.isDashed
                          ? '5,4'
                          : 'none'
                        : `${length}`
                    }
                    strokeDashoffset={revealState.edgesDrawn ? 0 : length}
                    className="pointer-events-none"
                    style={{
                      transition:
                        'stroke-dashoffset 400ms ease-out, stroke 200ms ease, stroke-width 200ms ease',
                    }}
                  />

                  {/* Midpoint Transfer Amount Mono Label (Visible on hover of edge or connected nodes) */}
                  {displayLabel && (
                    <g
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        opacity: revealState.edgesDrawn && isHoveredOrActive ? 1 : 0,
                        pointerEvents: isHoveredOrActive ? 'auto' : 'none',
                        transformOrigin: `${midX}px ${midY}px`,
                        transform:
                          revealState.edgesDrawn && isHoveredOrActive
                            ? 'scale(1)'
                            : 'scale(0.8)',
                        transition: 'opacity 200ms ease, transform 200ms ease',
                      }}
                      onMouseEnter={() => {
                        setHoveredEdgeId(edge.id);
                        onHoverEdge?.(edge.id);
                      }}
                      onMouseLeave={() => {
                        setHoveredEdgeId(null);
                        onHoverEdge?.(null);
                      }}
                    >
                      {/* Background Badge Pill */}
                      <rect
                        x={midX - badgeWidth / 2}
                        y={midY - badgeHeight / 2}
                        width={badgeWidth}
                        height={badgeHeight}
                        rx={3.5}
                        ry={3.5}
                        fill="#0B0E14"
                        stroke={isHoveredOrActive ? '#22D3EE' : '#3c494c'}
                        strokeWidth={isHoveredOrActive ? '1.2' : '1'}
                      />
                      {/* Small Mono Label Text */}
                      <text
                        x={midX}
                        y={midY + 0.5}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={isHoveredOrActive ? '#22D3EE' : '#d6e3f9'}
                        fontSize="9.5px"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="600"
                        letterSpacing="-0.02em"
                        className="select-none pointer-events-none"
                      >
                        {displayLabel}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* NODES */}
          <g className="nodes-layer">
            {visibleNodes.map((node) => {
              const isNodeRevealed = revealState.revealedNodeIds.has(node.id);
              const isNodeHighlighted = highlightedNodeIds.has(node.id);
              const isNodeDimmed = hasActiveHighlight && !isNodeHighlighted;

              return (
                <GraphNode
                  key={node.id}
                  node={node}
                  isRevealed={isNodeRevealed}
                  isHighlighted={isNodeHighlighted}
                  isDimmed={isNodeDimmed}
                  isSelected={selectedNode?.id === node.id}
                  onHover={onHoverNode}
                  onClick={(n) => setSelectedNode(selectedNode?.id === n.id ? null : n)}
                />
              );
            })}
          </g>
        </svg>

        {/* Selected Node Details Mini Drawer / Inspector */}
        {selectedNode && (
          <div className="absolute bottom-3 left-6 z-30 bg-[#141922] border border-[#22D3EE]/50 rounded-lg p-3 w-[260px] shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-[#1F2733] pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span className="font-['JetBrains_Mono'] font-bold text-[11px] text-[#d6e3f9]">
                  {selectedNode.label}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#859397] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-[#859397]">
                <span>Type:</span>
                <span className="text-[#d6e3f9] font-medium">{selectedNode.details.entityType}</span>
              </div>
              <div className="flex justify-between text-[#859397]">
                <span>Jurisdiction:</span>
                <span className="text-[#d6e3f9] font-medium truncate max-w-[140px]">
                  {selectedNode.details.jurisdiction}
                </span>
              </div>
              {selectedNode.details.balance && (
                <div className="flex justify-between text-[#859397]">
                  <span>Balance:</span>
                  <span className="text-[#22D3EE] font-['JetBrains_Mono']">
                    {selectedNode.details.balance}
                  </span>
                </div>
              )}
              {selectedNode.details.accountAge && (
                <div className="flex justify-between text-[#859397]">
                  <span>Account Age:</span>
                  <span className="text-[#d6e3f9]">{selectedNode.details.accountAge}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
