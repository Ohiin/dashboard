import { memo, useState } from "react";
import { Trash2, GripVertical } from "lucide-react";
import type { WidgetInstance } from "../types";
import { WIDGET_COMPONENTS } from "../widgets/WidgetRegistry";
import { useWidgetStore } from "../store/widgetStore";
import { useLockIcon, LockedOverlay } from "./PasswordLock";

interface WidgetCardProps {
  widget: WidgetInstance;
}

function WidgetCard({ widget }: WidgetCardProps) {
  const removeWidget = useWidgetStore((s) => s.removeWidget);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [unlockedOnce, setUnlockedOnce] = useState(false);
  const { icon: lockIcon, promptModal } = useLockIcon(widget);

  const Content = WIDGET_COMPONENTS[widget.type];
  const isLocked = widget.lock.locked && !unlockedOnce;

  // Helper to stop drag events from propagating to react-grid-layout
  const stopDrag = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="h-full w-full rounded-2xl bg-card border border-border shadow-soft flex flex-col overflow-hidden relative snap">
      <div className="widget-drag-handle flex items-center gap-2 px-3 py-2 border-b border-border cursor-move select-none">
        <GripVertical size={14} className="text-accent shrink-0" />
        <span className="text-sm font-semibold text-white truncate flex-1">{widget.title}</span>
        <div className="flex items-center gap-1 shrink-0">
          {lockIcon}
          <button
            onMouseDown={stopDrag}  // 👈 STOPS THE DRAG
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
            className="text-accent hover:text-red-400 transition-colors duration-150 rounded-full p-1 hover:bg-white/10"
            title="Delete widget"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative p-3 overflow-auto">
        {isLocked ? (
          <LockedOverlay widget={widget} onUnlock={() => setUnlockedOnce(true)} />
        ) : (
          <Content widget={widget} />
        )}
      </div>

      {promptModal}

      {confirmDelete && (
        <div
          className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmDelete(false);
          }}
        >
          <p className="text-white text-sm text-center">Delete this widget and its data?</p>
          <div className="flex gap-2">
            <button
              onMouseDown={stopDrag}  // 👈 STOPS THE DRAG
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
              className="px-3 py-1.5 text-sm rounded-full border border-border text-accent hover:bg-white/5 transition-all duration-150"
            >
              Cancel
            </button>
            <button
              onMouseDown={stopDrag}  // 👈 STOPS THE DRAG
              onClick={(e) => {
                e.stopPropagation();
                removeWidget(widget.id);
              }}
              className="px-3 py-1.5 text-sm rounded-full bg-cta hover:bg-cta-hover text-white transition-all duration-150"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(WidgetCard);
