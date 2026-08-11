"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
  spotlightSize?: number;
}

export function Spotlight({ children, className = "", spotlightSize = 400 }: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200, mass: 0.5 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200, mass: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => {
        container.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [mouseX, mouseY]);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: "black",
          maskImage: useMotionValue(`radial-gradient(${spotlightSize / 2}px circle at 0px 0px, transparent 10%, black 100%)`),
          WebkitMaskImage: useMotionValue(`radial-gradient(${spotlightSize / 2}px circle at 0px 0px, transparent 10%, black 100%)`),
        }}
        onUpdate={(latest) => {
          if (!containerRef.current) return;
          const x = smoothX.get();
          const y = smoothY.get();
          containerRef.current.style.setProperty('--spot-x', `${x}px`);
          containerRef.current.style.setProperty('--spot-y', `${y}px`);
        }}
      />
      
      {}
      <div 
        className="absolute inset-0 pointer-events-none z-10 bg-black transition-opacity duration-300"
        style={{
          maskImage: `radial-gradient(${spotlightSize / 2}px circle at var(--spot-x, -1000px) var(--spot-y, -1000px), transparent 0%, black 100%)`,
          WebkitMaskImage: `radial-gradient(${spotlightSize / 2}px circle at var(--spot-x, -1000px) var(--spot-y, -1000px), transparent 0%, black 100%)`,
        }}
      />
      
      {}
      <div className="absolute inset-0 opacity-10 blur-sm pointer-events-none">
        {children}
      </div>

      {}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
}
