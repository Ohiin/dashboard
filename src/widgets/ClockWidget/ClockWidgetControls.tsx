import { memo, useState } from "react";
import { Settings, X } from "lucide-react";
import type { WidgetInstance } from "../../types";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface ClockState {
  face: string;
  format24: boolean;
  showSeconds: boolean;
}

interface ClockWidgetControlsProps {
  widget: WidgetInstance;
}

const CLOCK_FACES = [
  { id: "analog", label: "Analog" },
  { id: "digital", label: "Digital" },
  { id: "digital-seconds", label: "Digital + Sec" },
  { id: "flip", label: "Flip Clock" },
];

function ClockWidgetControls({ widget }: ClockWidgetControlsProps) {
  const [settings, setSettings] = useLocalStorage<ClockState>(
    `widget:${widget.id}:settings`,
    {
      face: "analog",
      format24: false,
      showSeconds: false,
    }
  );
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = <K extends keyof ClockState>(key: K, value: ClockState[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  // Stop drag events from propagating
  const stopDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) {
    return (
      <button
        onMouseDown={stopDrag}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="text-accent/60 hover:text-white transition-colors duration-150 rounded-full p-1 hover:bg-white/10"
        title="Clock settings"
      >
        <Settings size={14} />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop - fixed to cover the whole screen */}
      <div
        className="fixed inset-0 z-40"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsOpen(false);
        }}
      />
      
      {/* Dropdown */}
      <div
        className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-soft p-3 z-50"
        onMouseDown={stopDrag}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">Clock Settings</span>
          <button
            onMouseDown={stopDrag}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="text-accent/60 hover:text-white transition-colors duration-150"
          >
            <X size={14} />
          </button>
        </div>

        {/* Clock Face */}
        <div className="mb-2">
          <label className="text-[10px] text-accent/60 block mb-1">Face</label>
          <div className="grid grid-cols-2 gap-1">
            {CLOCK_FACES.map((f) => (
              <button
                key={f.id}
                onMouseDown={stopDrag}
                onClick={(e) => {
                  e.stopPropagation();
                  updateSetting("face", f.id);
                }}
                className={`text-left px-2 py-1 rounded text-[10px] transition-all duration-150 ${
                  settings.face === f.id
                    ? "bg-cta text-white"
                    : "bg-bg text-accent hover:bg-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[10px] text-accent">24hr Format</span>
            <div
              onMouseDown={stopDrag}
              onClick={(e) => {
                e.stopPropagation();
                updateSetting("format24", !settings.format24);
              }}
              className={`w-8 h-4 rounded-full transition-colors duration-150 cursor-pointer ${
                settings.format24 ? "bg-cta" : "bg-accent/30"
              } relative`}
            >
              <div
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-150 ${
                  settings.format24 ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </div>
          </label>

          {settings.face !== "analog" && (
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-[10px] text-accent">Show Seconds</span>
              <div
                onMouseDown={stopDrag}
                onClick={(e) => {
                  e.stopPropagation();
                  updateSetting("showSeconds", !settings.showSeconds);
                }}
                className={`w-8 h-4 rounded-full transition-colors duration-150 cursor-pointer ${
                  settings.showSeconds ? "bg-cta" : "bg-accent/30"
                } relative`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-150 ${
                    settings.showSeconds ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(ClockWidgetControls);
