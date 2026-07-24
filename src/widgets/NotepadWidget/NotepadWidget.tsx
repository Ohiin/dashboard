import { memo } from "react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

function NotepadWidget({ widget }: WidgetContentProps) {
  const [text, setText] = useLocalStorage<string>(`widget:${widget.id}:text`, "");

  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="Start typing... it saves automatically."
      className="w-full h-full resize-none bg-transparent text-white text-sm outline-none placeholder:text-accent/50 leading-relaxed"
    />
  );
}

export default memo(NotepadWidget);
