'use client';
import * as React from "react";
import { ChevronLeft, ChevronRight, Keyboard, CalendarDays } from "lucide-react";
import { cn } from "../utils";

export type CalendarProps = {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  isFullDay?: boolean;
  onFullDayChange?: (isFullDay: boolean) => void;
  startTime?: { hours: number; minutes: number } | null;
  endTime?: { hours: number; minutes: number } | null;
  onStartTimeChange?: (time: { hours: number; minutes: number } | null) => void;
  onEndTimeChange?: (time: { hours: number; minutes: number } | null) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

type View = 'day' | 'month' | 'year';
type InputMode = 'picker' | 'typing';

function TimeSpinner({
  value, onChange, max, step = 1,
}: {
  value: number; onChange: (v: number) => void; max: number; step?: number;
}) {
  const inc = () => onChange((value + step) % (max + step));
  const dec = () => onChange((value - step + max + step) % (max + step));
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button type="button" onClick={inc} className="p-0.5 hover:text-primary transition-colors rounded">
        <ChevronRight className="w-3 h-3 -rotate-90" />
      </button>
      <span className="text-sm font-mono font-bold w-6 text-center">{String(value).padStart(2, '0')}</span>
      <button type="button" onClick={dec} className="p-0.5 hover:text-primary transition-colors rounded">
        <ChevronRight className="w-3 h-3 rotate-90" />
      </button>
    </div>
  );
}

function Calendar({
  selected, onSelect, isFullDay = true, onFullDayChange,
  startTime, endTime, onStartTimeChange, onEndTimeChange,
  className, disabled,
}: CalendarProps) {
  const today = new Date();
  const [view, setView] = React.useState<View>('day');
  const [cursor, setCursor] = React.useState(selected ?? today);
  const [inputMode, setInputMode] = React.useState<InputMode>('picker');
  const [typedDate, setTypedDate] = React.useState('');
  const [typedStart, setTypedStart] = React.useState('');
  const [typedEnd, setTypedEnd] = React.useState('');
  const [typeError, setTypeError] = React.useState('');

  React.useEffect(() => { if (selected) setCursor(new Date(selected)); }, [selected]);

  React.useEffect(() => {
    if (inputMode === 'typing') {
      setTypedDate(selected ? `${selected.getMonth()+1}/${selected.getDate()}/${selected.getFullYear()}` : '');
      setTypedStart(startTime ? `${String(startTime.hours).padStart(2,'0')}:${String(startTime.minutes).padStart(2,'0')}` : '');
      setTypedEnd(endTime ? `${String(endTime.hours).padStart(2,'0')}:${String(endTime.minutes).padStart(2,'0')}` : '');
      setTypeError('');
    }
  }, [inputMode, selected, startTime, endTime]);

  const applyTyped = () => {
    setTypeError('');
    const dateParts = typedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!dateParts) { setTypeError('Date must be MM/DD/YYYY'); return; }
    const parsed = new Date(Number(dateParts[3]), Number(dateParts[1]) - 1, Number(dateParts[2]));
    if (isNaN(parsed.getTime())) { setTypeError('Invalid date'); return; }
    if (!isFullDay) {
      const parseTime = (s: string) => {
        const m = s.match(/^(\d{1,2}):(\d{2})$/);
        if (!m) return null;
        const h = Number(m[1]); const min = Number(m[2]);
        if (h > 23 || min > 59) return null;
        return { hours: h, minutes: min };
      };
      const st = parseTime(typedStart);
      const et = parseTime(typedEnd);
      if (!st) { setTypeError('Start time must be HH:MM'); return; }
      if (typedEnd && !et) { setTypeError('End time must be HH:MM'); return; }
      if (st && et && (st.hours * 60 + st.minutes) >= (et.hours * 60 + et.minutes)) {
        setTypeError('End time must be after start time'); return;
      }
      onStartTimeChange?.(st);
      onEndTimeChange?.(et ?? null);
    }
    setCursor(parsed);
    onSelect?.(parsed);
    setInputMode('picker');
  };

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  type Cell = { day: number; thisMonth: boolean; date: Date };
  const cells: Cell[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    cells.push({ day: d, thisMonth: false, date: new Date(year, month - 1, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, thisMonth: true, date: new Date(year, month, d) });
  }
  for (let d = 1; cells.length < 42; d++) {
    cells.push({ day: d, thisMonth: false, date: new Date(year, month + 1, d) });
  }

  const isSelected = (date: Date) =>
    selected &&
    date.getFullYear() === selected.getFullYear() &&
    date.getMonth() === selected.getMonth() &&
    date.getDate() === selected.getDate();
  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isDisabled = (date: Date) => disabled?.(date) ?? false;

  const yearStart = Math.floor(year / 12) * 12;
  const yearGrid = Array.from({ length: 12 }, (_, i) => yearStart + i);

  const timePresets = [
    { label: '9AM', h: 9, m: 0 },
    { label: '12PM', h: 12, m: 0 },
    { label: '5PM', h: 17, m: 0 },
    { label: '8PM', h: 20, m: 0 },
  ];

  return (
    /* Wrapper — full width on mobile, fixed width on desktop */
    <div className={cn(
      "bg-popover text-popover-foreground border border-border shadow-xl overflow-hidden",
      // Mobile: full width, rounded at top only (sits above keyboard)
      "w-full rounded-t-2xl",
      // Desktop: fixed width card with full rounding
      "sm:w-[320px] sm:rounded-2xl",
      // Ensure visibility with high z-index
      "relative",
      className
    )}>

      {/* Drag handle on mobile - visual indicator only */}
      <div className="flex justify-center pt-2 pb-0 sm:hidden">
        <div className="w-8 h-1 rounded-full bg-border" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        {inputMode === 'picker' ? (
          <>
            <button
              type="button"
              onClick={() => {
                if (view === 'day') setCursor(new Date(year, month - 1, 1));
                else if (view === 'month') setCursor(new Date(year - 1, month, 1));
                else setCursor(new Date(yearStart - 12, month, 1));
              }}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-0.5">
              {view !== 'year' && (
                <button
                  type="button"
                  onClick={() => setView(v => v === 'month' ? 'day' : 'month')}
                  className="px-2 py-0.5 rounded-lg text-xs font-bold hover:bg-secondary transition-colors"
                >
                  {FULL_MONTHS[month]}
                </button>
              )}
              <button
                type="button"
                onClick={() => setView(v => v === 'year' ? 'day' : 'year')}
                className="px-2 py-0.5 rounded-lg text-xs font-bold hover:bg-secondary transition-colors"
              >
                {view === 'year' ? `${yearStart}–${yearStart + 11}` : year}
              </button>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setInputMode('typing')}
                className="p-1 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                title="Type date"
              >
                <Keyboard className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (view === 'day') setCursor(new Date(year, month + 1, 1));
                  else if (view === 'month') setCursor(new Date(year + 1, month, 1));
                  else setCursor(new Date(yearStart + 12, month, 1));
                }}
                className="p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Keyboard className="w-3 h-3 text-primary" /> Type manually
            </span>
            <button type="button" onClick={() => setInputMode('picker')} className="p-1 rounded-lg hover:bg-secondary">
              <CalendarDays className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Typing mode */}
      {inputMode === 'typing' && (
        <div className="p-3 space-y-2">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Date (MM/DD/YYYY)</label>
            <input
              className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              placeholder="02/28/2026"
              value={typedDate}
              onChange={e => setTypedDate(e.target.value)}
              autoFocus
            />
          </div>
          {!isFullDay && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Start (HH:MM)</label>
                <input className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary" placeholder="09:00" value={typedStart} onChange={e => setTypedStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">End (HH:MM)</label>
                <input className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary" placeholder="17:00" value={typedEnd} onChange={e => setTypedEnd(e.target.value)} />
              </div>
            </div>
          )}
          {typeError && <p className="text-[10px] text-destructive font-medium">{typeError}</p>}
          <button type="button" onClick={applyTyped} className="w-full py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity">
            Apply
          </button>
        </div>
      )}

      {/* Picker mode */}
      {inputMode === 'picker' && (
        <>
          {/* Day view */}
          {view === 'day' && (
            <div className="p-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[0.65rem] font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((cell, i) => {
                  const sel = isSelected(cell.date);
                  const tod = isToday(cell.date);
                  const dis = isDisabled(cell.date);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={dis}
                      onClick={() => { setCursor(cell.date); onSelect?.(cell.date); }}
                      className={cn(
                        "h-7 w-7 mx-auto rounded-lg text-[0.7rem] font-medium transition-colors flex items-center justify-center",
                        !cell.thisMonth && "text-muted-foreground/25",
                        cell.thisMonth && !sel && !tod && "hover:bg-secondary text-foreground",
                        tod && !sel && "border border-primary text-primary",
                        sel && "bg-primary text-primary-foreground",
                        dis && "opacity-20 cursor-not-allowed"
                      )}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              {/* Time section */}
              <div className="mt-2 pt-2 border-t border-border space-y-2">
                {/* Full day toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Full Day</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isFullDay}
                    onClick={() => {
                      const next = !isFullDay;
                      onFullDayChange?.(next);
                      if (next) { onStartTimeChange?.(null); onEndTimeChange?.(null); }
                      else { 
                        onStartTimeChange?.({ hours: 9, minutes: 0 }); 
                        onEndTimeChange?.({ hours: 10, minutes: 0 }); 
                      }
                    }}
                    className={cn(
                      "relative inline-flex h-4 w-8 rounded-full border-2 border-transparent transition-colors duration-200",
                      isFullDay ? "bg-primary" : "bg-secondary"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-3 w-3 rounded-full bg-white shadow-sm transform transition-transform duration-200",
                      isFullDay ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>

                {/* Time spinners */}
                {!isFullDay && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-1">
                      {timePresets.map(p => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => { 
                            onStartTimeChange?.({ hours: p.h, minutes: p.m }); 
                            onEndTimeChange?.({ hours: p.h + 1, minutes: p.m }); 
                          }}
                          className={cn(
                            "py-0.5 rounded-lg text-[0.6rem] font-bold transition-colors border",
                            startTime?.hours === p.h && startTime?.minutes === p.m
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary"
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-secondary/50 rounded-xl p-1.5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground text-center mb-1">Start</p>
                        <div className="flex items-center justify-center gap-1">
                          <TimeSpinner value={startTime?.hours ?? 9} onChange={h => onStartTimeChange?.({ hours: h, minutes: startTime?.minutes ?? 0 })} max={23} />
                          <span className="font-bold text-muted-foreground text-xs">:</span>
                          <TimeSpinner value={startTime?.minutes ?? 0} onChange={m => onStartTimeChange?.({ hours: startTime?.hours ?? 9, minutes: m })} max={45} step={15} />
                        </div>
                      </div>
                      <div className="bg-secondary/50 rounded-xl p-1.5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground text-center mb-1">End</p>
                        <div className="flex items-center justify-center gap-1">
                          <TimeSpinner value={endTime?.hours ?? 10} onChange={h => onEndTimeChange?.({ hours: h, minutes: endTime?.minutes ?? 0 })} max={23} />
                          <span className="font-bold text-muted-foreground text-xs">:</span>
                          <TimeSpinner value={endTime?.minutes ?? 0} onChange={m => onEndTimeChange?.({ hours: endTime?.hours ?? 10, minutes: m })} max={45} step={15} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Month view */}
          {view === 'month' && (
            <div className="p-2 grid grid-cols-3 gap-1.5">
              {MONTHS.map((m, i) => (
                <button key={m} type="button"
                  onClick={() => { setCursor(new Date(year, i, 1)); setView('day'); }}
                  className={cn("py-2 rounded-xl text-xs font-semibold transition-colors",
                    i === month ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
                  )}
                >{m}</button>
              ))}
            </div>
          )}

          {/* Year view */}
          {view === 'year' && (
            <div className="p-2 grid grid-cols-3 gap-1.5">
              {yearGrid.map(y => (
                <button key={y} type="button"
                  onClick={() => { setCursor(new Date(y, month, 1)); setView('month'); }}
                  className={cn("py-2 rounded-xl text-xs font-semibold transition-colors",
                    y === year ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
                  )}
                >{y}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

Calendar.displayName = "Calendar";
export { Calendar };