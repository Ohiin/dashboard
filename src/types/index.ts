export type WidgetType =
  | "calendar"
  | "timer"
  | "notepad"
  | "todo"
  | "schedule"
  | "moneyGoal"
  | "multiGoal"
  | "habitTracker"
  | "expenseCalculator"
  | "clock"
  | "timeTracker"
  | "bookmark"
  | "custom"
  | "search";

export interface WidgetLayout {
  i: string; // widget instance id
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface WidgetLock {
  locked: boolean;
  salt?: string; // base64
  hash?: string; // base64
}

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  title: string;
  createdAt: number;
  lock: WidgetLock;
  customCode?: string; // for "custom" widget type
}

export interface WidgetDefaultConfig {
  type: WidgetType;
  label: string;
  description: string;
  defaultW: number;
  defaultH: number;
  minW: number;
  minH: number;
}
