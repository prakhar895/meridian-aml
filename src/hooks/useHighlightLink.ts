import { useState, useCallback, useMemo } from 'react';
import { AlertData, RiskSignal, GraphNodeData, TimelineTransaction } from '../types';

export interface HighlightState {
  activeSignalId: string | null;
  activeNodeId: string | null;
  activeEdgeId: string | null;
  activeBarId: string | null;
  highlightedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
  highlightedBarIds: Set<string>;
  highlightedSignalIds: Set<string>;
  forceShowThresholdLine: boolean;
  hasActiveHighlight: boolean;
}

export function useHighlightLink(alert: AlertData | null) {
  const [activeSignalId, setActiveSignalId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);
  const [activeBarId, setActiveBarId] = useState<string | null>(null);

  const hoverSignal = useCallback((signalId: string | null) => {
    setActiveSignalId(signalId);
    setActiveNodeId(null);
    setActiveEdgeId(null);
    setActiveBarId(null);
  }, []);

  const hoverNode = useCallback((nodeId: string | null) => {
    setActiveNodeId(nodeId);
    setActiveSignalId(null);
    setActiveEdgeId(null);
    setActiveBarId(null);
  }, []);

  const hoverEdge = useCallback((edgeId: string | null) => {
    setActiveEdgeId(edgeId);
    setActiveSignalId(null);
    setActiveNodeId(null);
    setActiveBarId(null);
  }, []);

  const hoverBar = useCallback((barId: string | null) => {
    setActiveBarId(barId);
    setActiveSignalId(null);
    setActiveNodeId(null);
    setActiveEdgeId(null);
  }, []);

  const clearHighlight = useCallback(() => {
    setActiveSignalId(null);
    setActiveNodeId(null);
    setActiveEdgeId(null);
    setActiveBarId(null);
  }, []);

  const highlightState = useMemo<HighlightState>(() => {
    if (!alert) {
      return {
        activeSignalId: null,
        activeNodeId: null,
        activeEdgeId: null,
        activeBarId: null,
        highlightedNodeIds: new Set<string>(),
        highlightedEdgeIds: new Set<string>(),
        highlightedBarIds: new Set<string>(),
        highlightedSignalIds: new Set<string>(),
        forceShowThresholdLine: false,
        hasActiveHighlight: false,
      };
    }

    const nodeIds = new Set<string>();
    const edgeIds = new Set<string>();
    const barIds = new Set<string>();
    const signalIds = new Set<string>();
    let forceShowThresholdLine = false;

    if (activeSignalId) {
      const signal = alert.signals.find((s) => s.id === activeSignalId);
      if (signal) {
        signalIds.add(signal.id);
        signal.nodeIds.forEach((id) => nodeIds.add(id));
        signal.edgeIds?.forEach((id) => edgeIds.add(id));
        signal.transactionIds?.forEach((id) => barIds.add(id));
        if (signal.revealsThresholdLine) {
          forceShowThresholdLine = true;
        }
      }
    } else if (activeNodeId) {
      const node = alert.nodes.find((n) => n.id === activeNodeId);
      if (node) {
        nodeIds.add(node.id);
        node.associatedSignalIds.forEach((sId) => signalIds.add(sId));

        // Highlight connected edges
        alert.edges.forEach((edge) => {
          if (edge.source === node.id || edge.target === node.id) {
            edgeIds.add(edge.id);
          }
        });

        // Highlight related timeline bars
        alert.transactions.forEach((tx) => {
          if (tx.associatedSignalIds.some((sId) => node.associatedSignalIds.includes(sId))) {
            barIds.add(tx.id);
          }
        });
      }
    } else if (activeEdgeId) {
      const edge = alert.edges.find((e) => e.id === activeEdgeId);
      if (edge) {
        edgeIds.add(edge.id);
        nodeIds.add(edge.source);
        nodeIds.add(edge.target);
        edge.associatedSignalIds.forEach((sId) => signalIds.add(sId));

        // Highlight related timeline bars
        alert.transactions.forEach((tx) => {
          if (tx.associatedSignalIds.some((sId) => edge.associatedSignalIds.includes(sId))) {
            barIds.add(tx.id);
          }
        });
      }
    } else if (activeBarId) {
      const bar = alert.transactions.find((t) => t.id === activeBarId);
      if (bar) {
        barIds.add(bar.id);
        bar.associatedSignalIds.forEach((sId) => signalIds.add(sId));

        // Highlight nodes matching these signals
        alert.nodes.forEach((n) => {
          if (n.associatedSignalIds.some((sId) => bar.associatedSignalIds.includes(sId))) {
            nodeIds.add(n.id);
          }
        });

        // Highlight edges matching these signals
        alert.edges.forEach((e) => {
          if (e.associatedSignalIds.some((sId) => bar.associatedSignalIds.includes(sId))) {
            edgeIds.add(e.id);
          }
        });
      }
    }

    const hasActiveHighlight =
      activeSignalId !== null ||
      activeNodeId !== null ||
      activeEdgeId !== null ||
      activeBarId !== null;

    return {
      activeSignalId,
      activeNodeId,
      activeEdgeId,
      activeBarId,
      highlightedNodeIds: nodeIds,
      highlightedEdgeIds: edgeIds,
      highlightedBarIds: barIds,
      highlightedSignalIds: signalIds,
      forceShowThresholdLine,
      hasActiveHighlight,
    };
  }, [alert, activeSignalId, activeNodeId, activeEdgeId, activeBarId]);

  return {
    ...highlightState,
    hoverSignal,
    hoverNode,
    hoverEdge,
    hoverBar,
    clearHighlight,
  };
}
