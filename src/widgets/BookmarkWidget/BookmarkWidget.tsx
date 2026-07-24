import { useState, memo} from "react";
import { Plus, X } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

type Filter = "all" | "active" | "completed";

function TodoWidget({ widget }: WidgetContentProps) {
  const [tasks, setTasks] = useLocalStorage<Task[]>(`widget:${widget.id}:tasks`, []);
  const [filter, setFilter] = useLocalStorage<Filter>(`widget:${widget.id}:filter`, "all");
  const [draft, setDraft] = useState("");

  function addTask() {
    if (!draft.trim()) return;
    setTasks([...tasks, { id: `${Date.now()}`, text: draft.trim(), done: false }]);
    setDraft("");
  }

  function toggle(id: string) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  const visible = tasks.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );

  return (
    <div className="flex flex-col h-full text-white text-sm gap-2">
      <div className="flex gap-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task..."
          className="flex-1 rounded-xl bg-bg border border-border px-2.5 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          onClick={addTask}
          className="w-8 h-8 rounded-full bg-cta hover:bg-cta-hover flex items-center justify-center shrink-0 transition-all duration-150"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex gap-1 text-xs">
        {(["all", "active", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-full border transition-all duration-150 capitalize ${
              filter === f
                ? "bg-cta border-cta text-white"
                : "border-border text-accent hover:bg-white/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-1">
        {visible.length === 0 && (
          <p className="text-accent/60 text-xs text-center mt-4">No tasks here.</p>
        )}
        {visible.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 rounded-xl bg-bg border border-border px-2.5 py-1.5 group"
          >
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t.id)}
              className="accent-cta w-3.5 h-3.5 shrink-0"
            />
            <span
              className={`flex-1 text-sm truncate ${
                t.done ? "line-through text-accent/60" : "text-white"
              }`}
            >
              {t.text}
            </span>
            <button
              onClick={() => remove(t.id)}
              className="text-accent hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(TodoWidget);
