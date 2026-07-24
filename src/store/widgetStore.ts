import { create } from "zustand";
import type { WidgetInstance, WidgetLayout, WidgetType } from "../types";
import { removeLocalStorageKeysWithPrefix } from "../hooks/useLocalStorage";
import { purgeWidgetFiles } from "../utils/db";

const WIDGETS_KEY = "dashboard:widgets";
const LAYOUTS_KEY = "dashboard:layouts";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

interface WidgetStoreState {
  widgets: WidgetInstance[];
  layouts: WidgetLayout[];
  addWidget: (type: WidgetType, label: string, defaultW: number, defaultH: number, minW: number, minH: number, customCode?: string) => string;
  removeWidget: (id: string) => void;
  updateLayout: (layouts: WidgetLayout[]) => void;
  renameWidget: (id: string, title: string) => void;
  setLock: (id: string, lock: WidgetInstance["lock"]) => void;
  setCustomCode: (id: string, code: string) => void;
}

function nextY(layouts: WidgetLayout[]): number {
  if (layouts.length === 0) return 0;
  return Math.max(...layouts.map((l) => l.y + l.h));
}

export const useWidgetStore = create<WidgetStoreState>((set, get) => ({
  widgets: loadJSON<WidgetInstance[]>(WIDGETS_KEY, []),
  layouts: loadJSON<WidgetLayout[]>(LAYOUTS_KEY, []),

  addWidget: (type, label, defaultW, defaultH, minW, minH, customCode) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const widget: WidgetInstance = {
      id,
      type,
      title: label,
      createdAt: Date.now(),
      lock: { locked: false },
      customCode,
    };
    const layout: WidgetLayout = {
      i: id,
      x: 0,
      y: nextY(get().layouts),
      w: defaultW,
      h: defaultH,
      minW,
      minH,
    };
    const widgets = [...get().widgets, widget];
    const layouts = [...get().layouts, layout];
    persist(WIDGETS_KEY, widgets);
    persist(LAYOUTS_KEY, layouts);
    set({ widgets, layouts });
    return id;
  },

  removeWidget: (id) => {
    const widgets = get().widgets.filter((w) => w.id !== id);
    const layouts = get().layouts.filter((l) => l.i !== id);
    persist(WIDGETS_KEY, widgets);
    persist(LAYOUTS_KEY, layouts);
    set({ widgets, layouts });
    // Purge any widget-scoped localStorage keys and IndexedDB blobs.
    removeLocalStorageKeysWithPrefix(`widget:${id}:`);
    purgeWidgetFiles(id).catch(() => {});
  },

  updateLayout: (layouts) => {
    persist(LAYOUTS_KEY, layouts);
    set({ layouts });
  },

  renameWidget: (id, title) => {
    const widgets = get().widgets.map((w) => (w.id === id ? { ...w, title } : w));
    persist(WIDGETS_KEY, widgets);
    set({ widgets });
  },

  setLock: (id, lock) => {
    const widgets = get().widgets.map((w) => (w.id === id ? { ...w, lock } : w));
    persist(WIDGETS_KEY, widgets);
    set({ widgets });
  },

  setCustomCode: (id, customCode) => {
    const widgets = get().widgets.map((w) => (w.id === id ? { ...w, customCode } : w));
    persist(WIDGETS_KEY, widgets);
    set({ widgets });
  },
}));
