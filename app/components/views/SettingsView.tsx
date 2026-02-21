'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Zap, Bookmark, Download, Copy, CheckCircle2,
  Monitor, Trash2, AlertTriangle, Sun, Moon, Laptop,
  Bell, ChevronDown, Palette, Shield, Info,
  ExternalLink, RefreshCw, Database, ArrowLeft,
} from 'lucide-react';
import { Task } from '../../types/task';
import { cn } from '../utils';
// ✅ Import from the hook — this is what makes it work app-wide
import { applyAccentColor, applyTheme } from '../hooks/useAccentColor';

interface SettingsViewProps {
  tasks: Task[];
  onClearAllTasks: () => void;
}

type Section = 'extension' | 'appearance' | 'notifications' | 'data' | 'about';

const NAV: {
  id: Section;
  label: string;
  icon: React.ElementType;
  desc: string;
  iconColor: string;
  iconBg: string;
}[] = [
  { id: 'extension',     label: 'Extension',     icon: Zap,      desc: 'Browser widget & quick access',  iconColor: 'text-primary',          iconBg: 'bg-primary/10' },
  { id: 'appearance',    label: 'Appearance',    icon: Palette,  desc: 'Theme and display options',      iconColor: 'text-violet-500',        iconBg: 'bg-violet-500/10' },
  { id: 'notifications', label: 'Notifications', icon: Bell,     desc: 'Alerts and reminders',           iconColor: 'text-yellow-500',        iconBg: 'bg-yellow-500/10' },
  { id: 'data',          label: 'Data',          icon: Database, desc: 'Export, backup, clear data',     iconColor: 'text-blue-500',          iconBg: 'bg-blue-500/10' },
  { id: 'about',         label: 'About',         icon: Info,     desc: 'Version and links',              iconColor: 'text-muted-foreground',  iconBg: 'bg-secondary' },
];

// ── Shared helpers ────────────────────────────────────────────

function SectionTitle({ icon: Icon, label, desc, iconColor = 'text-primary', iconBg = 'bg-primary/10' }: {
  icon: React.ElementType; label: string; desc: string; iconColor?: string; iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={cn('p-2.5 rounded-xl flex-shrink-0', iconBg)}>
        <Icon className={cn('w-4 h-4', iconColor)} />
      </div>
      <div>
        <h2 className="text-base font-black tracking-tight">{label}</h2>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('glass rounded-2xl p-5 space-y-4', className)}>
      {children}
    </div>
  );
}

function Row({ label, desc, children, border = true }: {
  label: string; desc?: string; children: React.ReactNode; border?: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-4 py-3',
      border && 'border-b border-border/50 last:border-0'
    )}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0',
        value ? 'bg-primary' : 'bg-border'
      )}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

// ── Extension Section ─────────────────────────────────────────

function ExtensionSection() {
  const [urlCopied, setUrlCopied] = useState(false);
  const [bookmarkHint, setBookmarkHint] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const copyUrl = () => {
    navigator.clipboard.writeText('https://kazora.vercel.app').then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2500);
      toast.success('URL copied!');
    });
  };

  const steps = [
    'Click "Download Extension" below',
    'Go to chrome://extensions in your browser',
    'Enable Developer Mode (top-right toggle)',
    'Drag and drop the downloaded .zip onto the page',
    'The Kazora icon appears on every webpage — done!',
  ];

  const browsers = [
    {
      id: 'chrome', name: 'Chrome', steps: [
        'Click the three-dots menu → Settings',
        'Go to "On startup" in the left sidebar',
        'Select "Open a specific page or set of pages"',
        'Click "Add a new page" → enter https://kazora.vercel.app',
      ],
    },
    {
      id: 'edge', name: 'Edge', steps: [
        'Click the three-dots menu → Settings',
        'Go to "Start, home, and new tabs"',
        'Under "When Edge starts" select "Open these pages"',
        'Add https://kazora.vercel.app',
      ],
    },
    {
      id: 'firefox', name: 'Firefox', steps: [
        'Click the menu button → Settings',
        'In "Home" find "Homepage and new windows"',
        'Select "Custom URLs" → enter https://kazora.vercel.app',
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <SectionTitle icon={Zap} label="Browser Extension" desc="Get Kazora on every webpage" />

      {/* Download */}
      <Card>
        <div className="flex items-start gap-4 pb-4 border-b border-border/50">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm">Kazora Extension</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              See today's tasks as a floating icon on any webpage. Mark tasks done without opening the app.
            </p>
            <div className="flex gap-1.5 mt-2">
              {['Chrome', 'Edge', 'Brave'].map(b => (
                <span key={b} className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full">{b}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">How to install</p>
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed">{s}</span>
            </div>
          ))}
        </div>

        <a
          href="/kazora-extension.zip"
          download
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Download className="w-4 h-4" />
          Download Extension (.zip)
        </a>
        <p className="text-[10px] text-center text-muted-foreground">Free · No account needed · Works offline after first sync</p>
      </Card>

      {/* Bookmark */}
      <Card>
        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
          <div className="p-2 rounded-xl bg-yellow-500/10">
            <Bookmark className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <p className="font-bold text-sm">Bookmark This App</p>
            <p className="text-xs text-muted-foreground">One-click access from your bookmarks bar</p>
          </div>
        </div>

        {[
          { browser: 'Chrome / Edge / Brave', shortcut: 'Ctrl+D  /  ⌘D' },
          { browser: 'Firefox',               shortcut: 'Ctrl+D  /  ⌘D' },
          { browser: 'Safari',                shortcut: '⌘D' },
        ].map(b => (
          <div key={b.browser} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <span className="text-sm">{b.browser}</span>
            <kbd className="text-[11px] bg-secondary border border-border px-2.5 py-1 rounded-lg font-mono font-bold">{b.shortcut}</kbd>
          </div>
        ))}

        <button
          onClick={() => { setBookmarkHint(true); setTimeout(() => setBookmarkHint(false), 4000); }}
          className="w-full h-11 rounded-xl border-2 border-dashed border-border text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary hover:border-solid transition-all"
        >
          {bookmarkHint
            ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Press {typeof navigator !== 'undefined' && navigator.platform.includes('Mac') ? '⌘D' : 'Ctrl+D'} now!</>
            : <><Bookmark className="w-4 h-4 text-yellow-500" /> Bookmark Kazora</>}
        </button>
      </Card>

      {/* Open on startup */}
      <Card>
        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
          <div className="p-2 rounded-xl bg-green-500/10">
            <Monitor className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="font-bold text-sm">Open on Browser Start</p>
            <p className="text-xs text-muted-foreground">Kazora launches automatically every time you open your browser</p>
          </div>
        </div>

        <div className="space-y-2">
          {browsers.map(b => (
            <div key={b.id} className="rounded-xl overflow-hidden border border-border/50">
              <button
                onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
              >
                <span className="text-sm font-bold">{b.name}</span>
                <motion.div animate={{ rotate: expanded === b.id ? 180 : 0 }}>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expanded === b.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 py-3 space-y-2">
                      {b.steps.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                          <span className="text-primary font-black flex-shrink-0">{i + 1}.</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <button
          onClick={copyUrl}
          className="w-full h-11 rounded-xl border border-border text-sm font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-all"
        >
          {urlCopied
            ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Copied!</>
            : <><Copy className="w-4 h-4" /> Copy App URL</>}
        </button>
      </Card>
    </div>
  );
}

// ── Appearance Section ────────────────────────────────────────
// The key part: applyAccentColor and applyTheme are imported from
// the hook, so they update CSS vars on :root — which cascades to
// the ENTIRE app, not just this settings page.

const ACCENT_COLORS = [
  { id: 'cyan',    label: 'Cyan',    hex: '#06b6d4' },
  { id: 'indigo',  label: 'Indigo',  hex: '#6366f1' },
  { id: 'violet',  label: 'Violet',  hex: '#8b5cf6' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981' },
  { id: 'rose',    label: 'Rose',    hex: '#f43f5e' },
  { id: 'amber',   label: 'Amber',   hex: '#f59e0b' },
  { id: 'orange',  label: 'Orange',  hex: '#f97316' },
] as const;

type AccentId = typeof ACCENT_COLORS[number]['id'];

function getStoredAccent(): AccentId {
  if (typeof window === 'undefined') return 'cyan';
  const saved = localStorage.getItem('kazora-accent');
  return ACCENT_COLORS.find(c => c.hex === saved)?.id ?? 'cyan';
}

function getStoredTheme(): 'light' | 'dark' | 'system' {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('kazora-theme') as 'light' | 'dark' | 'system') ?? 'system';
}

function AppearanceSection() {
  const [theme,   setTheme]   = useState<'light' | 'dark' | 'system'>(getStoredTheme);
  const [accentId, setAccentId] = useState<AccentId>(getStoredAccent);
  const [compact, setCompact] = useState(false);
  const [anim,    setAnim]    = useState(true);

  const themes = [
    { id: 'light',  label: 'Light',  icon: Sun },
    { id: 'dark',   label: 'Dark',   icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ] as const;

  const handleTheme = (t: typeof theme) => {
    setTheme(t);
    applyTheme(t);                          // ← updates <html> class instantly
    localStorage.setItem('kazora-theme', t);
    toast.success(`Theme: ${t}`);
  };

  const handleAccent = (c: typeof ACCENT_COLORS[number]) => {
    setAccentId(c.id);
    applyAccentColor(c.hex);               // ← updates ALL CSS vars on :root instantly
    localStorage.setItem('kazora-accent', c.hex);     // persists across refreshes
    localStorage.setItem('kazora-accent-fg', '#ffffff');
    toast.success(`Accent: ${c.label}`, {
      description: 'Updated across the whole app',
    });
  };

  const current = ACCENT_COLORS.find(c => c.id === accentId)!;

  return (
    <div className="space-y-4">
      <SectionTitle icon={Palette} label="Appearance" desc="Customise how Kazora looks" iconColor="text-violet-500" iconBg="bg-violet-500/10" />

      <Card>
        {/* Theme */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(t => {
              const Icon = t.icon;
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTheme(t.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 py-3 rounded-xl border-2 text-xs font-bold transition-all',
                    active
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:bg-secondary/50 text-muted-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accent Color</p>
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white transition-all"
              style={{ background: current.hex }}
            >
              {current.label}
            </span>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            {ACCENT_COLORS.map(c => (
              <motion.button
                key={c.id}
                onClick={() => handleAccent(c)}
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.88 }}
                className="relative w-9 h-9 rounded-full"
                style={{
                  background: c.hex,
                  // ring uses the background color, works in light + dark
                  boxShadow: accentId === c.id
                    ? `0 0 0 2px var(--background), 0 0 0 4px ${c.hex}`
                    : 'none',
                }}
                title={c.label}
              >
                <AnimatePresence>
                  {accentId === c.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white drop-shadow-sm" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Live preview — uses inline style so it shows the picked color
              even before Tailwind classes have re-evaluated              */}
          <div className="mt-3 p-3 rounded-xl bg-secondary/30 border border-border/50 space-y-2">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Live preview</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
                style={{ background: current.hex }}
              >
                Button
              </span>
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{ background: `${current.hex}18`, color: current.hex }}
              >
                Badge
              </span>
              <span className="text-xs font-bold" style={{ color: current.hex }}>
                Link
              </span>
              <div className="flex-1 h-1.5 rounded-full min-w-[32px]" style={{ background: current.hex }} />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-0">
          <Row label="Compact Mode" desc="Reduce spacing and element sizes">
            <Toggle value={compact} onChange={v => { setCompact(v); toast.success(v ? 'Compact on' : 'Compact off'); }} />
          </Row>
          <Row label="Animations" desc="Motion and transition effects" border={false}>
            <Toggle value={anim} onChange={v => { setAnim(v); toast.success(v ? 'Animations on' : 'Animations off'); }} />
          </Row>
        </div>
      </Card>
    </div>
  );
}

// ── Notifications Section ─────────────────────────────────────

function NotificationsSection() {
  const [browser, setBrowser] = useState(false);
  const [dueSoon, setDueSoon] = useState(true);
  const [overdue, setOverdue] = useState(true);
  const [sound,   setSound]   = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    setPermission(perm);
    setBrowser(perm === 'granted');
    if (perm === 'granted') {
      toast.success('Notifications enabled!');
      new Notification('Kazora', { body: "You'll now get reminders for due tasks ✓" });
    } else {
      toast.error('Permission denied');
    }
  };

  const permConfig = ({
    granted:     { label: 'Granted',       color: 'text-green-500',        bg: 'bg-green-500/10' },
    denied:      { label: 'Denied',        color: 'text-destructive',      bg: 'bg-destructive/10' },
    default:     { label: 'Not yet set',   color: 'text-yellow-500',       bg: 'bg-yellow-500/10' },
    unsupported: { label: 'Not supported', color: 'text-muted-foreground', bg: 'bg-secondary' },
  } as const)[permission] ?? { label: 'Unknown', color: 'text-muted-foreground', bg: 'bg-secondary' };

  return (
    <div className="space-y-4">
      <SectionTitle icon={Bell} label="Notifications" desc="Reminders and alerts" iconColor="text-yellow-500" iconBg="bg-yellow-500/10" />
      <Card>
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Browser permission</p>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5', permConfig.bg, permConfig.color)}>
                {permConfig.label}
              </span>
            </div>
          </div>
          {permission !== 'granted' && permission !== 'unsupported' && (
            <button
              onClick={requestPermission}
              className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-all"
            >
              Enable
            </button>
          )}
        </div>

        <div className="space-y-0">
          <Row label="Browser Notifications" desc="OS-level push alerts">
            <Toggle value={browser && permission === 'granted'} onChange={v => {
              if (v && permission !== 'granted') { requestPermission(); return; }
              setBrowser(v);
            }} />
          </Row>
          <Row label="Due Soon Alerts" desc="30 minutes before a deadline">
            <Toggle value={dueSoon} onChange={setDueSoon} />
          </Row>
          <Row label="Overdue Alerts" desc="When tasks pass their due time">
            <Toggle value={overdue} onChange={setOverdue} />
          </Row>
          <Row label="Sound" desc="Play a sound with notifications" border={false}>
            <Toggle value={sound} onChange={v => { setSound(v); toast.success(v ? 'Sound on' : 'Sound off'); }} />
          </Row>
        </div>

        {permission === 'denied' && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Notifications are blocked. Go to your browser Settings → Site permissions → Notifications → allow kazora.vercel.app.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Data Section ──────────────────────────────────────────────

function DataSection({ tasks, onClearAllTasks }: { tasks: Task[]; onClearAllTasks: () => void }) {
  const [confirmClear, setConfirmClear] = useState(false);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kazora-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${tasks.length} tasks as JSON`);
  };

  const exportCSV = () => {
    const headers = ['title', 'description', 'status', 'priority', 'dueDate', 'tags', 'createdAt', 'completedAt'];
    const rows = tasks.map(t => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status, t.priority, t.dueDate || '',
      `"${(t.tags || []).join(', ')}"`,
      t.createdAt, t.completedAt || '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kazora-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as CSV');
  };

  const stats = [
    { label: 'Total tasks',   value: tasks.length },
    { label: 'Completed',     value: tasks.filter(t => t.status === 'done').length },
    { label: 'In progress',   value: tasks.filter(t => t.status === 'in-progress').length },
    { label: 'High priority', value: tasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length },
  ];

  return (
    <div className="space-y-4">
      <SectionTitle icon={Database} label="Data" desc="Export, backup, and manage your data" iconColor="text-blue-500" iconBg="bg-blue-500/10" />

      <Card>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overview</p>
        <div className="grid grid-cols-2 gap-2">
          {stats.map(s => (
            <div key={s.label} className="bg-secondary/40 rounded-xl p-3">
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          Stored locally in your browser · Never sent to any server
        </div>
      </Card>

      <Card>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Export Data</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'JSON', sub: 'Full backup', fn: exportJSON },
            { label: 'CSV',  sub: 'Spreadsheet', fn: exportCSV },
          ].map(e => (
            <button
              key={e.label}
              onClick={e.fn}
              className="flex flex-col items-center gap-2 py-4 rounded-xl border border-border hover:bg-secondary/50 transition-all group"
            >
              <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="text-center">
                <p className="text-xs font-bold">{e.label}</p>
                <p className="text-[10px] text-muted-foreground">{e.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="border border-destructive/20">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          <p className="text-sm font-black">Danger Zone</p>
        </div>
        <p className="text-xs text-muted-foreground">These actions are permanent and cannot be undone.</p>

        <AnimatePresence mode="wait">
          {confirmClear ? (
            <motion.div key="confirm" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-xs text-destructive font-semibold text-center">
                Permanently delete all {tasks.length} tasks?
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmClear(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-secondary transition-all">Cancel</button>
                <button onClick={() => { onClearAllTasks(); setConfirmClear(false); }} className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-black hover:opacity-90">Yes, delete all</button>
              </div>
            </motion.div>
          ) : (
            <motion.button key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmClear(true)}
              className="w-full py-3 rounded-xl border-2 border-destructive/30 text-destructive text-sm font-bold hover:bg-destructive/5 hover:border-destructive transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear all tasks
            </motion.button>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

// ── About Section ─────────────────────────────────────────────

function AboutSection() {
  const links = [
    { label: 'Open App',           href: 'https://kazora.vercel.app',                     icon: ExternalLink },
    { label: 'Report a Bug',       href: 'https://github.com/yourusername/kazora/issues',  icon: ExternalLink },
    { label: 'Privacy Policy',     href: 'https://kazora.vercel.app/privacy',              icon: Shield },
    { label: 'Check for Updates',  href: '#',                                               icon: RefreshCw },
  ];

  return (
    <div className="space-y-4">
      <SectionTitle icon={Info} label="About" desc="App info and resources" iconColor="text-muted-foreground" iconBg="bg-secondary" />

      <Card>
        <div className="flex items-center gap-4 pb-4 border-b border-border/50">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Kazora</h3>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-500 font-semibold">All systems operational</span>
            </div>
          </div>
        </div>

        <div className="space-y-0">
          {links.map(l => {
            const Icon = l.icon;
            return (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="flex items-center justify-between py-3 px-1 rounded-xl hover:bg-secondary/50 transition-colors group border-b border-border/50 last:border-0"
              >
                <span className="text-sm font-semibold group-hover:text-primary transition-colors">{l.label}</span>
                <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Built With</p>
        <div className="flex flex-wrap gap-2">
          {['Next.js 16', 'TypeScript', 'Tailwind v4', 'Framer Motion', 'Sonner', 'date-fns'].map(t => (
            <span key={t} className="text-xs font-semibold bg-secondary px-2.5 py-1 rounded-full">{t}</span>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Data stored locally in your browser. No tracking. No ads. No accounts required.
        </p>
      </Card>
    </div>
  );
}

// ── Main SettingsView ─────────────────────────────────────────

export function SettingsView({ tasks, onClearAllTasks }: SettingsViewProps) {
  const [active, setActive] = useState<Section>('extension');
  // Mobile: show nav list first, tap to reveal content
  const [mobileContent, setMobileContent] = useState(false);

  const content: Record<Section, React.ReactNode> = {
    extension:     <ExtensionSection />,
    appearance:    <AppearanceSection />,
    notifications: <NotificationsSection />,
    data:          <DataSection tasks={tasks} onClearAllTasks={onClearAllTasks} />,
    about:         <AboutSection />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Customise your Kazora experience</p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">

        {/* ── Settings sidebar nav ─────────────────────────────── */}
        <nav className={cn('md:w-60 flex-shrink-0', mobileContent && 'hidden md:block')}>
          <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
            {NAV.map(n => {
              const Icon = n.icon;
              const active_ = active === n.id;
              return (
                <motion.button
                  key={n.id}
                  onClick={() => { setActive(n.id); setMobileContent(true); }}
                  className={cn(
                    'relative w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors',
                    active_ ? 'bg-primary/8' : 'hover:bg-secondary/50'
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Left accent bar */}
                  {active_ && (
                    <motion.div
                      layoutId="settings-bar"
                      className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-r-full"
                    />
                  )}

                  {/* Icon */}
                  <div className={cn(
                    'p-1.5 rounded-lg flex-shrink-0 transition-colors',
                    active_ ? n.iconBg : 'bg-secondary/60'
                  )}>
                    <Icon className={cn('w-3.5 h-3.5 transition-colors', active_ ? n.iconColor : 'text-muted-foreground')} />
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-bold', active_ ? 'text-foreground' : 'text-muted-foreground')}>{n.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{n.desc}</p>
                  </div>

                  {/* Active dot */}
                  {active_ && <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', n.iconColor.replace('text-', 'bg-'))} />}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* ── Section content ───────────────────────────────────── */}
        <div className={cn('flex-1 min-w-0', !mobileContent && 'hidden md:block')}>

          {/* Mobile back arrow */}
          {mobileContent && (
            <button
              onClick={() => setMobileContent(false)}
              className="md:hidden flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.14 }}
            >
              {content[active]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}