import { useEffect, useState, memo} from "react";
import { Plus, Play, Square, X } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

interface Session {
  start: number;
  end: number;
}

interface Project {
  id: string;
  name: string;
  activeStart: number | null; // timestamp if clocked in
  sessions: Session[]; // completed sessions
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function isToday(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function TimeTrackerWidget({ widget }: WidgetContentProps) {
  const [projects, setProjects] = useLocalStorage<Project[]>(`widget:${widget.id}:projects`, []);
  const [newProject, setNewProject] = useState("");
  const [, setTick] = useState(0);

  // re-render every 30s so running timers stay live
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);

  function addProject() {
    if (!newProject.trim()) return;
    setProjects([
      ...projects,
      { id: `${Date.now()}`, name: newProject.trim(), activeStart: null, sessions: [] },
    ]);
    setNewProject("");
  }

  function clockIn(id: string) {
    setProjects(projects.map((p) => (p.id === id ? { ...p, activeStart: Date.now() } : p)));
  }

  function clockOut(id: string) {
    setProjects(
      projects.map((p) => {
        if (p.id !== id || p.activeStart === null) return p;
        return {
          ...p,
          activeStart: null,
          sessions: [...p.sessions, { start: p.activeStart, end: Date.now() }],
        };
      })
    );
  }

  function removeProject(id: string) {
    setProjects(projects.filter((p) => p.id !== id));
  }

  function todayMinutes(p: Project) {
    const completed = p.sessions
      .filter((s) => isToday(s.start))
      .reduce((sum, s) => sum + (s.end - s.start) / 60000, 0);
    const active =
      p.activeStart && isToday(p.activeStart) ? (Date.now() - p.activeStart) / 60000 : 0;
    return Math.round(completed + active);
  }

  return (
    <div className="flex flex-col h-full text-white text-xs gap-2" key={todayKey()}>
      <div className="flex gap-1">
        <input
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addProject()}
          placeholder="Add a project..."
          className="flex-1 rounded-xl bg-bg border border-border px-2.5 py-1.5 text-xs outline-none focus:border-accent"
        />
        <button
          onClick={addProject}
          className="w-7 h-7 rounded-full bg-cta hover:bg-cta-hover flex items-center justify-center shrink-0 transition-all duration-150"
        >
          <Plus size={12} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-1.5">
        {projects.length === 0 && (
          <p className="text-accent/60 text-center mt-4">Add a project to start tracking.</p>
        )}
        {projects.map((p) => {
          const isActive = p.activeStart !== null;
          return (
            <div
              key={p.id}
              className="rounded-xl bg-bg border border-border px-2.5 py-1.5 flex items-center gap-2 group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-accent text-[10px]">{todayMinutes(p)} min today</p>
              </div>
              {isActive ? (
                <button
                  onClick={() => clockOut(p.id)}
                  className="px-2.5 py-1 rounded-full bg-cta hover:bg-cta-hover text-white text-[10px] flex items-center gap-1 transition-all duration-150"
                >
                  <Square size={10} /> Out
                </button>
              ) : (
                <button
                  onClick={() => clockIn(p.id)}
                  className="px-2.5 py-1 rounded-full border border-border text-accent hover:bg-white/5 text-[10px] flex items-center gap-1 transition-all duration-150"
                >
                  <Play size={10} /> In
                </button>
              )}
              <button
                onClick={() => removeProject(p.id)}
                className="text-accent hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TimeTrackerWidget);
