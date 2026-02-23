'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils';
import { format, subDays, startOfDay } from 'date-fns';
import { Flame, Trophy, Zap } from 'lucide-react';
import { useStreaks } from '../hooks/UseStreaks';

interface StreakCardProps {
  className?: string;
}

// Show last 7 days as activity dots
function ActivityDots({ completedDates }: { completedDates: string[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(startOfDay(new Date()), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const isToday = i === 6;
    const done = completedDates.includes(key);
    const label = format(d, 'EEE');
    
    return { key, isToday, done, label };
  });

  return (
    <div className="flex items-end gap-1.5 sm:gap-2">
      {days.map((d) => (
        <div key={d.key} className="flex flex-col items-center gap-1.5">
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ 
              delay: 0.05 * days.indexOf(d),
              type: "spring",
              stiffness: 300,
              damping: 15
            }}
            className={cn(
              'w-7 h-7 sm:w-8 sm:h-8 rounded-xl transition-all duration-300',
              d.done
                ? d.isToday
                  ? 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/30 ring-2 ring-orange-400/20'
                  : 'bg-gradient-to-br from-orange-400/80 to-orange-500/80'
                : d.isToday
                  ? 'bg-secondary/40 border-2 border-dashed border-orange-400/30'
                  : 'bg-secondary/40'
            )}
          >
            {d.done && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              </div>
            )}
          </motion.div>
          <span className={cn(
            'text-[10px] font-bold tracking-wide',
            d.isToday ? 'text-orange-400' : 'text-muted-foreground/60'
          )}>
            {d.isToday ? 'TODAY' : d.label.slice(0, 1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function StreakCard({ className }: StreakCardProps) {
  const { 
    currentStreak, 
    longestStreak, 
    totalTasksCompleted, 
    streakAlive, 
    activityToday,
    completedDates 
  } = useStreaks();

  const isHot = currentStreak >= 7;
  const isOnFire = currentStreak >= 14;
  const isNewStreak = currentStreak > 0 && currentStreak < 3;

  const getStreakMessage = () => {
    if (currentStreak === 0) return 'Start your streak today!';
    if (isOnFire) return '🔥 Insane streak! You\'re unstoppable!';
    if (isHot) return '⚡ One week streak! Keep pushing!';
    if (activityToday) return '✅ Active today - stay consistent!';
    return '⚠️ Complete a task to keep it alive!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className={cn(
        'relative rounded-2xl p-5 sm:p-6 overflow-hidden group',
        'bg-gradient-to-br from-background via-background to-secondary/30',
        'border transition-all duration-500',
        isOnFire 
          ? 'border-orange-500/30 shadow-lg shadow-orange-500/10' 
          : isHot 
            ? 'border-orange-400/20' 
            : 'border-border/50',
        className
      )}
    >
      {/* Background effects */}
      {isOnFire && (
        <>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
        </>
      )}

      {/* Gradient overlay on hover */}
      <div className={cn(
        'absolute inset-0 opacity-0 transition-opacity duration-500',
        'bg-gradient-to-r from-orange-500/2 to-transparent',
        'group-hover:opacity-100'
      )} />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
        
        {/* Left: flame + streak number */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className={cn(
            'relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center flex-shrink-0',
            'transition-all duration-300',
            isOnFire 
              ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10' 
              : isHot 
                ? 'bg-gradient-to-br from-orange-400/15 to-orange-500/5' 
                : streakAlive 
                  ? 'bg-orange-400/10' 
                  : 'bg-secondary/40'
          )}>
            <motion.div
              animate={isOnFire ? {
                scale: [1, 1.1, 1],
                rotate: [-3, 3, -3, 0],
              } : isHot ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ 
                duration: isOnFire ? 2 : 3, 
                repeat: Infinity,
                repeatType: 'loop'
              }}
            >
              <Flame className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 transition-colors',
                isOnFire && 'text-orange-500 drop-shadow-lg',
                isHot && !isOnFire && 'text-orange-400',
                streakAlive && !isHot && !isOnFire && 'text-orange-300',
                !streakAlive && currentStreak === 0 && 'text-muted-foreground/30'
              )} />
            </motion.div>
            
            {currentStreak > 0 && (
              <motion.div
                key={currentStreak}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  'absolute -top-1 -right-1 min-w-[1.75rem] h-7 px-1.5 rounded-full',
                  'flex items-center justify-center',
                  'text-xs font-black text-white',
                  isOnFire 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/40' 
                    : 'bg-orange-500 shadow-md shadow-orange-500/30'
                )}
              >
                {currentStreak > 99 ? '99+' : currentStreak}
              </motion.div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl sm:text-5xl font-black tabular-nums leading-none">
                {currentStreak}
              </span>
              <span className="text-sm font-bold text-muted-foreground/70">
                day{currentStreak !== 1 ? 's' : ''}
              </span>
            </div>
            <p className={cn(
              'text-xs sm:text-sm font-bold mt-1 transition-colors',
              isOnFire && 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500',
              isHot && !isOnFire && 'text-orange-400',
              streakAlive && !isHot && !isOnFire && 'text-orange-300',
              !streakAlive && currentStreak === 0 && 'text-muted-foreground',
              !streakAlive && currentStreak > 0 && 'text-yellow-500'
            )}>
              {getStreakMessage()}
            </p>
          </div>
        </div>

        {/* Middle: activity dots - hidden on small screens if needed */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Weekly Activity
            </p>
            {activityToday && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                ACTIVE
              </span>
            )}
          </div>
          <ActivityDots completedDates={completedDates} />
        </div>

        {/* Right: stats */}
        <div className="flex gap-4 sm:gap-6 flex-shrink-0 self-center lg:self-auto">
          <div className="text-center min-w-[60px]">
            <div className="flex items-center gap-1 justify-center mb-1">
              <Trophy className={cn(
                'w-4 h-4',
                longestStreak >= 14 ? 'text-yellow-500' : 'text-muted-foreground/40'
              )} />
            </div>
            <p className="text-2xl sm:text-3xl font-black tabular-nums leading-none">
              {longestStreak}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground/60 mt-1">
              BEST
            </p>
          </div>
          
          <div className="w-px bg-border/30 self-stretch" />
          
          <div className="text-center min-w-[60px]">
            <div className="flex items-center gap-1 justify-center mb-1">
              <Zap className="w-4 h-4 text-primary/60" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tabular-nums leading-none">
              {totalTasksCompleted}
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground/60 mt-1">
              TOTAL
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar for current streak */}
      {currentStreak > 0 && (
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60">
            <span>Next milestone: {currentStreak < 7 ? '7 days' : currentStreak < 14 ? '14 days' : '30 days'}</span>
            <span className="flex-1 text-right">
              {currentStreak < 7 
                ? `${7 - currentStreak} days to go` 
                : currentStreak < 14 
                  ? `${14 - currentStreak} days to go`
                  : '🏆 Legendary!'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-secondary/50 rounded-full mt-1 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: currentStreak < 7 
                  ? `${(currentStreak / 7) * 100}%` 
                  : currentStreak < 14 
                    ? `${((currentStreak - 7) / 7) * 100}%`
                    : currentStreak < 30 
                      ? `${((currentStreak - 14) / 16) * 100}%`
                      : '100%'
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={cn(
                'h-full rounded-full',
                isOnFire 
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500' 
                  : isHot 
                    ? 'bg-gradient-to-r from-orange-400/80 to-orange-500/80'
                    : 'bg-gradient-to-r from-orange-300 to-orange-400'
              )}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}