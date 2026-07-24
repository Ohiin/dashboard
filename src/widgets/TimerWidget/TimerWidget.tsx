import { useEffect, useRef, useState, memo} from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

function TimerWidget({ widget }: WidgetContentProps) {
  const [mode, setMode] = useLocalStorage<"focus" | "break">(`widget:${widget.id}:mode`, "focus");
  const [secondsLeft, setSecondsLeft] = useLocalStorage<number>(
    `widget:${widget.id}:secondsLeft`,
    FOCUS_SECONDS
  );
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const total = mode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
  const progress = 1 - secondsLeft / total;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          playChime();
          const nextMode = mode === "focus" ? "break" : "focus";
          setMode(nextMode);
          return nextMode === "focus" ? FOCUS_SECONDS : BREAK_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, mode]);

  function playChime() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      /* audio unavailable — ignore */
    }
  }

  function reset() {
    setRunning(false);
    setMode("focus");
    setSecondsLeft(FOCUS_SECONDS);
  }

  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-white">
      <span className="text-[10px] uppercase tracking-widest text-accent">
        {mode === "focus" ? "Focus" : "Break"}
      </span>
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#3a3a3a" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#c15f3c"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-150 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
          {mm}:{ss}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="w-9 h-9 rounded-full bg-cta hover:bg-cta-hover flex items-center justify-center transition-all duration-150"
        >
          {running ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={reset}
          className="w-9 h-9 rounded-full border border-border text-accent hover:bg-white/5 flex items-center justify-center transition-all duration-150"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}

export default memo(TimerWidget);
