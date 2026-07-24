import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { WIDGET_REGISTRY } from "../widgets/WidgetRegistry";
import { useWidgetStore } from "../store/widgetStore";
import type { WidgetType } from "../types";
import {
  Calendar,
  Timer,
  StickyNote,
  ListTodo,
  Clock4,
  PiggyBank,
  Coins,
  CheckSquare,
  Calculator,
  Clock,
  Hourglass,
  Code2,
} from "lucide-react";

const ICONS: Record<WidgetType, React.ComponentType<{ size?: number }>> = {
  calendar: Calendar,
  timer: Timer,
  notepad: StickyNote,
  todo: ListTodo,
  schedule: Clock4,
  moneyGoal: PiggyBank,
  multiGoal: Coins,
  habitTracker: CheckSquare,
  expenseCalculator: Calculator,
  clock: Clock,
  timeTracker: Hourglass,
  custom: Code2,
};

interface AddWidgetModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddWidgetModal({ open, onClose }: AddWidgetModalProps) {
  const addWidget = useWidgetStore((s) => s.addWidget);
  const [customMode, setCustomMode] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [customName, setCustomName] = useState("");

  function handleAdd(type: WidgetType) {
    if (type === "custom") {
      setCustomMode(true);
      return;
    }
    const config = WIDGET_REGISTRY.find((w) => w.type === type)!;
    addWidget(type, config.label, config.defaultW, config.defaultH, config.minW, config.minH);
    onClose();
  }

  function handleAddCustom() {
    const config = WIDGET_REGISTRY.find((w) => w.type === "custom")!;
    addWidget(
      "custom",
      customName.trim() || "Custom Widget",
      config.defaultW,
      config.defaultH,
      config.minW,
      config.minH,
      customCode
    );
    setCustomMode(false);
    setCustomCode("");
    setCustomName("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setCustomMode(false);
        onClose();
      }}
      title={customMode ? "Add Custom Widget" : "Add Widget"}
      maxWidth="max-w-lg"
    >
      {!customMode ? (
        <div className="grid grid-cols-2 gap-3">
          {WIDGET_REGISTRY.map((w) => {
            const Icon = ICONS[w.type];
            return (
              <button
                key={w.type}
                onClick={() => handleAdd(w.type)}
                className="text-left rounded-2xl border border-border bg-bg hover:border-cta hover:bg-white/5 transition-all duration-150 ease-in-out p-4 flex flex-col gap-2"
              >
                <Icon size={20} />
                <span className="text-sm font-semibold text-white">{w.label}</span>
                <span className="text-xs text-accent leading-snug">{w.description}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-accent leading-relaxed">
            Paste raw React/TSX code or a JSON schema describing your widget. It will be stored
            locally and rendered in a placeholder editor pane until you wire up a full dynamic
            renderer.
          </p>
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Widget name"
            className="w-full rounded-xl bg-bg border border-border px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
          <textarea
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="// Paste your widget code or JSON schema here"
            rows={8}
            className="w-full rounded-xl bg-bg border border-border px-3 py-2 text-sm text-white outline-none focus:border-accent font-mono resize-none"
          />
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setCustomMode(false)}>
              Back
            </Button>
            <Button className="flex-1" onClick={handleAddCustom}>
              Add Widget
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
