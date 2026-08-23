import React from 'react';
import { GraphNodeData } from '../types';
import {
  User,
  Building2,
  Landmark,
  Globe,
  Smartphone,
  ShieldAlert,
  Server,
  Layers,
} from 'lucide-react';

interface GraphNodeProps {
  node: GraphNodeData;
  isRevealed: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onClick: (node: GraphNodeData) => void;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  node,
  isRevealed,
  isHighlighted,
  isDimmed,
  isSelected,
  onHover,
  onClick,
}) => {
  const isSubject = node.type === 'subject';
  const radius = isSubject ? 24 : 16;
  const isFlagged = Boolean(
    node.details?.flagged ||
    (node.risk as string) === 'flagged' ||
    node.risk === 'critical'
  );

  // Icon mapping
  const renderIcon = () => {
    const iconSize = isSubject ? 'w-5 h-5' : 'w-3.5 h-3.5';

    switch (node.type) {
      case 'subject':
        return <User className="w-5 h-5 text-[#F43F5E]" strokeWidth={2} />;
      case 'individual':
        return <User className={`${iconSize} text-[#d6e3f9]`} strokeWidth={2} />;
      case 'bank':
        return <Landmark className={`${iconSize} text-[#FB923C]`} strokeWidth={2} />;
      case 'corporate':
        return <Building2 className={`${iconSize} text-[#859397]`} strokeWidth={2} />;
      case 'crypto_exchange':
        return <Globe className={`${iconSize} text-[#FBBF24]`} strokeWidth={2} />;
      case 'device':
        return <Smartphone className={`${iconSize} text-[#22D3EE]`} strokeWidth={2} />;
      case 'ip_address':
        return <Server className={`${iconSize} text-[#bbc9cd]`} strokeWidth={2} />;
      case 'offshore_shell':
        return <Layers className={`${iconSize} text-[#F43F5E]`} strokeWidth={2} />;
      default:
        return <ShieldAlert className={`${iconSize} text-[#bbc9cd]`} strokeWidth={2} />;
    }
  };

  // Node stroke color
  const getStrokeColor = () => {
    if (isSubject) return '#F43F5E';
    if (node.risk === 'critical') return '#F43F5E';
    if (node.risk === 'high') return '#FB923C';
    if (node.risk === 'medium') return '#FBBF24';
    return '#3c494c';
  };

  return (
    <g
      id={`graph-node-${node.id}`}
      tabIndex={0}
      role="button"
      aria-label={`Node ${node.label}, ${node.type}, Risk: ${node.risk}`}
      className="cursor-pointer outline-none focus:ring-2 focus:ring-[#22D3EE] transition-all duration-300"
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
      onClick={() => onClick(node)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(node);
        }
      }}
      style={{
        transformOrigin: `${node.x}px ${node.y}px`,
        transform: isRevealed ? 'scale(1)' : 'scale(0)',
        opacity: isDimmed ? 0.25 : 1,
        transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
      }}
    >
      {/* Flagged Node SVG Native Concentric Ripple */}
      {isFlagged && isRevealed && (
        <circle
          cx={node.x}
          cy={node.y}
          r={radius + 3}
          fill="none"
          stroke={isSubject || node.risk === 'critical' ? '#F43F5E' : '#FB923C'}
          strokeWidth="1.5"
          opacity="0.8"
          pointerEvents="none"
        >
          <animate
            attributeName="r"
            values={`${radius + 2};${radius + 8};${radius + 8}`}
            keyTimes="0;0.7;1"
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0;0"
            keyTimes="0;0.7;1"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Halo / Highlight pulse ring */}
      {isHighlighted && (
        <circle
          cx={node.x}
          cy={node.y}
          r={radius + 6}
          fill="none"
          stroke={isSubject ? '#F43F5E' : '#22D3EE'}
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.8"
          pointerEvents="none"
        />
      )}

      {/* Outer Selection Border */}
      {isSelected && (
        <circle
          cx={node.x}
          cy={node.y}
          r={radius + 5}
          fill="none"
          stroke="#22D3EE"
          strokeWidth="2"
          pointerEvents="none"
        />
      )}

      {/* Main Node Background Circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={radius}
        fill="#141922"
        stroke={getStrokeColor()}
        strokeWidth={isSubject ? '3' : '2'}
      />

      {/* SVG ForeignObject Icon to render crisp React Lucide icon */}
      <foreignObject
        x={node.x - (isSubject ? 12 : 9)}
        y={node.y - (isSubject ? 12 : 9)}
        width={isSubject ? 24 : 18}
        height={isSubject ? 24 : 18}
        className="pointer-events-none"
      >
        <div className="w-full h-full flex items-center justify-center">
          {renderIcon()}
        </div>
      </foreignObject>

      {/* Text Label Below Node */}
      <g className="pointer-events-none select-none">
        <text
          x={node.x}
          y={node.y + radius + 14}
          textAnchor="middle"
          fill={isHighlighted ? '#22D3EE' : '#d6e3f9'}
          fontSize={isSubject ? '11px' : '10px'}
          fontFamily="JetBrains Mono, monospace"
          fontWeight={isSubject ? '700' : '500'}
        >
          {node.label}
        </text>
        {node.sublabel && (
          <text
            x={node.x}
            y={node.y + radius + 25}
            textAnchor="middle"
            fill="#859397"
            fontSize="9px"
            fontFamily="Inter, sans-serif"
            fontWeight="600"
            letterSpacing="0.05em"
          >
            {node.sublabel.toUpperCase()}
          </text>
        )}
      </g>
    </g>
  );
};
