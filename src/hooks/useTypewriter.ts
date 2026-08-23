import { useState, useEffect } from 'react';
import { ANIMATION_TIMINGS, checkPrefersReducedMotion } from '../lib/timing';

export interface TypewriterState {
  displayedText: string;
  isTyping: boolean;
  isPending: boolean; // 3-dot indicator
  isComplete: boolean;
}

export function useTypewriter(fullText: string, triggerKey: string | number = 0) {
  const [state, setState] = useState<TypewriterState>({
    displayedText: '',
    isTyping: false,
    isPending: true,
    isComplete: false,
  });

  useEffect(() => {
    const reducedMotion = checkPrefersReducedMotion();

    if (reducedMotion) {
      setState({
        displayedText: fullText,
        isTyping: false,
        isPending: false,
        isComplete: true,
      });
      return;
    }

    setState({
      displayedText: '',
      isTyping: false,
      isPending: true,
      isComplete: false,
    });

    let index = 0;
    let intervalId: NodeJS.Timeout | null = null;

    // 700ms 3-dot pending indicator
    const pendingTimer = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isPending: false,
        isTyping: true,
      }));

      intervalId = setInterval(() => {
        index++;
        if (index <= fullText.length) {
          setState((prev) => ({
            ...prev,
            displayedText: fullText.slice(0, index),
            isTyping: index < fullText.length,
            isComplete: index >= fullText.length,
          }));
        } else {
          if (intervalId) clearInterval(intervalId);
          setState((prev) => ({
            ...prev,
            isTyping: false,
            isComplete: true,
          }));
        }
      }, ANIMATION_TIMINGS.TYPEWRITER_CHAR_MS);
    }, ANIMATION_TIMINGS.TYPEWRITER_PRE_DELAY_MS);

    return () => {
      clearTimeout(pendingTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [fullText, triggerKey]);

  return state;
}
