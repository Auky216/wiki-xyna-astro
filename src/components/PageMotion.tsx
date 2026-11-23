import type { ReactNode } from "react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export function SoftReveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <MotionConfig reducedMotion="user"><BlurFade blur="0px" offset={reduced ? 0 : 6} duration={reduced ? 0 : .35} delay={reduced ? 0 : delay} className={`soft-reveal ${className}`}>{children}</BlurFade></MotionConfig>;
}
export function ReadingProgress() {
  return <MotionConfig reducedMotion="user"><ScrollProgress aria-hidden="true" className="reading-progress" /></MotionConfig>;
}
