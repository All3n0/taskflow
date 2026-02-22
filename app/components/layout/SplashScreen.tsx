'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { KazistackLogo } from '../KazistackLogo'; // Adjust import path

interface SplashScreenProps {
  onFinish: () => void;
  minimumLoadTime?: number;
}

export function SplashScreen({ onFinish, minimumLoadTime = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500);
    }, minimumLoadTime);

    return () => clearTimeout(timer);
  }, [onFinish, minimumLoadTime]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
          style={{
            background: 'radial-gradient(circle at 50% 50%, hsl(var(--background)) 0%, hsl(var(--background)/0.95) 100%)'
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: `hsl(${i * 12}, 70%, 60%)`,
                  filter: 'blur(1px)',
                }}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                  scale: 0,
                }}
                animate={{
                  y: [null, -100, 100, -50, 0],
                  x: [null, 50, -50, 25, 0],
                  scale: [0, 1, 0.8, 1, 0],
                  opacity: [0, 0.5, 0.3, 0.5, 0],
                }}
                transition={{
                  duration: 8 + Math.random() * 10,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center px-4">
            {/* Logo with 3D flip animation */}
            {/* Logo with subtle 3D tilt */}
<motion.div
  initial={{ scale: 0 }}
  animate={{ 
    scale: [0, 1.2, 1],
  }}
  transition={{ 
    duration: 1.2,
    times: [0, 0.6, 1],
    ease: [0.34, 1.56, 0.64, 1],
  }}
  className="mb-8"
  style={{ perspective: 1000 }}
>
  <div className="w-28 h-28 mx-auto relative">
    <motion.div
      animate={{ 
        rotateX: [0, 15, -5, 0],
        rotateY: [0, 10, -10, 0],
        rotateZ: [0, 5, -5, 0],
      }}
      transition={{ 
        duration: 3,
        delay: 0.5,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut"
      }}
      style={{ 
        transformStyle: "preserve-3d",
      }}
    >
      <KazistackLogo className="w-full h-full" />
    </motion.div>
    
    {/* Glow effect */}
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute inset-0 -z-10"
      style={{
        background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.3) 0%, transparent 70%)',
        filter: 'blur(20px)',
      }}
    />
  </div>
</motion.div>
            {/* App name with letter animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <h1 className="text-4xl font-black tracking-tight">
                {'KAZISTACK'.split('').map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="inline-block"
                    style={{
                      color: i < 4 ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                      textShadow: '0 2px 10px hsl(var(--primary)/0.3)',
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm text-muted-foreground mb-8 font-light tracking-wider"
            >
              Stack your tasks. Stack your wins.
            </motion.p>

            {/* Loading progress bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: minimumLoadTime / 1000, ease: "linear" }}
              className="h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full mx-auto"
              style={{ maxWidth: '200px' }}
            />

            {/* Loading dots */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-2 justify-center mt-4"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: `hsl(var(--primary)/${0.5 + i * 0.25})`,
                  }}
                />
              ))}
            </motion.div>

            {/* Version number */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-[10px] text-muted-foreground/40 mt-8 font-mono"
            >
              v1.0.0
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}