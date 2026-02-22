'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import {
  Bell, BellOff, AlertTriangle,
  CheckCircle2, Clock, Calendar, ArrowRight,
  Check, Settings, Sunrise, Sun, Sunset,
  CalendarDays, CalendarRange, History, Archive, Hourglass,
  Flame, Sparkles, Star, Rocket, Zap, Crown,
  Coffee, Moon, Cloud, Umbrella, Feather,
  Compass, Navigation, Globe, MapPin,
  Timer, Hourglass as HourglassIcon,
} from 'lucide-react';
import { Task } from '../../types/task';
import { cn } from '../utils';
import {
  isPast, isToday, isTomorrow, isYesterday,
  formatDistanceToNow, differenceInMinutes,
  differenceInDays, isThisWeek, isThisMonth,
  startOfDay, subDays, subMonths, subYears,
  isAfter, isBefore, startOfWeek, endOfWeek,
  addDays,
} from 'date-fns';

interface NotificationsViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onGoToSettings: () => void;
}

type FilterType = 'all' | 'overdue' | 'today' | 'upcoming';

// ── Whimsical time group definitions ──────────────────────────

type GroupId =
  | 'today'
  | 'tomorrow'
  | 'next7days'
  | 'thisMonth'
  | 'nextMonth'
  | 'yesterday'
  | 'last5days'
  | 'lastWeek'
  | 'lastMonth'
  | 'last6months'
  | 'lastYear'
  | 'ancient';

interface Group {
  id: GroupId;
  label: string;
  vibe: string; // emotional descriptor
  description: string;
  emptyMessage: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  accent: string;
  gradient: string;
  particleColor: string;
  sound?: string; // for future audio feedback
  timeMood: 'urgent' | 'calm' | 'nostalgic' | 'adventurous' | 'mysterious';
}

const GROUPS: Group[] = [
  {
    id: 'today',
    label: 'Today',
    vibe: '⚡ Now or never',
    description: 'Tasks breathing down your neck',
    emptyMessage: 'Ah, peace. Today is yours to design.',
    icon: Sun,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    accent: 'border-amber-500/60',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    particleColor: '#f59e0b',
    timeMood: 'urgent',
  },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    vibe: '🌅 Edge of tomorrow',
    description: 'The future is knocking',
    emptyMessage: 'Tomorrow is a blank canvas. Paint something.',
    icon: Sunrise,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-400/10',
    accent: 'border-orange-400/50',
    gradient: 'from-orange-400/20 via-orange-400/5 to-transparent',
    particleColor: '#fb923c',
    timeMood: 'adventurous',
  },
  {
    id: 'next7days',
    label: 'Next 7 Days',
    vibe: '🌈 The horizon line',
    description: 'A week of possibilities',
    emptyMessage: 'The week ahead is wide open. Dream big.',
    icon: CalendarDays,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-400/10',
    accent: 'border-blue-400/40',
    gradient: 'from-blue-400/20 via-blue-400/5 to-transparent',
    particleColor: '#60a5fa',
    timeMood: 'adventurous',
  },
  {
    id: 'thisMonth',
    label: 'This Month',
    vibe: '🌙 Distant shores',
    description: 'Later, but not forgotten',
    emptyMessage: 'The month ahead is a mystery waiting to unfold.',
    icon: Calendar,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-400/10',
    accent: 'border-violet-400/40',
    gradient: 'from-violet-400/20 via-violet-400/5 to-transparent',
    particleColor: '#c084fc',
    timeMood: 'mysterious',
  },
  {
    id: 'nextMonth',
    label: 'Further Ahead',
    vibe: '🚀 Way out there',
    description: 'Future you is waiting',
    emptyMessage: 'The far future is full of potential. No rush.',
    icon: Rocket,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-400/10',
    accent: 'border-cyan-400/30',
    gradient: 'from-cyan-400/20 via-cyan-400/5 to-transparent',
    particleColor: '#22d3ee',
    timeMood: 'adventurous',
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    vibe: '👻 Ghosts of time',
    description: 'What slipped through',
    emptyMessage: 'Yesterday is gone. Today is a fresh start.',
    icon: Sunset,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-400/10',
    accent: 'border-red-400/50',
    gradient: 'from-red-400/20 via-red-400/5 to-transparent',
    particleColor: '#f87171',
    timeMood: 'nostalgic',
  },
  {
    id: 'last5days',
    label: 'Last 5 Days',
    vibe: '⏳ The recent past',
    description: 'Still warm',
    emptyMessage: 'The recent past is clear. You\'re on a roll!',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    accent: 'border-red-500/50',
    gradient: 'from-red-500/20 via-red-500/5 to-transparent',
    particleColor: '#ef4444',
    timeMood: 'urgent',
  },
  {
    id: 'lastWeek',
    label: 'Last Week',
    vibe: '📜 Fading echoes',
    description: 'Getting colder',
    emptyMessage: 'Last week? Old news. Keep moving forward.',
    icon: Clock,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-400/10',
    accent: 'border-rose-400/40',
    gradient: 'from-rose-400/20 via-rose-400/5 to-transparent',
    particleColor: '#fb7185',
    timeMood: 'nostalgic',
  },
  {
    id: 'lastMonth',
    label: 'Last Month',
    vibe: '🍂 Autumn leaves',
    description: 'Memories now',
    emptyMessage: 'Last month is a chapter closed. Write a new one.',
    icon: History,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-400/10',
    accent: 'border-pink-400/30',
    gradient: 'from-pink-400/20 via-pink-400/5 to-transparent',
    particleColor: '#f472b6',
    timeMood: 'nostalgic',
  },
  {
    id: 'last6months',
    label: 'Past 6 Months',
    vibe: '🌌 Distant memory',
    description: 'Half a year ago',
    emptyMessage: 'Half a year of blank slate. Impressive.',
    icon: Archive,
    iconColor: 'text-slate-400',
    iconBg: 'bg-slate-400/10',
    accent: 'border-slate-400/30',
    gradient: 'from-slate-400/20 via-slate-400/5 to-transparent',
    particleColor: '#94a3b8',
    timeMood: 'mysterious',
  },
  {
    id: 'lastYear',
    label: 'Past Year',
    vibe: '🕰️ Ancient echoes',
    description: 'A year gone by',
    emptyMessage: 'A whole year? You\'re basically a time traveler.',
    icon: Hourglass,
    iconColor: 'text-slate-500',
    iconBg: 'bg-slate-500/10',
    accent: 'border-slate-500/20',
    gradient: 'from-slate-500/20 via-slate-500/5 to-transparent',
    particleColor: '#64748b',
    timeMood: 'mysterious',
  },
  {
    id: 'ancient',
    label: 'Ancient History',
    vibe: '🦕 Jurassic tasks',
    description: 'Dusty and forgotten',
    emptyMessage: 'Even dinosaurs are impressed by this clean slate.',
    icon: Feather,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-600/10',
    accent: 'border-slate-600/20',
    gradient: 'from-slate-600/20 via-slate-600/5 to-transparent',
    particleColor: '#475569',
    timeMood: 'mysterious',
  },
];

function getGroupId(dateStr: string): GroupId {
  const d = startOfDay(new Date(dateStr));
  const now = new Date();
  const today = startOfDay(now);

  // Future
  if (isToday(d)) return 'today';
  if (isTomorrow(d)) return 'tomorrow';
  if (isAfter(d, today) && isBefore(d, addDays(today, 8))) return 'next7days';
  if (isAfter(d, today) && isThisMonth(d)) return 'thisMonth';
  if (isAfter(d, today)) return 'nextMonth';

  // Past
  if (isYesterday(d)) return 'yesterday';
  if (isAfter(d, subDays(today, 5))) return 'last5days';
  if (isAfter(d, subDays(today, 14))) return 'lastWeek';
  if (isAfter(d, subMonths(today, 1))) return 'lastMonth';
  if (isAfter(d, subMonths(today, 6))) return 'last6months';
  if (isAfter(d, subYears(today, 1))) return 'lastYear';
  return 'ancient';
}

// ── Playful time label helper ─────────────────────────────────

function getTimeInfo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  
  if (isPast(d) && !isToday(d)) {
    const days = Math.abs(differenceInDays(d, now));
    if (days === 0) return { label: 'Just now', color: 'text-red-500', bg: 'bg-red-500/8', Icon: AlertTriangle, emoji: '😅' };
    if (days === 1) return { label: 'Yesterday', color: 'text-red-500', bg: 'bg-red-500/8', Icon: AlertTriangle, emoji: '👻' };
    if (days < 7) return { label: `${days} days ago`, color: 'text-red-500', bg: 'bg-red-500/8', Icon: AlertTriangle, emoji: '⏰' };
    if (days < 30) return { label: `${Math.floor(days/7)} weeks ago`, color: 'text-slate-400', bg: 'bg-slate-400/8', Icon: History, emoji: '📜' };
    return { label: formatDistanceToNow(d, { addSuffix: true }), color: 'text-slate-400', bg: 'bg-slate-400/8', Icon: History, emoji: '🕰️' };
  }
  
  if (isToday(d)) {
    const mins = differenceInMinutes(d, now);
    if (mins < 0) return { label: `${Math.abs(mins)}m overdue`, color: 'text-red-500', bg: 'bg-red-500/8', Icon: AlertTriangle, emoji: '🔥' };
    if (mins < 60) return { label: `in ${mins}m`, color: 'text-amber-500', bg: 'bg-amber-500/8', Icon: Clock, emoji: '⏳' };
    return { label: `in ${Math.floor(mins / 60)}h`, color: 'text-amber-500', bg: 'bg-amber-500/8', Icon: Clock, emoji: '⌛' };
  }
  
  return { 
    label: formatDistanceToNow(d, { addSuffix: true }), 
    color: 'text-blue-400', 
    bg: 'bg-blue-400/8', 
    Icon: Calendar, 
    emoji: '🔮' 
  };
}

const PRIORITY = {
  urgent: { label: 'Urgent', textColor: 'text-red-500', bgColor: 'bg-red-500/10', emoji: '🚨' },
  high: { label: 'High', textColor: 'text-amber-500', bgColor: 'bg-amber-500/10', emoji: '⚡' },
  medium: { label: 'Medium', textColor: 'text-blue-500', bgColor: 'bg-blue-500/10', emoji: '📌' },
  low: { label: 'Low', textColor: 'text-slate-400', bgColor: 'bg-slate-400/10', emoji: '🌱' },
} as const;

// ── Floating particles component ─────────────────────────────

function FloatingParticles({ color, count = 6 }: { color: string; count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ backgroundColor: color }}
          initial={{
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            scale: 0,
            opacity: 0,
          }}
          animate={{
            y: [null, '-30%', '10%', '-20%', '0%'],
            x: [null, '20%', '-20%', '10%', '0%'],
            scale: [0, 1, 0.8, 1, 0],
            opacity: [0, 0.5, 0.3, 0.5, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Creative Scroll Progress ─────────────────────────────────

function TimeTravelProgress({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  
  const timePhases = [
    { pos: 0, label: 'Now', icon: Sun },
    { pos: 0.2, label: 'Soon', icon: Sunrise },
    { pos: 0.4, label: 'Later', icon: Moon },
    { pos: 0.6, label: 'Past', icon: History },
    { pos: 0.8, label: 'Ages', icon: HourglassIcon },
    { pos: 1, label: 'Ancient', icon: Feather },
  ];

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const compassX = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="sticky top-0 z-20 glass border-b border-border/40 px-4 py-3 mb-4 overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
        style={{ x: useTransform(scrollYProgress, [0, 1], ['-100%', '100%']) }}
      />
      
      {/* Main progress bar with time crystals */}
      <div className="relative">
        <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-primary to-violet-500"
            style={{ scaleX, originX: 0 }}
          />
        </div>

        {/* Time crystals */}
        <div className="relative h-4 mt-1">
          {timePhases.map((phase, i) => {
            const Icon = phase.icon;
            return (
              <motion.div
                key={phase.label}
                className="absolute top-0 -translate-x-1/2"
                style={{ left: `${phase.pos * 100}%` }}
                whileHover={{ scale: 1.5, y: -4 }}
              >
                <div className="relative group">
                  <Icon className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {phase.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Time compass */}
        <motion.div
          className="absolute -top-1"
          style={{ left: compassX }}
        >
          <motion.div
            style={{ rotate }}
            className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <Compass className="w-3 h-3 text-white" />
          </motion.div>
        </motion.div>
      </div>

      {/* Quick time travel navigation */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none mt-3 pb-1">
        {GROUPS.map(group => (
          <motion.button
            key={group.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              containerRef.current?.querySelector(`[data-group-id="${group.id}"]`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold whitespace-nowrap transition-all',
              'border border-border/30 hover:border-primary/50',
              group.iconBg,
              'backdrop-blur-sm'
            )}
          >
            <group.icon className={cn('w-2.5 h-2.5', group.iconColor)} />
            <span>{group.label}</span>
            <span className="text-[8px] opacity-60">{group.vibe}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Whimsical notification card ──────────────────────────────

function NotifCard({ task, onComplete, onView, group }: {
  task: Task;
  onComplete: (id: string) => void;
  onView: (task: Task) => void;
  group: Group;
}) {
  const [completing, setCompleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const p = PRIORITY[task.priority] ?? PRIORITY.medium;
  const timeInfo = task.dueDate ? getTimeInfo(task.dueDate) : null;

  const handleComplete = () => {
    setCompleting(true);
    setTimeout(() => onComplete(task.id), 380);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6, rotateX: -10 }}
      animate={{ 
        opacity: completing ? 0 : 1, 
        y: completing ? 20 : 0,
        rotateX: completing ? 10 : 0,
        scale: completing ? 0.95 : 1,
      }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative rounded-xl p-3.5 flex items-start gap-3 transition-all duration-300 notification-card",
        "border border-border/50 hover:border-primary/30",
        "bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm",
        group.iconBg.replace('10', '5')
      )}
      data-task-id={task.id}
      data-priority={task.priority}
      data-status={task.status}
      data-group-id={group.id}
    >
      {/* Animated glow on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={cn("absolute inset-0 rounded-xl opacity-20", group.gradient)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Floating particles on hover */}
      <AnimatePresence>
        {isHovered && (
          <FloatingParticles color={group.particleColor} count={3} />
        )}
      </AnimatePresence>

      {/* Completion button with personality */}
      <motion.button
        onClick={handleComplete}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.8 }}
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 relative overflow-hidden complete-button',
          completing
            ? 'bg-green-500 border-green-500'
            : 'border-border hover:border-primary group'
        )}
        data-testid={`complete-button-${task.id}`}
        data-task-status={task.status}
      >
        {!completing && (
          <motion.div
            className="absolute inset-0 bg-primary/20"
            initial={{ scale: 0 }}
            whileHover={{ scale: 2 }}
            transition={{ duration: 0.3 }}
          />
        )}
        <AnimatePresence>
          {completing && (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Content */}
      <div className="flex-1 min-w-0 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className={cn(
              'text-sm font-semibold leading-snug transition-all notification-title',
              completing && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1 italic notification-description">
                {task.description}
              </p>
            )}
          </div>
          <motion.span
            whileHover={{ scale: 1.05, rotate: 2 }}
            className={cn(
              'text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 priority-badge',
              'border border-current/20',
              p.bgColor, p.textColor
            )}
            data-priority={task.priority}
          >
            <span className="mr-1">{p.emoji}</span>
            {p.label}
          </motion.span>
        </div>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap notification-metadata">
          {timeInfo && (
            <motion.div
              whileHover={{ scale: 1.02, x: 2 }}
              className={cn(
                'flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full time-badge',
                'border border-current/20',
                timeInfo.bg, timeInfo.color
              )}
              data-time-status={timeInfo.label.includes('overdue') ? 'overdue' : 'upcoming'}
            >
              <span>{timeInfo.emoji}</span>
              <timeInfo.Icon className="w-2.5 h-2.5" />
              <span>{timeInfo.label}</span>
            </motion.div>
          )}
          {task.tags?.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="text-[9px] bg-secondary/40 px-2 py-0.5 rounded-full text-muted-foreground backdrop-blur-sm tag"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Open button with personality */}
      <motion.button
        onClick={() => onView(task)}
        whileHover={{ x: 4, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-1.5 rounded-lg hover:bg-secondary/70 transition-colors flex-shrink-0 text-muted-foreground hover:text-foreground relative overflow-hidden group view-button"
        data-testid={`view-task-${task.id}`}
      >
        <ArrowRight className="w-3.5 h-3.5 relative z-10" />
        <motion.div
          className="absolute inset-0 bg-primary/10"
          initial={{ x: '-100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
    </motion.div>
  );
}

// ── Creative group header ────────────────────────────────────

function GroupHeader({ group, count, isOpen, onToggle, streakActive }: {
  group: Group; count: number; isOpen: boolean; onToggle: () => void; streakActive?: boolean;
}) {
  const Icon = group.icon;

  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 relative overflow-hidden group-header',
        'border-l-[4px]', group.accent,
        'bg-gradient-to-r', group.gradient,
        'hover:shadow-lg hover:shadow-black/5'
      )}
      data-group-id={group.id}
      data-group-count={count}
    >
      {/* Animated background particles */}
      <FloatingParticles color={group.particleColor} count={2} />

      <motion.div
        animate={{ rotate: isOpen ? 360 : 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className={cn('p-2 rounded-xl flex-shrink-0 relative group-icon', group.iconBg)}
      >
        <Icon className={cn('w-4 h-4', group.iconColor)} />
        {streakActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Flame className="w-3 h-3 text-amber-500" />
          </motion.div>
        )}
      </motion.div>

      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-black tracking-tight group-label">{group.label}</span>
          <span className="text-[8px] font-mono opacity-60 group-vibe">{group.vibe}</span>
          {count > 0 ? (
            <motion.span
              key={count}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className={cn(
                'text-[10px] font-black px-2 py-0.5 rounded-full group-count',
                group.iconBg, group.iconColor
              )}
            >
              {count}
            </motion.span>
          ) : (
            <span className="text-[8px] text-muted-foreground/40 px-1 py-0.5 border border-dashed border-current/20 rounded-full group-empty-badge">
              empty
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground/80 mt-0.5 group-description">{group.description}</p>
      </div>

      <motion.div
        animate={{ 
          rotate: isOpen ? 90 : 0,
          x: isOpen ? 4 : 0
        }}
        transition={{ duration: 0.3, type: "spring" }}
        className="text-muted-foreground group-hover:text-foreground transition-colors group-toggle"
      >
        <Navigation className={cn("w-4 h-4", isOpen && "text-primary")} />
      </motion.div>
    </motion.button>
  );
}

// ── Playful empty state ──────────────────────────────────────

function EmptyGroupState({ group }: { group: Group }) {
  const Icon = group.icon;
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background/40 to-background/20 backdrop-blur-sm empty-state"
      data-group-id={group.id}
    >
      <FloatingParticles color={group.particleColor} count={8} />
      
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center relative z-10">
        <motion.div
          animate={isPlaying ? {
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.1, 1.1, 1.1, 1.1, 1],
          } : {}}
          transition={{ duration: 0.5 }}
          onClick={() => setIsPlaying(true)}
          onAnimationComplete={() => setIsPlaying(false)}
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center mb-3 cursor-pointer empty-icon',
            group.iconBg,
            'border border-current/20',
            'hover:scale-110 transition-transform'
          )}
        >
          <Icon className={cn('w-6 h-6', group.iconColor)} />
        </motion.div>

        <p className="text-sm font-medium mb-2 empty-message">{group.emptyMessage}</p>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 'auto' }}
          className="flex gap-1 mt-2 empty-emoji"
        >
          {['✨', '💫', '⭐'].map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ 
                y: [0, -3, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
              }}
              className="text-lg"
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main view ─────────────────────────────────────────────────

export function NotificationsView({ tasks = [], onViewTask, onCompleteTask, onGoToSettings }: NotificationsViewProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<GroupId>>(new Set(['today', 'tomorrow', 'yesterday']));
  const [timeMood, setTimeMood] = useState<'day' | 'night'>(
    new Date().getHours() > 6 && new Date().getHours() < 18 ? 'day' : 'night'
  );
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update mood based on time
  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      setTimeMood(hour > 6 && hour < 18 ? 'day' : 'night');
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';

  const actionable = useMemo(() =>
    tasks.filter(t => t.status !== 'done' && t.dueDate && !dismissed.has(t.id)),
    [tasks, dismissed]
  );

  const counts = useMemo(() => ({
    all: actionable.length,
    overdue: actionable.filter(t => isPast(new Date(t.dueDate!)) && !isToday(new Date(t.dueDate!))).length,
    today: actionable.filter(t => isToday(new Date(t.dueDate!))).length,
    upcoming: actionable.filter(t => !isPast(new Date(t.dueDate!))).length,
  }), [actionable]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'overdue': return actionable.filter(t => isPast(new Date(t.dueDate!)) && !isToday(new Date(t.dueDate!)));
      case 'today': return actionable.filter(t => isToday(new Date(t.dueDate!)));
      case 'upcoming': return actionable.filter(t => !isPast(new Date(t.dueDate!)));
      default: return actionable;
    }
  }, [actionable, filter]);

  // Group tasks - all groups visible
  const grouped = useMemo(() => {
    const map = new Map<GroupId, Task[]>();
    GROUPS.forEach(g => map.set(g.id, []));
    
    filtered.forEach(t => {
      const gid = getGroupId(t.dueDate!);
      map.get(gid)!.push(t);
    });
    
    map.forEach((tasks, key) => {
      map.set(key, tasks.sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()));
    });
    
    return GROUPS.map(g => ({ group: g, tasks: map.get(g.id) || [] }));
  }, [filtered]);

  // Calculate streaks
  const streaks = useMemo(() => {
    return {
      today: actionable.filter(t => isToday(new Date(t.dueDate!)) && t.status !== 'done').length === 0,
      yesterday: actionable.filter(t => isYesterday(new Date(t.dueDate!)) && t.status !== 'done').length === 0,
    };
  }, [actionable]);

  const handleComplete = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    onCompleteTask(id);
  };

  const clearAll = () => setDismissed(prev => new Set([...prev, ...actionable.map(t => t.id)]));

  const toggleGroup = (id: GroupId) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenGroups(new Set(GROUPS.map(g => g.id)));
  const collapseAll = () => setOpenGroups(new Set());

  const FILTERS: { id: FilterType; label: string; icon: React.ElementType; mood: string }[] = [
    { id: 'all', label: 'All', icon: Globe, mood: '🌍' },
    { id: 'overdue', label: 'Overdue', icon: AlertTriangle, mood: '🔥' },
    { id: 'today', label: 'Today', icon: Sun, mood: '☀️' },
    { id: 'upcoming', label: 'Upcoming', icon: Rocket, mood: '🚀' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto h-screen flex flex-col bg-gradient-to-b from-background via-background to-background/95"
      data-testid="notifications-view"
    >
      {/* Fixed header with time mood */}
      <div className="flex-shrink-0 px-4 pt-4">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="flex items-start justify-between gap-3 mb-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent notifications-title">
                Time Capsule
              </h1>
              <motion.span
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xl time-mood"
                data-time-mood={timeMood}
              >
                {timeMood === 'day' ? '☀️' : '🌙'}
              </motion.span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1 notifications-subtitle">
              <span>{counts.all === 0 ? '✨ Zen mode' : `⏳ ${counts.all} tasks in the time stream`}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0 notifications-actions">
            {grouped.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={expandAll}
                  className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50 backdrop-blur-sm expand-all-button"
                  data-testid="expand-all"
                >
                  🔮 Expand
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={collapseAll}
                  className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50 backdrop-blur-sm collapse-all-button"
                  data-testid="collapse-all"
                >
                  📦 Collapse
                </motion.button>
              </>
            )}
            {counts.all > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAll}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-secondary/50 backdrop-blur-sm clear-all-button"
                data-testid="clear-all"
              >
                🧹 Clear
              </motion.button>
            )}
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onGoToSettings}
              className="p-2 rounded-xl hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground backdrop-blur-sm settings-button"
              data-testid="notifications-settings"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Push permission banner with personality */}
        <AnimatePresence>
          {permission === 'default' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="relative overflow-hidden glass rounded-2xl p-4 mb-4 border border-primary/20 permission-banner"
              data-testid="permission-banner"
            >
              <FloatingParticles color="#f59e0b" count={5} />
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20 flex-shrink-0">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold flex items-center gap-1">
                    <span>🔔 Time-travel alerts</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Get notified when tasks cross your timeline</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => Notification.requestPermission()}
                  className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 flex-shrink-0 transition-all enable-button"
                  data-testid="enable-notifications"
                >
                  Enable
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Creative filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none filter-tabs">
          {FILTERS.map(f => {
            const Icon = f.icon;
            const count = counts[f.id === 'all' ? 'all' : f.id];
            return (
              <motion.button
                key={f.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 filter-button',
                  'border backdrop-blur-sm',
                  filter === f.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                    : 'bg-secondary/30 hover:bg-secondary/50 text-muted-foreground border-transparent hover:border-primary/30'
                )}
                data-filter={f.id}
                data-active={filter === f.id}
                data-count={count}
              >
                <span className="text-sm">{f.mood}</span>
                <Icon className="w-3 h-3" />
                <span>{f.label}</span>
                {count > 0 && filter !== f.id && (
                  <span className="ml-1 text-[10px] bg-background/50 px-1.5 py-0.5 rounded-full filter-count">
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Creative scroll progress */}
      <TimeTravelProgress containerRef={scrollContainerRef} />

      {/* Scrollable content with time-tunnel effect */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scroll-smooth relative notifications-scroll"
      >
        {/* Time tunnel background effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none time-tunnel"
          style={{
            background: `radial-gradient(circle at 50% 0%, transparent 0%, ${timeMood === 'day' ? 'rgba(255,215,0,0.03)' : 'rgba(147,51,234,0.03)'} 100%)`,
          }}
        />

        {/* Grouped list */}
        <AnimatePresence mode="popLayout">
          <motion.div key="list" className="space-y-3 relative z-10 notifications-groups">
            {grouped.map(({ group, tasks: groupTasks }, index) => {
              const isOpen = openGroups.has(group.id);
              const streakActive = group.id === 'today' && streaks.today;

              return (
                <motion.div
                  key={group.id}
                  data-group-id={group.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative notification-group"
                  data-group={group.id}
                  data-group-open={isOpen}
                >
                  {/* Group header */}
                  <GroupHeader
                    group={group}
                    count={groupTasks.length}
                    isOpen={isOpen}
                    onToggle={() => toggleGroup(group.id)}
                    streakActive={streakActive}
                  />

                  {/* Cards or empty state */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden group-content"
                      >
                        <div className="px-3 pb-3 pt-2 space-y-2 tasks-container">
                          {groupTasks.length > 0 ? (
                            groupTasks.map(task => (
                              <NotifCard
                                key={task.id}
                                task={task}
                                group={group}
                                onComplete={handleComplete}
                                onView={onViewTask}
                              />
                            ))
                          ) : (
                            <EmptyGroupState group={group} />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Stats strip with personality */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky bottom-4 glass rounded-2xl p-3 grid grid-cols-3 gap-2 text-center border border-border/50 backdrop-blur-lg stats-strip"
            data-testid="stats-strip"
          >
            {[
              { label: 'Total', value: tasks.length, icon: '📚', color: '' },
              { label: 'Done', value: tasks.filter(t => t.status === 'done').length, icon: '✅', color: 'text-green-500' },
              { label: 'Active', value: counts.all, icon: counts.all > 0 ? '⚡' : '😌', color: counts.all > 0 ? 'text-amber-500' : '' },
            ].map(s => (
              <motion.div
                key={s.label}
                whileHover={{ scale: 1.05 }}
                className="px-2 stat-item"
                data-stat={s.label.toLowerCase()}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm">{s.icon}</span>
                  <p className={cn('text-lg font-black stat-value', s.color)}>{s.value}</p>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5 stat-label">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}