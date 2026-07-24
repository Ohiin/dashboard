import type { ComponentType } from "react";
import type { WidgetDefaultConfig, WidgetInstance, WidgetType } from "../types";

import BookmarkWidget from "./BookmarkWidget/BookmarkWidget";
import CalendarWidget from "./CalendarWidget/CalendarWidget";
import TimerWidget from "./TimerWidget/TimerWidget";
import NotepadWidget from "./NotepadWidget/NotepadWidget";
import TodoWidget from "./TodoWidget/TodoWidget";
import ScheduleWidget from "./ScheduleWidget/ScheduleWidget";
import MoneyTrackerWidget from "./MoneyTrackerWidget/MoneyTrackerWidget";
import MultiGoalWidget from "./MultiGoalWidget/MultiGoalWidget";
import HabitTrackerWidget from "./HabitTrackerWidget/HabitTrackerWidget";
import ExpenseCalculatorWidget from "./ExpenseCalculatorWidget/ExpenseCalculatorWidget";
import ClockWidget from "./ClockWidget/ClockWidget";
import TimeTrackerWidget from "./TimeTrackerWidget/TimeTrackerWidget";
import CustomWidget from "./CustomWidget/CustomWidget";

export interface WidgetContentProps {
  widget: WidgetInstance;
}

export const WIDGET_COMPONENTS: Record<WidgetType, ComponentType<WidgetContentProps>> = {
  bookmark: BookmarkWidget,
  calendar: CalendarWidget,
  timer: TimerWidget,
  notepad: NotepadWidget,
  todo: TodoWidget,
  schedule: ScheduleWidget,
  moneyGoal: MoneyTrackerWidget,
  multiGoal: MultiGoalWidget,
  habitTracker: HabitTrackerWidget,
  expenseCalculator: ExpenseCalculatorWidget,
  clock: ClockWidget,
  timeTracker: TimeTrackerWidget,
  custom: CustomWidget,
};

export const WIDGET_REGISTRY: WidgetDefaultConfig[] = [
  {
  type: 'bookmark',
  label: 'Bookmarks',
  description: 'Organize links in folders with icons',
  defaultW: 4,
  defaultH: 5,
  minW: 3,
  minH: 4,
  },
  {
    type: "calendar",
    label: "Calendar",
    description: "Monthly grid with per-date notes",
    defaultW: 4,
    defaultH: 6,
    minW: 3,
    minH: 4,
  },
  {
    type: "timer",
    label: "Timer (Pomodoro)",
    description: "Circular focus / break timer",
    defaultW: 3,
    defaultH: 5,
    minW: 2,
    minH: 4,
  },
  {
    type: "notepad",
    label: "Notepad",
    description: "Auto-saving text notes",
    defaultW: 3,
    defaultH: 5,
    minW: 2,
    minH: 3,
  },
  {
    type: "todo",
    label: "To-Do List",
    description: "Tasks with filters",
    defaultW: 3,
    defaultH: 6,
    minW: 2,
    minH: 4,
  },
  {
    type: "schedule",
    label: "Schedule",
    description: "Daily vertical timeline",
    defaultW: 3,
    defaultH: 8,
    minW: 2,
    minH: 5,
  },
  {
    type: "moneyGoal",
    label: "Money Tracker (Single Goal)",
    description: "One savings goal with progress",
    defaultW: 3,
    defaultH: 4,
    minW: 2,
    minH: 3,
  },
  {
    type: "multiGoal",
    label: "Money Tracker (Multi-Goal)",
    description: "Unlimited savings goal cards",
    defaultW: 4,
    defaultH: 6,
    minW: 3,
    minH: 4,
  },
  {
    type: "habitTracker",
    label: "Monthly Habit Tracker",
    description: "Habit grid across the month",
    defaultW: 6,
    defaultH: 6,
    minW: 4,
    minH: 4,
  },
  {
    type: "expenseCalculator",
    label: "Expenditure Calculator",
    description: "Calculator with history",
    defaultW: 3,
    defaultH: 6,
    minW: 2,
    minH: 5,
  },
  {
    type: "clock",
    label: "Clock",
    description: "Analog + digital live clock",
    defaultW: 3,
    defaultH: 5,
    minW: 2,
    minH: 4,
  },
  {
    type: "timeTracker",
    label: "Time Tracker",
    description: "Clock-in / clock-out per project",
    defaultW: 4,
    defaultH: 6,
    minW: 3,
    minH: 4,
  },
  {
    type: "custom",
    label: "+ Add Custom Widget",
    description: "Paste your own widget code",
    defaultW: 3,
    defaultH: 5,
    minW: 2,
    minH: 3,
  },
];

export function getWidgetConfig(type: WidgetType): WidgetDefaultConfig {
  const config = WIDGET_REGISTRY.find((w) => w.type === type);
  if (!config) throw new Error(`Unknown widget type: ${type}`);
  return config;
}
