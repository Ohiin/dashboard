import { useState, memo} from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

const SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  const label12 =
    (hour % 12 === 0 ? 12 : hour % 12) + ":" + min + (hour < 12 ? " AM" : " PM");
  return { key: `${hour}:${min}`, label: label12 };
});

function ScheduleWidget({ widget }: WidgetContentProps) {
  const [events, setEvents] = useLocalStorage<Record<string, string>>(
    `widget:${widget.id}:schedule`,
    {}
  );
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function open(slotKey: string) {
    setActive(slotKey);
    setDraft(events[slotKey] || "");
  }

  function save() {
    if (!active) return;
    const next = { ...events };
    if (draft.trim()) next[active] = draft.trim();
    else delete next[active];
    setEvents(next);
    setActive(null);
  }

  return (
    <div className="flex flex-col h-full text-white text-xs relative">
      <div className="flex-1 min-h-0 overflow-auto">
        {SLOTS.map((slot) => {
          const hasEvent = !!events[slot.key];
          return (
            <button
              key={slot.key}
              onClick={() => open(slot.key)}
              className={`w-full flex items-center gap-2 text-left px-2 py-1.5 border-l-2 transition-all duration-150 ease-in-out ${
                hasEvent ? "border-cta bg-cta/10" : "border-border hover:bg-white/5"
              }`}
            >
              <span className="w-14 shrink-0 text-accent">{slot.label}</span>
              <span className="truncate">{events[slot.key]}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2 p-4 z-20"
          onMouseDown={(e) => e.target === e.currentTarget && setActive(null)}
        >
          <p className="text-sm font-semibold">
            {SLOTS.find((s) => s.key === active)?.label}
          </p>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="Add an event"
            className="w-full rounded-xl bg-bg border border-border px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setActive(null)}
              className="px-3 py-1.5 rounded-full border border-border text-accent hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={save}
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

export default memo(ScheduleWidget);
