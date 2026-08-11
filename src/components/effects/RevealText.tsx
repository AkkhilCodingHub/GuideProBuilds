"use client";

import { motion } from "framer-motion";

interface RevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  splitBy?: "word" | "letter";
}

export function RevealText({ text, className = "", delay = 0, splitBy = "word" }: RevealTextProps) {
  const items = splitBy === "word" ? text.split(" ") : text.split("");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: splitBy === "letter" ? 0.02 : 0.04, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 40,
    },
  };

  return (
    <motion.div
      className={`flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px" }}
    >
      {splitBy === "word" ? (
        items.map((word, index) => (
          <motion.span variants={child} style={{ marginRight: "0.25em", paddingBottom: "0.1em" }} key={index}>
            {word}
          </motion.span>
        ))
      ) : (
        text.split(" ").map((word, wordIdx) => (
          <span key={wordIdx} className="inline-flex overflow-hidden" style={{ marginRight: "0.25em" }}>
            {word.split("").map((char, charIdx) => (
              <motion.span variants={child} key={charIdx} className="inline-block pb-[0.1em]">
                {char}
              </motion.span>
            ))}
          </span>
        ))
      )}
    </motion.div>
  );
}
