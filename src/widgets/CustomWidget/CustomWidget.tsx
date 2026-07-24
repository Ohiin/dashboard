import { useState, memo} from "react";
import { Code2 } from "lucide-react";
import { useWidgetStore } from "../../store/widgetStore";
import type { WidgetContentProps } from "../WidgetRegistry";

/**
 * Custom widgets store the user's pasted React/TSX code (or JSON schema) as
 * a string. Executing arbitrary user-authored code safely would require a
 * sandboxed iframe; for this build we render it as an editable reference
 * pane so the content is preserved, inspectable, and editable without
 * eval()'ing untrusted code in the main app context.
 */
function CustomWidget({ widget }: WidgetContentProps) {
  const setCustomCode = useWidgetStore((s) => s.setCustomCode);
  const [code, setCode] = useState(widget.customCode || "");
  const [saved, setSaved] = useState(true);

  function handleChange(v: string) {
    setCode(v);
    setSaved(false);
  }

  function handleSave() {
    setCustomCode(widget.id, code);
    setSaved(true);
  }

  return (
    <div className="flex flex-col h-full text-white text-xs gap-2">
      <div className="flex items-center gap-1.5 text-accent">
        <Code2 size={13} />
        <span>Custom widget — code stored locally</span>
      </div>
      <textarea
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="// Paste your widget code or JSON schema here"
        className="flex-1 min-h-0 resize-none rounded-xl bg-bg border border-border px-2.5 py-2 text-[11px] font-mono outline-none focus:border-accent"
      />
      <button
        onClick={handleSave}
        disabled={saved}
        className="self-end px-3 py-1 rounded-full bg-cta hover:bg-cta-hover disabled:opacity-40 text-white text-[10px] transition-all duration-150"
      >
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}

export default memo(CustomWidget);
