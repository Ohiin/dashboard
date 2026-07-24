import { useState } from "react";
import { Sparkles } from "lucide-react";
import Button from "./Button";
import { useUserPrefsStore } from "../store/userPrefsStore";

const STEPS = [
  "Welcome to your blank canvas! \ud83d\udc4b Click the + button to add your first widget.",
  "Drag me anywhere! Grab the bottom-right corner to resize me.",
  "Click the lock icon on any widget to password-protect it.",
  "Everything saves automatically to your browser. Close the tab? No worries, it's all still here.",
];

interface TourGuideProps {
  hasAddedWidget: boolean;
}

export default function TourGuide({ hasAddedWidget }: TourGuideProps) {
  const [step, setStep] = useState(0);
  const setHasVisited = useUserPrefsStore((s) => s.setHasVisited);

  // Step 0 waits for the user to actually add a widget before advancing.
  const effectiveStep = step === 0 && hasAddedWidget ? 1 : step;

  function next() {
    if (effectiveStep >= STEPS.length - 1) {
      setHasVisited(true);
      return;
    }
    setStep(effectiveStep + 1);
  }

  function skip() {
    setHasVisited(true);
  }

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-xs animate-fade-in">
      <div className="rounded-2xl bg-card border border-border shadow-soft p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-cta" />
          <span className="text-xs font-semibold text-accent uppercase tracking-wide">
            Step {effectiveStep + 1} of {STEPS.length}
          </span>
        </div>
        <p className="text-sm text-white leading-relaxed mb-4">{STEPS[effectiveStep]}</p>
        <div className="flex items-center justify-between">
          <button
            onClick={skip}
            className="text-xs text-accent hover:text-white transition-colors duration-150"
          >
            Skip tour
          </button>
          {!(effectiveStep === 0 && !hasAddedWidget) && (
            <Button size="sm" onClick={next}>
              {effectiveStep >= STEPS.length - 1 ? "Got it" : "Next"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
