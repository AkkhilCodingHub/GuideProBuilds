"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const pathAnim = {
  initial: {
    d: "M0,100 Q25,100 50,100 T100,100 L100,100 L0,100 Z",
  },
  enter: {
    d: "M0,100 Q25,0 50,50 T100,0 L100,100 L0,100 Z",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
  },
  exit: {
    d: "M0,100 Q25,100 50,100 T100,100 L100,100 L0,100 Z",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
  }
};

export function AtlasLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [showWave, setShowWave] = useState(true);
  
  const text = "PC GUIDE PRO";
  const letters = text.split("");

  useEffect(() => {
    setTimeout(() => {
      setShowWave(false);
    }, 3000);

    setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem("atlas_loader_played", "true");
    }, 3500);
  }, []);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
        >
          {}
          <div className="relative flex items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-heading font-black tracking-tighter flex items-center gap-2"
            >
              PC Guide<span className="text-primary">Pro</span>
            </motion.div>
            
            {}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.5], scale: [0, 1.5, 1] }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
              className="absolute -right-8 -top-4 w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.8)]"
            />
          </div>

          {}
          <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: [0.76, 0, 0.24, 1] }}
              className="h-full bg-primary"
            />
          </div>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-4 text-sm text-muted-foreground font-mono uppercase tracking-widest"
          >
            Initializing System...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
