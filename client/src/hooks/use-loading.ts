import { useState, useEffect } from 'react';

interface UseLoadingOptions {
  minLoadingTime?: number; // Minimum time to show loading (prevents flash)
  delay?: number; // Delay before showing loading (prevents unnecessary loading for fast requests)
}

export function useLoading(
  isLoading: boolean, 
  options: UseLoadingOptions = {}
) {
  const { minLoadingTime = 500, delay = 200 } = options;
  const [showLoading, setShowLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let delayTimeout: ReturnType<typeof setTimeout> | undefined;
    let minTimeTimeout: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      // Start delay timer
      delayTimeout = setTimeout(() => {
        setShowLoading(true);
        setStartTime(Date.now());
      }, delay);
    } else {
      // Clear delay if loading finished before delay
      if (delayTimeout) {
        clearTimeout(delayTimeout);
      }

      // If we were showing loading, ensure minimum time
      if (showLoading && startTime) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoadingTime - elapsed);
        
        minTimeTimeout = setTimeout(() => {
          setShowLoading(false);
          setStartTime(null);
        }, remaining);
      } else {
        setShowLoading(false);
        setStartTime(null);
      }
    }

    return () => {
      if (delayTimeout) clearTimeout(delayTimeout);
      if (minTimeTimeout) clearTimeout(minTimeTimeout);
    };
  }, [isLoading, delay, minLoadingTime, showLoading, startTime]);

  return showLoading;
}