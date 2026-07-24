import { useState, memo} from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

interface Goal {
  name: string;
  target: number;
  saved: number;
}

function MoneyTrackerWidget({ widget }: WidgetContentProps) {
  const [goal, setGoal] = useLocalStorage<Goal | null>(`widget:${widget.id}:goal`, null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [addAmount, setAddAmount] = useState("");

  function createGoal() {
    const t = parseFloat(target);
    if (!name.trim() || !t || t <= 0) return;
    setGoal({ name: name.trim(), target: t, saved: 0 });
    setName("");
    setTarget("");
  }

  function addSavings() {
    if (!goal) return;
    const a = parseFloat(addAmount);
    if (!a || a <= 0) return;
    setGoal({ ...goal, saved: goal.saved + a });
    setAddAmount("");
  }

  if (!goal) {
    return (
      <div className="flex flex-col h-full justify-center gap-2 text-white text-sm">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Goal name"
          className="rounded-xl bg-bg border border-border px-3 py-2 outline-none focus:border-accent"
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          type="number"
          placeholder="Target amount"
          className="rounded-xl bg-bg border border-border px-3 py-2 outline-none focus:border-accent"
        />
        <button
          onClick={createGoal}
          className="rounded-full bg-cta hover:bg-cta-hover text-white py-2 transition-all duration-150"
        >
          Add Goal
        </button>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));

  return (
    <div className="flex flex-col h-full justify-center gap-3 text-white text-sm">
      <div>
        <p className="font-semibold">{goal.name}</p>
        <p className="text-accent text-xs">
          ${goal.saved.toLocaleString()} / ${goal.target.toLocaleString()}
        </p>
      </div>
      <div className="w-full h-2.5 rounded-full bg-bg border border-border overflow-hidden">
        <div
          className="h-full bg-cta transition-all duration-150 ease-in-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-accent">{pct}% complete</p>
      <div className="flex gap-1">
        <input
          value={addAmount}
          onChange={(e) => setAddAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSavings()}
          type="number"
          placeholder="Add savings"
          className="flex-1 rounded-xl bg-bg border border-border px-2.5 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={addSavings}
          className="px-3 rounded-full bg-cta hover:bg-cta-hover text-white text-xs transition-all duration-150"
        >
          Add
        </button>
      </div>
      <button
        onClick={() => setGoal(null)}
        className="text-xs text-accent hover:text-white self-start transition-colors duration-150"
      >
        Reset goal
      </button>
    </div>
  );
}

export default memo(MoneyTrackerWidget);
