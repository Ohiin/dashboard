import { memo, useState, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

type ClockFace = "analog" | "digital" | "digital-seconds" | "flip";

interface ClockState {
  face: ClockFace;
  format24: boolean;
  showSeconds: boolean;
}

function ClockWidget({ widget }: WidgetContentProps) {
  const [time, setTime] = useState(new Date());
  const [settings] = useLocalStorage<ClockState>(
    `widget:${widget.id}:settings`,
    {
      face: "analog",
      format24: false,
      showSeconds: false,
    }
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen - lock body scroll and handle escape key
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFullscreen(false);
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.height = "";
      };
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const hours = settings.format24 ? time.getHours() : time.getHours() % 12 || 12;
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");

  const renderAnalog = () => {
    const angleHours = (hours % 12) * 30 + time.getMinutes() * 0.5;
    const angleMinutes = time.getMinutes() * 6 + time.getSeconds() * 0.1;
    const angleSeconds = time.getSeconds() * 6;

    return (
      <div className="relative w-full max-w-[200px] aspect-square mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" className="fill-bg stroke-border" strokeWidth="2" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
            const rad = (deg - 90) * (Math.PI / 180);
            const x1 = 50 + 35 * Math.cos(rad);
            const y1 = 50 + 35 * Math.sin(rad);
            const x2 = 50 + 42 * Math.cos(rad);
            const y2 = 50 + 42 * Math.sin(rad);
            const isHour = i % 5 === 0;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={isHour ? "stroke-white stroke-[3]" : "stroke-accent/40 stroke-[1.5]"}
              />
            );
          })}
          <line
            x1="50"
            y1="50"
            x2={50 + 20 * Math.cos((angleHours - 90) * (Math.PI / 180))}
            y2={50 + 20 * Math.sin((angleHours - 90) * (Math.PI / 180))}
            className="stroke-white stroke-[3] rounded-full"
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="50"
            x2={50 + 30 * Math.cos((angleMinutes - 90) * (Math.PI / 180))}
            y2={50 + 30 * Math.sin((angleMinutes - 90) * (Math.PI / 180))}
            className="stroke-accent stroke-[2] rounded-full"
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="50"
            x2={50 + 35 * Math.cos((angleSeconds - 90) * (Math.PI / 180))}
            y2={50 + 35 * Math.sin((angleSeconds - 90) * (Math.PI / 180))}
            className="stroke-cta stroke-[1] rounded-full"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="3" className="fill-cta" />
        </svg>
      </div>
    );
  };

  const renderDigital = (showSecs: boolean) => {
    const timeStr = settings.format24
      ? `${String(hours).padStart(2, "0")}:${minutes}${showSecs ? `:${seconds}` : ""}`
      : `${hours}:${minutes}${showSecs ? `:${seconds}` : ""} ${hours >= 12 ? "PM" : "AM"}`;
    
    return (
      <div className="flex items-center justify-center h-full">
        <div className="font-mono font-bold text-white text-center text-5xl">
          {timeStr}
        </div>
      </div>
    );
  };

  const renderFlip = () => {
    const h = String(hours).padStart(2, "0");
    const m = String(time.getMinutes()).padStart(2, "0");
    const s = String(time.getSeconds()).padStart(2, "0");

    return (
      <div className="flex items-center justify-center h-full gap-1">
        <div className="flex gap-0.5">
          <div className="bg-bg border border-border rounded-lg px-2 py-1 min-w-[30px] text-center">
            <span className="text-3xl font-mono font-bold text-white">{h[0]}</span>
          </div>
          <div className="bg-bg border border-border rounded-lg px-2 py-1 min-w-[30px] text-center">
            <span className="text-3xl font-mono font-bold text-white">{h[1]}</span>
          </div>
        </div>
        <span className="text-2xl font-bold text-accent/60">:</span>
        <div className="flex gap-0.5">
          <div className="bg-bg border border-border rounded-lg px-2 py-1 min-w-[30px] text-center">
            <span className="text-3xl font-mono font-bold text-white">{m[0]}</span>
          </div>
          <div className="bg-bg border border-border rounded-lg px-2 py-1 min-w-[30px] text-center">
            <span className="text-3xl font-mono font-bold text-white">{m[1]}</span>
          </div>
        </div>
        {settings.showSeconds && (
          <>
            <span className="text-2xl font-bold text-accent/60">:</span>
            <div className="flex gap-0.5">
              <div className="bg-bg border border-border rounded-lg px-2 py-1 min-w-[30px] text-center">
                <span className="text-3xl font-mono font-bold text-white">{s[0]}</span>
              </div>
              <div className="bg-bg border border-border rounded-lg px-2 py-1 min-w-[30px] text-center">
                <span className="text-3xl font-mono font-bold text-white">{s[1]}</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderClock = () => {
    switch (settings.face) {
      case "analog":
        return renderAnalog();
      case "digital":
        return renderDigital(false);
      case "digital-seconds":
        return renderDigital(true);
      case "flip":
        return renderFlip();
      default:
        return renderAnalog();
    }
  };

  return (
    <>
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-[#1a1a1a] flex flex-col items-center justify-center p-8"
          onDoubleClick={toggleFullscreen}
        >
          <div className="w-full max-w-2xl">
            {renderClock()}
          </div>
          <button
            onClick={toggleFullscreen}
            className="fixed top-6 right-6 text-accent/60 hover:text-white transition-colors duration-150 p-2 rounded-lg hover:bg-white/5 z-[101]"
          >
            <Minimize2 size={24} />
          </button>
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-xs text-accent/40 z-[101]">
            Double-click or press ESC to exit fullscreen
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-4">
          {renderClock()}
        </div>
        <div className="text-center pb-2 flex items-center justify-center gap-3">
          <span className="text-xs text-accent/60">
            {time.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <button
            onClick={toggleFullscreen}
            className="text-accent/40 hover:text-white transition-colors duration-150 p-1 rounded hover:bg-white/5"
            title="Fullscreen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

export default memo(ClockWidget);
