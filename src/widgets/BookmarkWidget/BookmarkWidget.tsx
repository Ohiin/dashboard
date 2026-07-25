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
  LayoutGrid,
  List,
  Globe,
} from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { WidgetContentProps } from "../WidgetRegistry";

interface BookmarkLink {
  id: string;
  name: string;
  url: string;
  description?: string;
}

interface BookmarkFolder {
  id: string;
  name: string;
  links: BookmarkLink[];
}

interface BookmarkData {
  standaloneLinks: BookmarkLink[];
  folders: BookmarkFolder[];
}

// Helper to get favicon URL
const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return "";
  }
};

function BookmarkWidget({ widget }: WidgetContentProps) {
  const [data, setData] = useLocalStorage<BookmarkData>(
    `widget:${widget.id}:bookmarks`,
    { standaloneLinks: [], folders: [] }
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [newFolderName, setNewFolderName] = useState("");
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkDesc, setNewLinkDesc] = useState("");
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [showAddStandalone, setShowAddStandalone] = useState(false);

  // Generate unique ID
  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // --- Folder Actions ---
  const addFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    setData((prev) => ({
      ...prev,
      folders: [...prev.folders, { id: genId(), name, links: [] }],
    }));
    setNewFolderName("");
    // Auto-expand new folder
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      // We'll expand it after creation - need the ID
      return newSet;
    });
  };

  const deleteFolder = (id: string) => {
    setData((prev) => ({
      ...prev,
      folders: prev.folders.filter((f) => f.id !== id),
    }));
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    if (activeFolderId === id) setActiveFolderId(null);
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // --- Standalone Link Actions ---
  const addStandaloneLink = () => {
    const name = newLinkName.trim();
    const url = newLinkUrl.trim();
    if (!name || !url) return;
    const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
    setData((prev) => ({
      ...prev,
      standaloneLinks: [
        ...prev.standaloneLinks,
        { id: genId(), name, url: finalUrl, description: newLinkDesc.trim() || undefined },
      ],
    }));
    setNewLinkName("");
    setNewLinkUrl("");
    setNewLinkDesc("");
    setShowAddStandalone(false);
  };

  const deleteStandaloneLink = (id: string) => {
    setData((prev) => ({
      ...prev,
      standaloneLinks: prev.standaloneLinks.filter((l) => l.id !== id),
    }));
  };

  // --- Folder Link Actions ---
  const addLinkToFolder = (folderId: string) => {
    const name = newLinkName.trim();
    const url = newLinkUrl.trim();
    if (!name || !url) return;
    const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
    setData((prev) => ({
      ...prev,
      folders: prev.folders.map((f) =>
        f.id === folderId
          ? {
              ...f,
              links: [
                ...f.links,
                { id: genId(), name, url: finalUrl, description: newLinkDesc.trim() || undefined },
              ],
            }
          : f
      ),
    }));
    setNewLinkName("");
    setNewLinkUrl("");
    setNewLinkDesc("");
    setActiveFolderId(null);
  };

  const deleteFolderLink = (folderId: string, linkId: string) => {
    setData((prev) => ({
      ...prev,
      folders: prev.folders.map((f) =>
        f.id === folderId
          ? { ...f, links: f.links.filter((l) => l.id !== linkId) }
          : f
      ),
    }));
  };

  // --- Render Link Card ---
  const LinkCard = ({ link, onDelete }: { link: BookmarkLink; onDelete: () => void }) => {
    const favicon = getFaviconUrl(link.url);
    const [imgError, setImgError] = useState(false);

    if (viewMode === "list") {
      return (
        <div className="flex items-center gap-3 group px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-150">
          {favicon && !imgError ? (
            <img
              src={favicon}
              alt=""
              className="w-5 h-5 rounded shrink-0"
              onError={() => setImgError(true)}
            />
          ) : (
            <Globe size={16} className="text-accent/60 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/90 hover:text-cta hover:underline transition-colors duration-150"
            >
              {link.name}
            </a>
            {link.description && (
              <p className="text-xs text-accent/60 truncate">{link.description}</p>
            )}
          </div>
          <button
            onClick={onDelete}
            className="text-accent/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150 p-1 rounded hover:bg-white/10"
          >
            <Trash2 size={14} />
          </button>
        </div>
      );
    }

    // Grid view
    return (
      <div className="group relative">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-bg border border-border hover:border-cta/50 hover:bg-white/5 transition-all duration-150 text-center min-h-[100px] justify-center"
        >
          {favicon && !imgError ? (
            <img
              src={favicon}
              alt={link.name}
              className="w-12 h-12 rounded-xl shrink-0"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-cta/20 flex items-center justify-center shrink-0">
              <Globe size={24} className="text-cta" />
            </div>
          )}
          <span className="text-xs text-white font-medium truncate w-full">{link.name}</span>
          {link.description && (
            <span className="text-[10px] text-accent/60 truncate w-full">{link.description}</span>
          )}
        </a>
        <button
          onClick={onDelete}
          className="absolute -top-1 -right-1 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150"
        >
          <Trash2 size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full text-white text-sm gap-2 overflow-y-auto p-1">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-1 shrink-0">
        <div className="flex-1" />
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="p-1.5 rounded-lg hover:bg-white/5 text-accent/60 hover:text-white transition-colors duration-150"
          title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
        >
          {viewMode === "grid" ? <List size={16} /> : <LayoutGrid size={16} />}
        </button>
      </div>

      {/* Add Standalone Link */}
      {showAddStandalone ? (
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-bg border border-border shrink-0">
          <input
            type="text"
            value={newLinkName}
            onChange={(e) => setNewLinkName(e.target.value)}
            placeholder="Link name..."
            className="rounded-lg bg-black/30 text-white text-sm px-2.5 py-1.5 border border-border focus:outline-none focus:border-accent placeholder:text-accent/60"
            autoFocus
          />
          <input
            type="text"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            placeholder="URL (e.g., google.com)"
            className="rounded-lg bg-black/30 text-white text-sm px-2.5 py-1.5 border border-border focus:outline-none focus:border-accent placeholder:text-accent/60"
          />
          <input
            type="text"
            value={newLinkDesc}
            onChange={(e) => setNewLinkDesc(e.target.value)}
            placeholder="Short description (optional)"
            className="rounded-lg bg-black/30 text-white text-sm px-2.5 py-1.5 border border-border focus:outline-none focus:border-accent placeholder:text-accent/60"
          />
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                setShowAddStandalone(false);
                setNewLinkName("");
                setNewLinkUrl("");
                setNewLinkDesc("");
              }}
              className="flex-1 rounded-lg border border-border text-accent hover:bg-white/5 py-1.5 text-sm transition-all duration-150"
            >
              Cancel
            </button>
            <button
              onClick={addStandaloneLink}
              className="flex-1 bg-cta hover:bg-cta-hover text-white rounded-lg py-1.5 text-sm transition-all duration-150"
            >
              Add Link
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddStandalone(true)}
          className="w-full text-left text-accent/70 hover:text-white text-xs py-1.5 px-3 rounded-lg border border-dashed border-border hover:border-cta/50 transition-all duration-150 flex items-center gap-1.5 shrink-0"
        >
          <Plus size={12} /> Add standalone link
        </button>
      )}

      {/* Standalone Links */}
      {data.standaloneLinks.length > 0 && (
        <div className="mt-1 shrink-0">
          <div className="text-xs text-accent/60 mb-1.5 font-medium">Quick Links</div>
          <div className={viewMode === "grid" 
            ? "grid grid-cols-4 sm:grid-cols-5 gap-2" 
            : "flex flex-col gap-0.5"
          }>
            {data.standaloneLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={() => deleteStandaloneLink(link.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Folder Input */}
      <div className="flex gap-1.5 mt-2 shrink-0">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addFolder()}
          placeholder="New folder name..."
          className="flex-1 rounded-lg bg-bg border border-border px-2.5 py-1.5 text-sm outline-none focus:border-accent placeholder:text-accent/60"
        />
        <button
          onClick={addFolder}
          className="shrink-0 bg-cta hover:bg-cta-hover text-white rounded-lg px-3 py-1.5 text-sm transition-all duration-150 flex items-center gap-1"
        >
          <Plus size={14} /> Folder
        </button>
      </div>

      {/* Empty State */}
      {data.folders.length === 0 && data.standaloneLinks.length === 0 && (
        <div className="text-center text-accent/60 text-xs py-6">
          Add standalone links or create folders to organize them!
        </div>
      )}

      {/* Folders - SCROLLABLE AREA */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
        {data.folders.map((folder) => {
          const isExpanded = expandedFolders.has(folder.id);
          const isAddingLink = activeFolderId === folder.id;

          return (
            <div
              key={folder.id}
              className="rounded-xl bg-bg border border-border overflow-hidden"
            >
              {/* Folder Header */}
              <div
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors duration-150"
                onClick={() => toggleFolder(folder.id)}
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
                    deleteFolder(folder.id);
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

              {/* Folder Content - SCROLLABLE LINKS */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-border/50">
                  {/* Add Link to Folder */}
                  {isAddingLink ? (
                    <div className="flex flex-col gap-1.5 mb-2">
                      <input
                        type="text"
                        value={newLinkName}
                        onChange={(e) => setNewLinkName(e.target.value)}
                        placeholder="Link name..."
                        className="rounded-lg bg-black/30 text-white text-sm px-2.5 py-1.5 border border-border focus:outline-none focus:border-accent placeholder:text-accent/60"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        placeholder="URL (e.g., google.com)"
                        className="rounded-lg bg-black/30 text-white text-sm px-2.5 py-1.5 border border-border focus:outline-none focus:border-accent placeholder:text-accent/60"
                      />
                      <input
                        type="text"
                        value={newLinkDesc}
                        onChange={(e) => setNewLinkDesc(e.target.value)}
                        placeholder="Short description (optional)"
                        className="rounded-lg bg-black/30 text-white text-sm px-2.5 py-1.5 border border-border focus:outline-none focus:border-accent placeholder:text-accent/60"
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setActiveFolderId(null);
                            setNewLinkName("");
                            setNewLinkUrl("");
                            setNewLinkDesc("");
                          }}
                          className="flex-1 rounded-lg border border-border text-accent hover:bg-white/5 py-1.5 text-sm transition-all duration-150"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => addLinkToFolder(folder.id)}
                          className="flex-1 bg-cta hover:bg-cta-hover text-white rounded-lg py-1.5 text-sm transition-all duration-150"
                        >
                          Add Link
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveFolderId(folder.id)}
                      className="w-full text-left text-accent/70 hover:text-white text-xs py-1.5 px-2 rounded-lg border border-dashed border-border hover:border-cta/50 transition-all duration-150 flex items-center gap-1.5"
                    >
                      <Plus size={12} /> Add link to this folder
                    </button>
                  )}

                  {/* Folder Links - WITH SCROLLING */}
                  {folder.links.length > 0 && (
                    <div className={`mt-2 max-h-48 overflow-y-auto overscroll-contain pr-0.5 ${
                      viewMode === "grid" 
                        ? "grid grid-cols-4 sm:grid-cols-5 gap-2" 
                        : "flex flex-col gap-0.5"
                    }`}>
                      {folder.links.map((link) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          onDelete={() => deleteFolderLink(folder.id, link.id)}
                        />
                      ))}
                    </div>
                  )}
                  {folder.links.length === 0 && !isAddingLink && (
                    <div className="text-accent/40 text-xs py-1">No links in this folder.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(BookmarkWidget);
