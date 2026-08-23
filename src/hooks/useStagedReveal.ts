import { useState, useEffect } from 'react';
import { AlertData } from '../types';
import { ANIMATION_TIMINGS, checkPrefersReducedMotion } from '../lib/timing';

export interface StagedRevealState {
  revealedNodeIds: Set<string>;
  edgesDrawn: boolean;
  revealedBarIds: Set<string>;
  isComplete: boolean;
}

export function useStagedReveal(alert: AlertData | null) {
  const [revealState, setRevealState] = useState<StagedRevealState>({
    revealedNodeIds: new Set<string>(),
    edgesDrawn: false,
    revealedBarIds: new Set<string>(),
    isComplete: false,
  });

  useEffect(() => {
    if (!alert) {
      setRevealState({
        revealedNodeIds: new Set<string>(),
        edgesDrawn: false,
        revealedBarIds: new Set<string>(),
        isComplete: false,
      });
      return;
    }

    const reducedMotion = checkPrefersReducedMotion();

    if (reducedMotion) {
      // Instant reveal for reduced motion
      setRevealState({
        revealedNodeIds: new Set(alert.nodes.map((n) => n.id)),
        edgesDrawn: true,
        revealedBarIds: new Set(alert.transactions.map((t) => t.id)),
        isComplete: true,
      });
      return;
    }

    // Reset initially
    setRevealState({
      revealedNodeIds: new Set<string>(),
      edgesDrawn: false,
      revealedBarIds: new Set<string>(),
      isComplete: false,
    });

    const timers: NodeJS.Timeout[] = [];

    // Sort nodes by distance from subject (0 first, then 1, then 2)
    const sortedNodes = [...alert.nodes].sort((a, b) => a.distanceFromSubject - b.distanceFromSubject);

    // 1. Reveal nodes with 60ms stagger
    sortedNodes.forEach((node, index) => {
      const timer = setTimeout(() => {
        setRevealState((prev) => ({
          ...prev,
          revealedNodeIds: new Set([...prev.revealedNodeIds, node.id]),
        }));
      }, index * ANIMATION_TIMINGS.NODE_STAGGER_MS);
      timers.push(timer);
    });

    // 2. Draw edges after node stagger
    const edgeStartDelay = Math.max(
      ANIMATION_TIMINGS.EDGE_DRAW_DELAY_MS,
      sortedNodes.length * ANIMATION_TIMINGS.NODE_STAGGER_MS + 50
    );

    const edgeTimer = setTimeout(() => {
      setRevealState((prev) => ({
        ...prev,
        edgesDrawn: true,
      }));
    }, edgeStartDelay);
    timers.push(edgeTimer);

    // 3. Grow timeline bars with 25ms stagger
    const timelineStartDelay = edgeStartDelay + ANIMATION_TIMINGS.EDGE_DRAW_DURATION_MS;

    alert.transactions.forEach((tx, idx) => {
      const barTimer = setTimeout(() => {
        setRevealState((prev) => ({
          ...prev,
          revealedBarIds: new Set([...prev.revealedBarIds, tx.id]),
        }));
      }, timelineStartDelay + idx * ANIMATION_TIMINGS.TIMELINE_BAR_STAGGER_MS);
      timers.push(barTimer);
    });

    // Mark complete
    const totalTime = timelineStartDelay + alert.transactions.length * ANIMATION_TIMINGS.TIMELINE_BAR_STAGGER_MS + 100;
    const completeTimer = setTimeout(() => {
      setRevealState((prev) => ({
        ...prev,
        isComplete: true,
      }));
    }, totalTime);
    timers.push(completeTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [alert?.id]);

  return revealState;
}
