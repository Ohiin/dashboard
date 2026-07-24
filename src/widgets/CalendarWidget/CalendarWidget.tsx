import { useMemo, useState, memo} from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

function CalendarWidget({ widget }: WidgetContentProps) {
  const [events, setEvents] = useLocalStorage<Record<string, string>>(
    `widget:${widget.id}:events`,
    {}
  );
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [draft, setDraft] = useState("");

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    const arr: Date[] = [];
    let d = start;
    while (d <= end) {
      arr.push(d);
      d = addDays(d, 1);
    }
    return arr;
  }, [cursor]);

  function openDay(d: Date) {
    setSelected(d);
    setDraft(events[format(d, "yyyy-MM-dd")] || "");
  }

  function saveDraft() {
    if (!selected) return;
    const key = format(selected, "yyyy-MM-dd");
    const next = { ...events };
    if (draft.trim()) next[key] = draft.trim();
    else delete next[key];
    setEvents(next);
    setSelected(null);
  }

  return (
    <div className="flex flex-col h-full text-white text-xs">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setCursor(subMonths(cursor, 1))} className="text-accent hover:text-white p-1">
          <ChevronLeft size={14} />
        </button>
        <span className="font-semibold text-sm">{format(cursor, "MMMM yyyy")}</span>
        <button onClick={() => setCursor(addMonths(cursor, 1))} className="text-accent hover:text-white p-1">
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1 text-accent text-[10px] text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-0">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const hasEvent = !!events[key];
          return (
            <button
              key={key}
              onClick={() => openDay(d)}
              className={`rounded-lg text-[10px] flex flex-col items-center justify-start pt-1 h-10 border transition-all duration-150 ease-in-out ${
                isSameMonth(d, cursor) ? "text-white" : "text-accent/40"
              } ${isSameDay(d, new Date()) ? "border-cta" : "border-border"} ${
                hasEvent ? "bg-cta/20" : "bg-bg hover:bg-white/5"
              }`}
            >
              <span>{format(d, "d")}</span>
              {hasEvent && <span className="w-1 h-1 rounded-full bg-cta mt-0.5" />}
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2 p-4 z-20"
          onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <p className="text-sm font-semibold">{format(selected, "MMMM d, yyyy")}</p>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveDraft()}
            placeholder="e.g. Sarah's Birthday"
            className="w-full rounded-xl bg-bg border border-border px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setSelected(null)}
              className="px-3 py-1.5 rounded-full border border-border text-accent hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={saveDraft}
              className="px-3 py-1.5 rounded-full bg-cta hover:bg-cta-hover text-white"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(CalendarWidget);
