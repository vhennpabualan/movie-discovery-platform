'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type Section = 'anime' | 'main';

function getSection(pathname: string): Section {
  return pathname.startsWith('/anime') ? 'anime' : 'main';
}

export function SectionTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevSectionRef = useRef<Section>(getSection(pathname));

  useEffect(() => {
    const currentSection = getSection(pathname);
    const prevSection = prevSectionRef.current;

    // Only trigger when crossing the boundary (main ↔ anime)
    if (currentSection !== prevSection) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        prevSectionRef.current = currentSection;
      }, 350);

      return () => clearTimeout(timer);
    }

    prevSectionRef.current = currentSection;
  }, [pathname]);

  return (
    <>
      {/* Full-screen transition overlay — only shows on section cross */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          pointerEvents: isTransitioning ? 'all' : 'none',
          backgroundColor: '#0f0f0f',
          opacity: isTransitioning ? 1 : 0,
          transition: 'opacity 350ms ease',
        }}
      />

      {/* Page content — blurs and fades on section switch */}
      <div
        style={{
          filter: isTransitioning ? 'blur(8px)' : 'blur(0px)',
          opacity: isTransitioning ? 0 : 1,
          transition: 'filter 350ms ease, opacity 350ms ease',
          willChange: 'filter, opacity',
        }}
      >
        {children}
      </div>
    </>
  );
}