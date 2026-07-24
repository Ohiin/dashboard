import { memo, useState, useEffect, useRef } from "react";
import { Search, Globe, YouTube, Book, GitHub, ChevronDown, X } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

interface SearchEngine {
  id: string;
  name: string;
  icon: React.ReactNode;
  searchUrl: (query: string) => string;
  placeholder: string;
}

const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: "google",
    name: "Google",
    icon: <Globe size={14} />,
    searchUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    placeholder: "Search Google...",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: <YouTube size={14} />,
    searchUrl: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    placeholder: "Search YouTube...",
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    icon: <Book size={14} />,
    searchUrl: (q) => `https://en.wikipedia.org/wiki/${encodeURIComponent(q.replace(/ /g, "_"))}`,
    placeholder: "Search Wikipedia...",
  },
  {
    id: "github",
    name: "GitHub",
    icon: <GitHub size={14} />,
    searchUrl: (q) => `https://github.com/search?q=${encodeURIComponent(q)}`,
    placeholder: "Search GitHub...",
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    icon: <Search size={14} />,
    searchUrl: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    placeholder: "Search DuckDuckGo...",
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: <Globe size={14} />,
    searchUrl: (q) => `https://www.reddit.com/search/?q=${encodeURIComponent(q)}`,
    placeholder: "Search Reddit...",
  },
];

function SearchWidget({ widget }: WidgetContentProps) {
  const [query, setQuery] = useLocalStorage<string>(
    `widget:${widget.id}:query`,
    ""
  );
  const [engineId, setEngineId] = useLocalStorage<string>(
    `widget:${widget.id}:engine`,
    "google"
  );
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentEngine = SEARCH_ENGINES.find((e) => e.id === engineId) || SEARCH_ENGINES[0];

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const url = currentEngine.searchUrl(query.trim());
    window.open(url, "_blank");
  };

  const handleEngineSelect = (id: string) => {
    setEngineId(id);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full justify-center gap-3">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center rounded-xl bg-bg border border-border focus-within:border-cta transition-all duration-150 overflow-hidden">
          {/* Engine Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-accent hover:text-white transition-colors duration-150 border-r border-border hover:bg-white/5"
            >
              {currentEngine.icon}
              <span className="hidden sm:inline">{currentEngine.name}</span>
              <ChevronDown size={12} className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute left-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-soft overflow-hidden z-10">
                {SEARCH_ENGINES.map((engine) => (
                  <button
                    key={engine.id}
                    onClick={() => handleEngineSelect(engine.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors duration-150 ${
                      engine.id === engineId ? "text-cta bg-white/5" : "text-white"
                    }`}
                  >
                    {engine.icon}
                    {engine.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={currentEngine.placeholder}
            className="flex-1 bg-transparent text-white text-sm px-3 py-2 outline-none placeholder:text-accent/50 min-w-0"
            autoFocus={false}
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-accent/60 hover:text-white p-1.5 transition-colors duration-150"
            >
              <X size={14} />
            </button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="bg-cta hover:bg-cta-hover text-white px-3 py-2 transition-colors duration-150 flex items-center gap-1"
          >
            <Search size={16} />
          </button>
        </div>
      </form>

      {/* Keyboard shortcut hint */}
      <div className="text-center text-[10px] text-accent/40">
        Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-accent/60 font-mono text-[10px]">Ctrl+K</kbd> to focus search
      </div>
    </div>
  );
}

export default memo(SearchWidget);
