import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Splash({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8"
          >
            {/* Islamic Star SVG Icon */}
            <svg 
              className="w-24 h-24 text-primary animate-spin-slow" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1"
              style={{ animationDuration: '20s' }}
            >
               <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold font-amiri text-primary mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            نور الهدى
          </motion.h1>

          <motion.div
            className="max-w-md space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <p className="text-xl text-accent font-medium leading-loose">
              صدقة جارية عن روح
            </p>
            <div className="w-16 h-0.5 bg-border mx-auto my-4" />
            <p className="text-2xl text-foreground/80 font-amiri leading-relaxed">
              أبو نشأت وأم نشأت
              <br />
              أبو سليم وأم سليم
            </p>
            <p className="text-sm text-muted-foreground mt-8">
              رحمهم الله وأسكنهم فسيح جناته
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
