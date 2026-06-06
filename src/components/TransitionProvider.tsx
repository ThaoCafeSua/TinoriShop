"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Subtle fade animation with 200ms duration
  // If user prefers reduced motion, disable animation (opacity: 1)
  const variants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    enter: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" as const } },
    exit: { opacity: shouldReduceMotion ? 1 : 0, transition: { duration: 0.15, ease: "easeIn" as const } },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
