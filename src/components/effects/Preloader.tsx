"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("lusion_preloader_played");
    if (hasLoaded) {
      setIsLoading(false);
      return;
    }

    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(interval);
        
        setTimeout(() => {
          setIsLoading(false);
          sessionStorage.setItem("lusion_preloader_played", "true");
        }, 400);
      } else {
        setProgress(currentProgress);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white"
        >
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="overflow-hidden mb-4">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="font-heading font-bold text-4xl md:text-6xl tracking-tighter"
              >
                PC GUIDE PRO
              </motion.div>
            </div>
            
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-8 relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-white rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            
            <motion.div 
              className="mt-4 font-mono text-sm tracking-widest opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              {progress}%
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
