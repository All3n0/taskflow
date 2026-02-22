// components/tutorial/TutorialOverlay.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, SkipForward, ArrowRight,
  Sparkles, Layout, ListChecks, Kanban, Calendar, Bell, 
  Settings, CheckCircle2, Plus, FileText, Move, Clock,
  Search, Palette, Database, HelpCircle, Menu
} from 'lucide-react';
import { useTutorial, TUTORIAL_STEPS } from '../contexts/TutorialContext';
import { useEffect, useState } from 'react';
import { cn } from '../utils';

const iconMap = {
  Sparkles, Layout, ListChecks, Kanban, Calendar, Bell,
  Settings, CheckCircle2, Plus, FileText, Move, Clock,
  Search, Palette, Database, HelpCircle, Menu
};

export function TutorialOverlay() {
  const { showTutorial, currentStep, nextStep, prevStep, skipTutorial, goToStep, setActiveView, isFromSettings } = useTutorial();
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right' | 'center'>('center');
  const [retryCount, setRetryCount] = useState(0);
  
  const step = TUTORIAL_STEPS[currentStep];
  const IconComponent = iconMap[step.icon as keyof typeof iconMap] || HelpCircle;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle view navigation with better timing
  useEffect(() => {
    if (!showTutorial || !step.view) return;

    setIsNavigating(true);
    setTargetPosition(null);
    setActiveView(step.view);
    
    const timer = setTimeout(() => {
      setIsNavigating(false);
      setRetryCount(prev => prev + 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [step.view, currentStep, showTutorial, setActiveView]);

  // Update target position with better mobile handling and retries
  useEffect(() => {
    if (!step.target || isNavigating) {
      setTargetPosition(null);
      return;
    }

    const findElement = () => {
      // Handle special cases for mobile
      if (step.target === '.sidebar' && isMobile) {
        return document.querySelector('[data-testid="menu-button"]');
      }
      
      // Try multiple selector strategies
      const selectors = [
        step.target,
        step.target.replace('.', ''), // Remove dot for data attributes
        `[data-testid="${step.target.replace(/[\[\]'"]/g, '')}"]`,
      ];
      
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el;
      }
      return null;
    };

    const updatePosition = () => {
      const element = findElement();
      
      if (element) {
        const rect = element.getBoundingClientRect();
        
        // Check if element is actually visible
        if (rect.width > 0 && rect.height > 0) {
          setTargetPosition(rect);
          
          // Determine best tooltip position based on element location
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          
          if (isMobile) {
            // On mobile, always show at bottom with proper spacing
            setTooltipPosition('bottom');
          } else {
            // On desktop, calculate best position
            const spaceAbove = rect.top;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceLeft = rect.left;
            const spaceRight = viewportWidth - rect.right;
            
            // Choose position with most space
            const spaces = [
              { pos: 'bottom', space: spaceBelow },
              { pos: 'top', space: spaceAbove },
              { pos: 'right', space: spaceRight },
              { pos: 'left', space: spaceLeft },
            ];
            const isValidPosition = (pos: any): pos is 'top' | 'bottom' | 'left' | 'right' => {
  return ['top', 'bottom', 'left', 'right'].includes(pos);
};
            const bestPosition = spaces.reduce((best, current) => 
              current.space > best.space ? current : best
            );
            
            // Use step.position as preference, but fallback to best available
            if (isValidPosition(step.position) && spaces.find(s => s.pos === step.position)!.space > 200) {
  setTooltipPosition(step.position);
} else {
  setTooltipPosition(bestPosition.pos as 'top' | 'bottom' | 'left' | 'right');
}
          }
          
          // Add highlight
          if (step.highlight) {
            element.classList.add('tutorial-highlight', 'relative', 'z-50', 'transition-all', 'duration-300');
          }
          return true;
        }
      }
      return false;
    };

    if (!updatePosition()) {
      let attempts = 0;
      const maxAttempts = 20;
      
      const tryFindElement = () => {
        attempts++;
        if (updatePosition() || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      };
      
      const interval = setInterval(tryFindElement, 200);
      
      return () => {
        clearInterval(interval);
        if (step.target) {
          const element = document.querySelector(step.target);
          if (element) {
            element.classList.remove('tutorial-highlight', 'relative', 'z-50', 'transition-all', 'duration-300');
          }
        }
      };
    }
  }, [step.target, step.highlight, currentStep, isNavigating, isMobile, step.position, retryCount]);

  if (!showTutorial) return null;

  const getPositionStyle = () => {
    // Center position for welcome/complete screens
    if (!targetPosition || tooltipPosition === 'center' || isNavigating) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: isMobile ? 'calc(100vw - 32px)' : '400px',
        width: isMobile ? 'calc(100vw - 32px)' : 'auto',
      };
    }

    const styles: any = {};
    const cardWidth = isMobile ? window.innerWidth - 32 : 350;
    const cardHeight = isMobile ? 280 : 320;
    const spacing = 20;
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Calculate position based on element location and card dimensions
    switch (tooltipPosition) {
      case 'top':
        styles.bottom = viewport.height - targetPosition.top + spacing;
        styles.left = targetPosition.left + targetPosition.width / 2;
        styles.transform = 'translateX(-50%)';
        // Adjust if too far left/right
        if (styles.left - cardWidth / 2 < 16) {
          styles.left = cardWidth / 2 + 16;
        }
        if (styles.left + cardWidth / 2 > viewport.width - 16) {
          styles.left = viewport.width - cardWidth / 2 - 16;
        }
        break;
        
      case 'bottom':
        styles.top = targetPosition.bottom + spacing;
        styles.left = targetPosition.left + targetPosition.width / 2;
        styles.transform = 'translateX(-50%)';
        // Adjust if too far left/right
        if (styles.left - cardWidth / 2 < 16) {
          styles.left = cardWidth / 2 + 16;
        }
        if (styles.left + cardWidth / 2 > viewport.width - 16) {
          styles.left = viewport.width - cardWidth / 2 - 16;
        }
        break;
        
      case 'left':
        styles.right = viewport.width - targetPosition.left + spacing;
        styles.top = targetPosition.top + targetPosition.height / 2;
        styles.transform = 'translateY(-50%)';
        // Adjust if too far up/down
        if (styles.top - cardHeight / 2 < 16) {
          styles.top = cardHeight / 2 + 16;
        }
        if (styles.top + cardHeight / 2 > viewport.height - 16) {
          styles.top = viewport.height - cardHeight / 2 - 16;
        }
        break;
        
      case 'right':
        styles.left = targetPosition.right + spacing;
        styles.top = targetPosition.top + targetPosition.height / 2;
        styles.transform = 'translateY(-50%)';
        // Adjust if too far up/down
        if (styles.top - cardHeight / 2 < 16) {
          styles.top = cardHeight / 2 + 16;
        }
        if (styles.top + cardHeight / 2 > viewport.height - 16) {
          styles.top = viewport.height - cardHeight / 2 - 16;
        }
        break;
    }

    // Final safety checks
    styles.maxWidth = cardWidth;
    styles.width = cardWidth;
    
    // Ensure card stays within viewport bounds
    if (styles.top && styles.top < 16) styles.top = 16;
    if (styles.bottom && styles.bottom < 16) styles.bottom = 16;
    if (styles.left && styles.left < 16) styles.left = 16;
    if (styles.right && styles.right < 16) styles.right = 16;

    return styles;
  };

  // Show loading state while navigating
  if (isNavigating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="glass rounded-2xl p-6 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium">Switching to {step.view} view...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {showTutorial && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isMobile ? 0.3 : 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={skipTutorial}
          />

          {/* Progress indicator */}
          <div className={cn(
            "fixed z-[60] flex gap-1.5 bg-background/80 backdrop-blur-lg border border-border/50 shadow-lg",
            isMobile 
              ? "top-2 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-full"
              : "top-4 left-1/2 -translate-x-1/2 px-3 py-2 rounded-full"
          )}>
            {TUTORIAL_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === currentStep 
                    ? cn('bg-gradient-to-r', step.color, isMobile ? 'w-4 h-1.5' : 'w-6 h-1.5')
                    : i < currentStep
                      ? cn('bg-primary/60', isMobile ? 'w-1.5 h-1.5' : 'w-1.5 h-1.5')
                      : cn('bg-secondary', isMobile ? 'w-1.5 h-1.5' : 'w-1.5 h-1.5')
                )}
              />
            ))}
          </div>

          {/* Current view indicator */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] glass px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-primary/30"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Viewing: {step.view?.charAt(0).toUpperCase() + step.view?.slice(1)}
            </motion.div>
          )}

          {/* Tutorial Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className="fixed z-[60]"
            style={getPositionStyle()}
          >
            <div className={cn(
              'glass rounded-2xl shadow-2xl border-2 border-primary/20',
              'bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl',
              isMobile ? 'p-4' : 'p-5'
            )}>
              {/* Header with icon and step count */}
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  'rounded-xl bg-gradient-to-r flex items-center justify-center',
                  step.color,
                  isMobile ? 'w-8 h-8' : 'w-10 h-10'
                )}>
                  <IconComponent className={cn('text-white', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
                </div>
                <span className={cn(
                  'font-mono bg-secondary/50 rounded-full',
                  isMobile ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'
                )}>
                  {currentStep + 1} / {TUTORIAL_STEPS.length}
                </span>
              </div>

              {/* Content */}
              <h3 className={cn('font-bold mb-1', isMobile ? 'text-base' : 'text-lg')}>
                {step.title}
              </h3>
              <p className={cn('text-muted-foreground mb-3 leading-relaxed', isMobile ? 'text-xs' : 'text-sm')}>
                {step.description}
              </p>

              {/* Mobile-specific hint */}
              {isMobile && step.mobileMessage && (
                <div className="mb-3 p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary font-medium flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3" />
                  {step.mobileMessage}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {currentStep > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={prevStep}
                      className="rounded-lg hover:bg-secondary/80 transition-colors p-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={skipTutorial}
                    className="rounded-lg hover:bg-secondary/80 transition-colors px-3 py-2 text-xs flex items-center gap-1"
                  >
                    <SkipForward className="w-3 h-3" />
                    {!isMobile && 'Skip'}
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextStep}
                  className={cn(
                    'rounded-lg text-white flex items-center gap-1.5 px-4 py-2 text-xs font-bold',
                    `bg-gradient-to-r ${step.color}`
                  )}
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? 'Done' : 'Next'}
                  <ChevronRight className="w-3 h-3" />
                </motion.button>
              </div>

              {/* Help text */}
              <p className={cn(
                'text-center text-muted-foreground/60 mt-3',
                isMobile ? 'text-[8px]' : 'text-[10px]'
              )}>
                {isMobile ? 'Tap backdrop to skip' : 'Click the backdrop to skip'}
              </p>
            </div>
          </motion.div>

          {/* Arrow pointing to target */}
          {targetPosition && tooltipPosition && tooltipPosition !== 'center' && !isNavigating && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed z-[55] pointer-events-none"
              style={{
                left: targetPosition.left + targetPosition.width / 2,
                top: tooltipPosition === 'bottom' 
                  ? targetPosition.bottom
                  : tooltipPosition === 'top'
                    ? targetPosition.top
                    : targetPosition.top + targetPosition.height / 2,
                transform: `translate(-50%, ${
                  tooltipPosition === 'bottom' ? '-100%' : 
                  tooltipPosition === 'top' ? '0' : 
                  '-50%'
                }) rotate(${
                  tooltipPosition === 'bottom' ? '180deg' : 
                  tooltipPosition === 'top' ? '0' : 
                  tooltipPosition === 'left' ? '90deg' : 
                  '-90deg'
                })`,
              }}
            >
              <div className="text-primary">
                <svg 
                  width={isMobile ? "20" : "24"} 
                  height={isMobile ? "20" : "24"} 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path d="M12 2L2 22L12 18L22 22L12 2Z" fill="currentColor" />
                </svg>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}