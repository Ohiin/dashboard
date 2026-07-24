import { useCallback, useMemo, useState } from "react";
import { Responsive, WidthProvider, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Plus } from "lucide-react";
import { useWidgetStore } from "./store/widgetStore";
import { useUserPrefsStore } from "./store/userPrefsStore";
import WidgetCard from "./components/WidgetCard";
import AddWidgetModal from "./components/AddWidgetModal";
import TourGuide from "./components/TourGuide";

const ResponsiveGridLayout = WidthProvider(Responsive);

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

export default function App() {
  const widgets = useWidgetStore((s) => s.widgets);
  const layouts = useWidgetStore((s) => s.layouts);
  const updateLayout = useWidgetStore((s) => s.updateLayout);
  const hasVisited = useUserPrefsStore((s) => s.hasVisited);
  const [modalOpen, setModalOpen] = useState(false);
  const [breakpoint, setBreakpoint] = useState("lg");

  const isMobile = breakpoint === "xs" || breakpoint === "xxs";

  const layoutForRGL: Layout[] = useMemo(
    () =>
      layouts.map((l) => ({
        i: l.i,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
        minW: l.minW,
        minH: l.minH,
      })),
    [layouts]
  );

  const handleLayoutChange = useCallback(
    (current: Layout[]) => {
      const merged = current.map((c) => {
        const existing = layouts.find((l) => l.i === c.i);
        return {
          i: c.i,
          x: c.x,
          y: c.y,
          w: c.w,
          h: c.h,
          minW: existing?.minW,
          minH: existing?.minH,
        };
      });
      updateLayout(merged);
    },
    [layouts, updateLayout]
  );

  return (
    <div className="min-h-screen w-full bg-bg">
      {widgets.length === 0 ? (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <p className="text-accent text-sm mb-1">Your blank canvas</p>
            <h1 className="text-white text-2xl font-semibold mb-2">
              Build your own dashboard
            </h1>
            <p className="text-accent text-sm">
              Tap the + button below to add your first widget.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 sm:p-4">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layoutForRGL, md: layoutForRGL, sm: layoutForRGL, xs: layoutForRGL, xxs: layoutForRGL }}
            breakpoints={BREAKPOINTS}
            cols={COLS}
            rowHeight={40}
            margin={[12, 12]}
            isDraggable={!isMobile}
            isResizable={true}
            draggableHandle=".widget-drag-handle"
            onLayoutChange={handleLayoutChange}
            onBreakpointChange={(bp: string) => setBreakpoint(bp)}
            compactType="vertical"
          >
            {widgets.map((w) => (
              <div key={w.id}>
                <WidgetCard widget={w} />
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-cta hover:bg-cta-hover shadow-soft flex items-center justify-center transition-all duration-150 ease-in-out hover:scale-110 active:scale-95"
        aria-label="Add widget"
      >
        <Plus size={24} className="text-white" />
      </button>

      <AddWidgetModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {!hasVisited && <TourGuide hasAddedWidget={widgets.length > 0} />}
    </div>
  );
}
