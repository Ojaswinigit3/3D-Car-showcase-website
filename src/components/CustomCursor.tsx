import React, { useEffect, useRef, useState } from 'react';

/**
 * Custom Ring Cursor with Magnetic Hover Expansion
 * Automatically hides on touch screens or when prefers-reduced-motion is enabled.
 */
export const CustomCursor: React.FC = () => {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || reducedMotion) return;
    setEnabled(true);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      }
      const el = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        el?.closest('button, a, input, [data-magnetic="true"]')
      );
      setHovered(isInteractive);
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden hidden lg:block">
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -ml-4 -mt-4 w-8 h-8 rounded-full border transition-[width,height,margin,border-color,background-color] duration-150 ease-out ${
          hovered
            ? 'w-12 h-12 -ml-6 -mt-6 border-[#c8102e] bg-[#c8102e]/10'
            : 'border-[#c9ccd1]/50 bg-transparent'
        }`}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full bg-[#00b7ff]"
      />
    </div>
  );
};
