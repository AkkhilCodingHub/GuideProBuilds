"use client";

import { ReactLenis } from 'lenis/react';

export function SmoothScroller({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.05, syncTouch: true }}>
      {children}
    </ReactLenis>
  );
}
