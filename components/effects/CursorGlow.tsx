"use client";

import { useEffect, useRef } from "react";

/**
 * A highly performant background spotlight that follows the user's cursor.
 * Uses direct DOM manipulation to run at 60fps without causing React re-renders.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;
      // Centering the 600px wide radial spotlight on the cursor
      const x = e.clientX - 300;
      const y = e.clientY - 300;
      glowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 z-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,rgba(16,185,129,0.05)_50%,transparent_100%)] blur-[90px] transition-transform duration-300 ease-out will-change-transform"
    />
  );
}
export default CursorGlow;
