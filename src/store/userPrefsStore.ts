import { create } from "zustand";

const HAS_VISITED_KEY = "hasVisited";

interface UserPrefsState {
  hasVisited: boolean;
  setHasVisited: (v: boolean) => void;
}

export const useUserPrefsStore = create<UserPrefsState>((set) => ({
  hasVisited: localStorage.getItem(HAS_VISITED_KEY) === "true",
  setHasVisited: (v) => {
    try {
      localStorage.setItem(HAS_VISITED_KEY, v ? "true" : "false");
    } catch {
      /* ignore */
    }
    set({ hasVisited: v });
  },
}));
