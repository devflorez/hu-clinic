"use client";

import { motion } from "motion/react";

export function Spinner({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {text}
      </motion.p>
    </div>
  );
}
