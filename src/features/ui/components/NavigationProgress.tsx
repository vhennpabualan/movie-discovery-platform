'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Start the bar
    setVisible(true);
    setProgress(0);

    // Quickly jump to 70% to simulate loading
    const t1 = setTimeout(() => setProgress(70), 50);
    // Creep to 90% while waiting for page
    const t2 = setTimeout(() => setProgress(90), 300);

    // Complete and hide
    const t3 = setTimeout(() => {
      setProgress(100);
      // Fade out after completion
      const t4 = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(t4);
    }, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-netflix-red transition-all ease-out"
      style={{
        width: `${progress}%`,
        transitionDuration: progress === 100 ? '200ms' : '400ms',
        boxShadow: '0 0 8px rgba(229, 9, 20, 0.8)',
      }}
    />
  );
}