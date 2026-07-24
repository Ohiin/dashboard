import { memo, useState } from "react";
import {
  Folder,
  FolderOpen,
  Plus,
  Link as LinkIcon,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

interface BookmarkLink {
  name: string;
  url: string;
}

interface BookmarkFolder {
  name: string;
  links: BookmarkLink[];
}

interface BookmarkData {
  folders: BookmarkFolder[];
}

function BookmarkWidget({ widget }: WidgetContentProps) {
  const [data, setData] = useLocalStorage<BookmarkData>(
    `widget:${widget.id}:bookmarks`,
    { folders: [] }
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [newFolderName, setNewFolderName] = useState("");
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [activeFolderIndex, setActiveFolderIndex] = useState<number | null>(null);

  // --- Folder Actions ---
  const addFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    setData((prev) => ({
      folders: [...prev.folders, { name, links: [] }],
    }));
    setNewFolderName("");
  };

  const deleteFolder = (index: number) => {
    setData((prev) => ({
      folders: prev.folders.filter((_, i) => i !== index),
    }));
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    if (activeFolderIndex === index) setActiveFolderIndex(null);
  };

  const toggleFolder = (index: number) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // --- Link Actions ---
  const addLink = (folderIndex: number) => {
    const name = newLinkName.trim();
    const url = newLinkUrl.trim();
    if (!name || !url) return;
    const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
    setData((prev) => {
      const newFolders = [...prev.folders];
      newFolders[folderIndex].links.push({ name, url: finalUrl });
      return { folders: newFolders };
    });
    setNewLinkName("");
    setNewLinkUrl("");
    setActiveFolderIndex(null);
  };

  const deleteLink = (folderIndex: number, linkIndex: number) => {
    setData((prev) => {
      const newFolders = [...prev.folders];
      newFolders[folderIndex].links = newFolders[folderIndex].links.filter(
        (_, i) => i !== linkIndex
      );
      return { folders: newFolders };
    });
  };

  // --- Render ---
  return (
    <div className="flex flex-col h-full text-white text-sm gap-2 overflow-y-auto">
      {/* Add Folder Input */}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addFolder()}
          placeholder="New folder name..."
          className="flex-1 rounded-xl bg-bg border border-border px-2.5 py-1.5 text-sm outline-none focus:border-accent placeholder:text-accent/60"
        />
        <button
          onClick={addFolder}
          className="shrink-0 bg-cta hover:bg-cta-hover text-white rounded-full px-3 py-1.5 text-sm transition-all duration-150 flex items-center gap-1"
        >
          <Plus size={14} /> Folder
        </button>
      </div>

      {/* Folder List */}
      {data.folders.length === 0 ? (
        <div className="text-center text-accent/60 text-xs py-4">
          No folders yet. Create one above!
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
          {data.folders.map((folder, folderIdx) => {
            const isExpanded = expandedFolders.has(folderIdx);
            const isAddingLink = activeFolderIndex === folderIdx;

            return (
              <div
                key={folderIdx}
                className="rounded-xl bg-bg border border-border overflow-hidden"
              >
                {/* Folder Header */}
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors duration-150"
                  onClick={() => toggleFolder(folderIdx)}
                >
                  {isExpanded ? (
                    <FolderOpen size={16} className="text-cta shrink-0" />
                  ) : (
                    <Folder size={16} className="text-accent shrink-0" />
                  )}
                  <span className="text-sm text-white flex-1 truncate">
                    {folder.name}
                    <span className="text-accent/60 ml-1 text-xs">
                      ({folder.links.length})
                    </span>
                  </span>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folderIdx);
                    }}
                    className="text-accent/60 hover:text-red-400 transition-colors duration-150 p-1 rounded hover:bg-white/10"
                  >
                    <Trash2 size={14} />
                  </button>
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-accent shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-accent shrink-0" />
                  )}
                </div>

                {/* Folder Content (Expanded) */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-border/50">
                    {/* Add Link Input */}
                    {isAddingLink ? (
                      <div className="flex flex-col gap-1.5 mb-2">
                        <input
                          type="text"
                          value={newLinkName}
                          onChange={(e) => setNewLinkName(e.target.value)}
                          placeholder="Link name (e.g., Google)"
                          className="w-full rounded-xl bg-black/30 text-white text-sm px-2.5 py-1.5 border border-border focus:outline-none focus:border-accent placeholder:text-accent/60"
                          autoFocus
                        />
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addLink(folderIdx)}
                            placeholder="URL (e.g., google.com)"
                            className="flex-1 rounded-xl bg-black/30 text-white text-sm px-2.5 py-1.5 border border-border focus:outline-none focus:border-accent placeholder:text-accent/60"
                          />
                          <button
                            onClick={() => addLink(folderIdx)}
                            className="bg-cta hover:bg-cta-hover text-white rounded-full px-3 py-1.5 text-sm transition-all duration-150"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setActiveFolderIndex(null);
                              setNewLinkName("");
                              setNewLinkUrl("");
                            }}
                            className="text-accent/60 hover:text-red-400 transition-colors duration-150 p-1.5 rounded hover:bg-white/10"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveFolderIndex(folderIdx)}
                        className="w-full text-left text-accent/70 hover:text-white text-xs py-1.5 px-2 rounded-lg border border-dashed border-border hover:border-cta/50 transition-all duration-150 flex items-center gap-1.5"
                      >
                        <Plus size={12} /> Add link
                      </button>
                    )}

                    {/* Link List */}
                    {folder.links.length === 0 && !isAddingLink && (
                      <div className="text-accent/40 text-xs py-1">No links yet.</div>
                    )}
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {folder.links.map((link, linkIdx) => (
                        <div
                          key={linkIdx}
                          className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-150"
                        >
                          <LinkIcon size={12} className="text-accent/60 shrink-0" />
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white/90 hover:text-cta hover:underline truncate flex-1 transition-colors duration-150"
                          >
                            {link.name}
                          </a>
                          <button
                            onClick={() => deleteLink(folderIdx, linkIdx)}
                            className="text-accent/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150 p-0.5 rounded hover:bg-white/10"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(BookmarkWidget);
