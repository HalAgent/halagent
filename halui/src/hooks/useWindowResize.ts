import { useState, useEffect, useCallback } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

type ThrottleFunction = (...args: unknown[]) => void;

const throttle = (func: ThrottleFunction, limit: number): ThrottleFunction => {
  let inThrottle: boolean;
  return function (this: unknown, ...args: unknown[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const useWindowResize = (delay: number = 100) => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = useCallback(
    throttle(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, delay),
    [delay]
  );

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return windowSize;
}; 