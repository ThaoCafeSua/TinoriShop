"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Force scroll to top on hard reload (F5)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // Subtle fade animation with 200ms duration
  // If user prefers reduced motion, disable animation (opacity: 1)
  const variants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    enter: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" as const } },
    exit: { opacity: shouldReduceMotion ? 1 : 0, transition: { duration: 0.15, ease: "easeIn" as const } },
  };

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        className="flex-1 flex flex-col w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
