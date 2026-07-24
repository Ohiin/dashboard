import { useState, memo} from "react";
import { Plus, X } from "lucide-react";
import { getDaysInMonth, format } from "date-fns";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

interface HabitData {
  habits: string[];
  // key: `${habit}:${day}` -> boolean
  marks: Record<string, boolean>;
}

function HabitTrackerWidget({ widget }: WidgetContentProps) {
  const monthKey = format(new Date(), "yyyy-MM");
  const [data, setData] = useLocalStorage<HabitData>(`widget:${widget.id}:${monthKey}`, {
    habits: [],
    marks: {},
  });
  const [newHabit, setNewHabit] = useState("");
  const daysInMonth = getDaysInMonth(new Date());
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function addHabit() {
    if (!newHabit.trim()) return;
    setData({ ...data, habits: [...data.habits, newHabit.trim()] });
    setNewHabit("");
  }

  function removeHabit(h: string) {
    const marks = { ...data.marks };
    Object.keys(marks).forEach((k) => {
      if (k.startsWith(`${h}:`)) delete marks[k];
    });
    setData({ habits: data.habits.filter((x) => x !== h), marks });
  }

  function toggle(h: string, day: number) {
    const key = `${h}:${day}`;
    setData({ ...data, marks: { ...data.marks, [key]: !data.marks[key] } });
  }

  const totalCells = data.habits.length * daysInMonth;
  const doneCells = Object.values(data.marks).filter(Boolean).length;
  const pct = totalCells ? Math.round((doneCells / totalCells) * 100) : 0;

  return (
    <div className="flex flex-col h-full text-white text-xs gap-2">
      <div className="flex gap-1">
        <input
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
          placeholder="Add a habit..."
          className="flex-1 rounded-xl bg-bg border border-border px-2.5 py-1.5 text-xs outline-none focus:border-accent"
        />
        <button
          onClick={addHabit}
          className="w-7 h-7 rounded-full bg-cta hover:bg-cta-hover flex items-center justify-center shrink-0 transition-all duration-150"
        >
          <Plus size={12} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {data.habits.length === 0 ? (
          <p className="text-accent/60 text-center mt-4">Add a habit to start tracking.</p>
        ) : (
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card text-left pr-2 text-accent font-normal">
                  Habit
                </th>
                {days.map((d) => (
                  <th key={d} className="text-accent font-normal w-4 text-center">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.habits.map((h) => (
                <tr key={h} className="group">
                  <td className="sticky left-0 bg-card pr-2 py-0.5 whitespace-nowrap max-w-[80px] truncate">
                    <div className="flex items-center gap-1">
                      <span className="truncate">{h}</span>
                      <button
                        onClick={() => removeHabit(h)}
                        className="text-accent hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </td>
                  {days.map((d) => {
                    const done = !!data.marks[`${h}:${d}`];
                    return (
                      <td key={d} className="p-0.5">
                        <button
                          onClick={() => toggle(h, d)}
                          className={`w-3.5 h-3.5 rounded transition-all duration-150 ease-in-out ${
                            done ? "bg-green-500" : "bg-red-500/30"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data.habits.length > 0 && (
        <p className="text-accent border-t border-border pt-1.5">
          {pct}% complete this month
        </p>
      )}
    </div>
  );
}

export default memo(HabitTrackerWidget);
