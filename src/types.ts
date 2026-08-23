export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'cleared';

export type NodeType = 'subject' | 'individual' | 'corporate' | 'bank' | 'crypto_exchange' | 'device' | 'ip_address' | 'offshore_shell';

export type LinkType = 'direct_wire' | 'crypto_transfer' | 'shared_device' | 'shared_ip' | 'beneficial_owner' | 'shell_link';

export interface GraphNodeData {
  id: string;
  label: string;
  sublabel?: string;
  type: NodeType;
  risk: RiskLevel;
  x: number; // SVG coordinate in viewBox 0 0 600 380
  y: number;
  hopLevel: 1 | 2;
  distanceFromSubject: number; // Distance in graph hops or geometric distance for reveal order (0 for subject, 1 for hop 1, 2 for hop 2)
  details: {
    jurisdiction: string;
    accountAge?: string;
    entityType: string;
    flagged?: boolean;
    balance?: string;
  };
  associatedSignalIds: string[];
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  type: LinkType;
  label?: string;
  amount?: string;
  isDashed?: boolean;
  hopLevel: 1 | 2;
  associatedSignalIds: string[];
}

export interface TimelineTransaction {
  id: string;
  date: string; // e.g. 'Oct 01'
  timestamp: string;
  type: 'deposit' | 'transfer';
  amount: number; // in USD
  counterparty: string;
  isTrigger: boolean;
  isNearThreshold: boolean; // below 10k CTR
  associatedSignalIds: string[];
}

export interface RiskSignal {
  id: string;
  code: string;
  label: string;
  description: string;
  scoreDelta: number; // e.g. +35 or -12
  severity: RiskLevel;
  iconName: string;
  nodeIds: string[];
  edgeIds?: string[];
  transactionIds?: string[];
  revealsThresholdLine?: boolean;
}

export interface AnalystSummaryVariant {
  id: string;
  title: string;
  summary: string;
  keyFactors: string[];
}

export type DispositionType = 'clear_false_positive' | 'escalate_l2' | 'freeze_and_sar';

export interface AlertData {
  id: string;
  caseNumber: string;
  ruleCode: string;
  ruleCategory: 'STRUCTURING' | 'VELOCITY' | 'SANCTIONS' | 'CRYPTO_FLOW' | 'DEVICE_ANOMALY';
  title: string;
  subjectName: string;
  subjectAccountId: string;
  subjectBalance: string;
  slaRemaining: string; // e.g. "06:29:45"
  slaRemainingShort: string; // e.g. "6h 30m left"
  slaPercent: number;
  initialScore: number;
  targetAccount: string;
  affectedCounterpartiesCount: number;
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  transactions: TimelineTransaction[];
  signals: RiskSignal[];
  summaries: AnalystSummaryVariant[];
}

export interface DispositionRecord {
  alertId: string;
  dispositionType: DispositionType;
  rationale: string;
  timestamp: string;
  analyst: string;
  dispositionCode: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  dispositionCode?: string;
  canUndo?: boolean;
  alertId?: string;
  previousRecord?: DispositionRecord;
}
