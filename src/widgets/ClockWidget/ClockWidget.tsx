import { useEffect, useState, memo} from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

function ClockWidget({ widget }: WidgetContentProps) {
  const [now, setNow] = useState(new Date());
  const [is24h, setIs24h] = useLocalStorage<boolean>(`widget:${widget.id}:is24h`, false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secDeg = seconds * 6;
  const minDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  const digitalHours = is24h ? hours : hours % 12 === 0 ? 12 : hours % 12;
  const ampm = hours >= 12 ? "PM" : "AM";

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-white">
      <div className="relative w-24 h-24 rounded-full border-2 border-border bg-bg">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-1.5 bg-accent/50 left-1/2 top-0.5 origin-[1px_46px]"
            style={{ transform: `rotate(${i * 30}deg)` }}
          />
        ))}
        <div
          className="absolute w-0.5 h-6 bg-white left-1/2 top-1/2 origin-bottom rounded-full"
          style={{ transform: `translate(-50%, -100%) rotate(${hourDeg}deg)` }}
        />
        <div
          className="absolute w-0.5 h-8 bg-accent left-1/2 top-1/2 origin-bottom rounded-full"
          style={{ transform: `translate(-50%, -100%) rotate(${minDeg}deg)` }}
        />
        <div
          className="absolute w-px h-9 bg-cta left-1/2 top-1/2 origin-bottom"
          style={{ transform: `translate(-50%, -100%) rotate(${secDeg}deg)` }}
        />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-cta left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="text-lg font-mono font-semibold">
        {String(digitalHours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")} {!is24h && <span className="text-xs">{ampm}</span>}
      </div>

      <button
        onClick={() => setIs24h(!is24h)}
        className="text-xs px-3 py-1 rounded-full border border-border text-accent hover:bg-white/5 transition-all duration-150"
      >
        {is24h ? "24hr" : "12hr"} — switch
      </button>
    </div>
  );
}

export default memo(ClockWidget);
