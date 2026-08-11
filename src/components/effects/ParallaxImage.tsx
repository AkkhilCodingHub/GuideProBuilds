"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  offset?: number;
}

export function ParallaxImage({ src, alt, className = "", offset = 50 }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`}>
      <motion.img 
        src={src} 
        alt={alt}
        style={{ y }}
        className="absolute inset-0 w-full h-[120%] object-cover object-center -top-[10%]"
      />
    </div>
  );
}
