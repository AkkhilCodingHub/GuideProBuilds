"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setIsMounted(true);
    
    document.body.style.cursor = "none";
    const setCursorNone = () => {
      document.body.style.cursor = "none";
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest('[role="button"]') ||
        window.getComputedStyle(target).cursor === "pointer"
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", setCursorNone, true);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", setCursorNone, true);
      document.body.style.cursor = "auto";
    };
  }, [mouseX, mouseY]);

  if (!isMounted) return null;

  return (
    <>
      {}
      <motion.div
        className="fixed top-0 left-0 z-50 rounded-full pointer-events-none mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          width: isPointer ? "4px" : "8px",
          height: isPointer ? "4px" : "8px",
          backgroundColor: "white",
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      />
      
      {}
      <motion.div
        className="fixed top-0 left-0 z-40 rounded-full pointer-events-none border border-white mix-blend-difference"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          width: isPointer ? "48px" : "24px",
          height: isPointer ? "48px" : "24px",
          opacity: isPointer ? 0.3 : 0.8,
        }}
      />
    </>
  );
}
