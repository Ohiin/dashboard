import { useState, memo} from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

const BUTTONS = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"];

function ExpenseCalculatorWidget({ widget }: WidgetContentProps) {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useLocalStorage<string[]>(`widget:${widget.id}:history`, []);

  function handlePress(btn: string) {
    if (btn === "=") {
      try {
        // eslint-disable-next-line no-new-func
        const result = Function(`"use strict"; return (${expression || display})`)();
        const rounded = Math.round(result * 100000) / 100000;
        const entry = `${expression || display} = ${rounded}`;
        setHistory([entry, ...history].slice(0, 20));
        setDisplay(String(rounded));
        setExpression(String(rounded));
      } catch {
        setDisplay("Error");
        setExpression("");
      }
      return;
    }

    if (["+", "-", "*", "/"].includes(btn)) {
      setExpression((expression || display) + btn);
      setDisplay(btn);
      return;
    }

    if (display === "0" || display === "Error" || ["+", "-", "*", "/"].includes(display)) {
      setDisplay(btn);
      setExpression((expression === display ? "" : expression) + btn);
    } else {
      setDisplay(display + btn);
      setExpression(expression + btn);
    }
  }

  function clear() {
    setDisplay("0");
    setExpression("");
  }

  return (
    <div className="flex flex-col h-full text-white text-sm gap-2">
      <div className="rounded-xl bg-bg border border-border px-3 py-2 text-right text-lg font-mono truncate">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        <button
          onClick={clear}
          className="col-span-4 rounded-xl border border-border text-accent hover:bg-white/5 py-1.5 text-xs transition-all duration-150"
        >
          Clear
        </button>
        {BUTTONS.map((b) => (
          <button
            key={b}
            onClick={() => handlePress(b)}
            className={`rounded-xl py-2 text-sm transition-all duration-150 ease-in-out active:scale-95 ${
              ["/", "*", "-", "+", "="].includes(b)
                ? "bg-cta hover:bg-cta-hover text-white"
                : "bg-bg border border-border hover:bg-white/5"
            }`}
          >
            {b}
          </button>
        ))}
      </div>
      <div className="border-t border-border pt-1.5 max-h-16 overflow-auto text-[10px] text-accent">
        {history.length === 0 ? (
          <p className="text-center text-accent/50">No history yet.</p>
        ) : (
          history.map((h, i) => <div key={i}>{h}</div>)
        )}
      </div>
    </div>
  );
}

export default memo(ExpenseCalculatorWidget);
