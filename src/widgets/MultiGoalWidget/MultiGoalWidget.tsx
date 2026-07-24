import { useState, memo} from "react";
import { Plus, X } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

function MultiGoalWidget({ widget }: WidgetContentProps) {
  const [goals, setGoals] = useLocalStorage<Goal[]>(`widget:${widget.id}:goals`, []);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");

  function createGoal() {
    const t = parseFloat(target);
    if (!name.trim() || !t || t <= 0) return;
    setGoals([...goals, { id: `${Date.now()}`, name: name.trim(), target: t, saved: 0 }]);
    setName("");
    setTarget("");
    setShowForm(false);
  }

  function addSavings(id: string) {
    const a = parseFloat(addAmount);
    if (!a || a <= 0) return;
    setGoals(goals.map((g) => (g.id === id ? { ...g, saved: g.saved + a } : g)));
    setAddAmount("");
    setAddingTo(null);
  }

  function removeGoal(id: string) {
    setGoals(goals.filter((g) => g.id !== id));
  }

  return (
    <div className="flex flex-col h-full text-white text-sm gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-accent uppercase tracking-wide">Goals</span>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="w-7 h-7 rounded-full bg-cta hover:bg-cta-hover flex items-center justify-center transition-all duration-150"
        >
          <Plus size={13} />
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl bg-bg border border-border p-2 flex flex-col gap-1.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goal name"
            className="rounded-lg bg-card border border-border px-2 py-1.5 text-xs outline-none focus:border-accent"
          />
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            type="number"
            placeholder="Target amount"
            className="rounded-lg bg-card border border-border px-2 py-1.5 text-xs outline-none focus:border-accent"
          />
          <button
            onClick={createGoal}
            className="rounded-full bg-cta hover:bg-cta-hover text-white py-1.5 text-xs transition-all duration-150"
          >
            Add Goal
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-2">
        {goals.length === 0 && !showForm && (
          <p className="text-accent/60 text-xs text-center mt-4">No goals yet.</p>
        )}
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          return (
            <div key={g.id} className="rounded-xl bg-bg border border-border p-2.5 group">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-xs truncate">{g.name}</span>
                <button
                  onClick={() => removeGoal(g.id)}
                  className="text-accent hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="w-full h-2 rounded-full bg-card border border-border overflow-hidden mb-1">
                <div
                  className="h-full bg-cta transition-all duration-150 ease-in-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-accent mb-1.5">
                ${g.saved.toLocaleString()} / ${g.target.toLocaleString()} ({pct}%)
              </p>
              {addingTo === g.id ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSavings(g.id)}
                    type="number"
                    placeholder="Amount"
                    className="flex-1 rounded-lg bg-card border border-border px-2 py-1 text-xs outline-none focus:border-accent"
                  />
                  <button
                    onClick={() => addSavings(g.id)}
                    className="px-2 rounded-full bg-cta hover:bg-cta-hover text-white text-[10px]"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTo(g.id)}
                  className="text-[10px] text-accent hover:text-white transition-colors duration-150"
                >
                  + Add savings
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(MultiGoalWidget);
