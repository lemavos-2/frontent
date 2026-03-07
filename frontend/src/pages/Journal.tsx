// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { noteService } from "@/services/noteService";
import { folderService } from "@/services/folderService";
import type { NoteIndex, Folder } from "@/types/models";
import { toast } from "sonner";
import { Plus, Trash2, Search, Folder as FolderIcon, ChevronRight, Edit3 } from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";

// folder tree helper component
function FolderList({
  nodes,
  activeId,
  onSelect,
  onDragOver,
  onDrop,
  onRename,
  onDelete,
}: {
  nodes: Array<Folder & Partial<{ children: Folder[] }>>;
  activeId: string | null;
  onSelect: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (folderId: string | null) => void;
  onRename: (f: Folder) => void;
  onDelete: (f: Folder) => void;
}) {
  return (
    <ul className="pl-3">
      {nodes.map((f) => (
        <li key={f.id} className="mb-1">
          <div
            className={`flex items-center gap-1 text-xs cursor-pointer p-1 rounded transition-colors ${
              activeId === f.id ? "font-bold text-foreground bg-brand/10" : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary"
            }`}
            onClick={() => onSelect(f.id)}
            onDragOver={(e) => { e.preventDefault(); onDragOver(e); e.currentTarget.classList.add('drag-over'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('drag-over'); }}
            onDrop={(e) => { e.stopPropagation(); e.currentTarget.classList.remove('drag-over'); onDrop(f.id); }}
          >
            <FolderIcon className="h-3 w-3" />
            <span className="truncate">{f.name}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onRename(f); }}
              className="ml-auto text-foreground-tertiary hover:text-foreground p-1 touch-target"
              title="Renomear"
            ><Edit3 className="h-3 w-3" /></button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(f); }}
              className="text-foreground-tertiary hover:text-accent-error p-1 touch-target"
              title="Apagar"
            ><Trash2 className="h-3 w-3" /></button>
          </div>
          {(((f as Folder & { children?: Folder[] }).children || []).length > 0) && (
            <FolderList
              nodes={(f as Folder & { children?: Folder[] }).children || []}
              activeId={activeId}
              onSelect={onSelect}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onRename={onRename}
              onDelete={onDelete}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
import { ptBR } from "date-fns/locale";

function dateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Hoje";
  if (isYesterday(d)) return "Ontem";
  return format(d, "d 'de' MMMM", { locale: ptBR });
}

function groupByDate(notes: NoteIndex[]) {
  const map = new Map<string, NoteIndex[]>();
  for (const n of notes) {
    const key = n.createdAt.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
}

export default function JournalPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteIndex[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [folderModal, setFolderModal] = useState<{ type: "create" | "rename" | "delete"; folder?: Folder } | null>(null);
  const [folderInput, setFolderInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<NoteIndex | null>(null);

  useEffect(() => { load(); }, [activeFolderId]);

  // build hierarchical tree of folders
  const folderTree = React.useMemo(() => {
    const map = new Map<string, Folder & { children: Folder[] }>();
    folders.forEach((f) => map.set(f.id, { ...f, children: [] }));
    const roots: (Folder & { children: Folder[] })[] = [];
    map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [folders]);

  const load = async () => {
    setLoading(true);
    try {
      const [n, f] = await Promise.all([
        noteService.list(activeFolderId ? { folderId: activeFolderId } : {}),
        folderService.list(),
      ]);
      setNotes(n);
      setFolders(f);
    } catch {
      toast.error("Erro ao carregar journal");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await noteService.archive(deleteTarget.id);
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      toast.success("Nota arquivada");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    }
  };

  const filtered = notes.filter((n) =>
    !search || n.title.toLowerCase().includes(search.toLowerCase())
  );
  const groups = groupByDate(filtered);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Journal</h1>
        <button
          onClick={() => navigate("/journal/new")}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-background text-sm font-semibold px-4 py-2 rounded-md transition-colors touch-target"
        >
          <Plus className="h-4 w-4" />
          Nova entrada
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#444]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar entradas..."
          className="w-full bg-background-secondary border border-border rounded-md pl-9 pr-3 py-2 text-sm text-foreground placeholder-foreground-tertiary focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="flex gap-6">
        {/* sidebar folders */}
        <div className="w-64 flex-shrink-0 bg-background-secondary border-r border-border p-4">
          {folders.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveFolderId(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggingNoteId) {
                      noteService.move(draggingNoteId, null).then(load);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors touch-target ${
                    !activeFolderId ? "bg-brand/10 text-brand" : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFolderModal({ type: "create" })}
                  className="text-sm text-brand hover:text-brand-dark transition-colors"
                >
                  + pasta
                </button>
              </div>
              <FolderList
                nodes={folderTree}
                activeId={activeFolderId}
                onSelect={(id) => setActiveFolderId(activeFolderId === id ? null : id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(folderId) => {
                  if (draggingNoteId) {
                    noteService.move(draggingNoteId, folderId).then(load);
                  }
                }}
                onRename={(f) => { setFolderInput(f.name); setFolderModal({ type: "rename", folder: f }); }}
                onDelete={(f) => setFolderModal({ type: "delete", folder: f })}
              />
            </div>
          )}
        </div>
        {/* notes list */}
        <div className="flex-1">
          {/* original notes rendering continues here */}

      {/* Notes */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-background-secondary rounded-lg" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-foreground-tertiary text-sm">Nenhuma entrada encontrada</p>
          <button
            onClick={() => navigate("/journal/new")}
            className="mt-3 text-brand text-sm hover:text-brand-dark transition-colors"
          >
            Escrever primeira entrada →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([date, dayNotes]) => (
            <div key={date}>
              <p className="text-xs font-medium text-foreground-tertiary mb-3 font-mono uppercase tracking-wider">
                {dateLabel(date)}
              </p>
              <div className="space-y-1">
                {dayNotes.map((note) => (
                  <div key={note.id} className="group flex items-center gap-2">
                    <button
                      draggable
                      onDragStart={(e) => { setDraggingNoteId(note.id); e.currentTarget.classList.add('dragging'); }}
                      onDragEnd={(e) => { setDraggingNoteId(null); e.currentTarget.classList.remove('dragging'); }}
                      onClick={() => navigate(`/journal/${note.id}`)}
                      className="flex-1 flex items-center gap-3 p-3 bg-background-secondary border border-border rounded-lg hover:border-accent transition-all text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {note.title || "Sem título"}
                        </p>
                        {note.preview && (
                          <p className="text-xs text-foreground-tertiary mt-0.5 truncate">{note.preview}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-foreground-tertiary">
                          {format(parseISO(note.createdAt), "HH:mm")}
                        </span>
                        <ChevronRight className="h-4 w-4 text-foreground-tertiary group-hover:text-foreground transition-colors" />
                      </div>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(note)}
                      className="p-2 rounded-md text-foreground-tertiary hover:text-accent-error hover:bg-accent-error/5 transition-all opacity-0 group-hover:opacity-100 touch-target"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
        </div> {/* end notes list (flex-1) */}
      </div> {/* end sidebar + content flex */}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-background-secondary border border-border rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-2">Arquivar nota?</h3>
            <p className="text-sm text-foreground-tertiary mb-5">"{deleteTarget.title || "Sem título"}" será arquivada.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-foreground-tertiary hover:text-foreground transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-accent-error/20 text-accent-error hover:bg-accent-error/30 rounded-md transition-colors">
                Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* folder management modal */}
      {folderModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-background-secondary border border-border rounded-xl p-6 w-full max-w-sm">
            {folderModal.type === "create" && (
              <>
                <h3 className="font-semibold mb-3">Nova pasta</h3>
                <input
                  value={folderInput}
                  onChange={(e) => setFolderInput(e.target.value)}
                  placeholder="Nome da pasta"
                  className="w-full bg-background-tertiary border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-foreground-tertiary focus:outline-none focus:border-accent transition-colors"
                />
                <div className="flex gap-3 justify-end mt-5">
                  <button onClick={() => setFolderModal(null)} className="px-4 py-2 text-sm text-foreground-tertiary hover:text-foreground transition-colors">Cancelar</button>
                  <button onClick={async () => {
                    if (folderInput.trim()) {
                      await folderService.create(folderInput.trim(), folderModal.folder?.id);
                      setFolderInput(""); setFolderModal(null); load();
                    }
                  }} className="px-4 py-2 text-sm bg-brand/20 text-brand hover:bg-brand/30 rounded-md transition-colors">Criar</button>
                </div>
              </>
            )}
            {folderModal.type === "rename" && folderModal.folder && (
              <>
                <h3 className="font-semibold mb-2">Renomear pasta</h3>
                <input
                  value={folderInput}
                  onChange={(e) => setFolderInput(e.target.value)}
                  className="w-full bg-[#1a1a1c] border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                />
                <div className="flex gap-2 justify-end mt-4">
                  <button onClick={() => setFolderModal(null)} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancelar</button>
                  <button onClick={async () => {
                    if (folderInput.trim()) {
                      await folderService.rename(folderModal.folder!.id, folderInput.trim());
                      setFolderInput(""); setFolderModal(null); load();
                    }
                  }} className="px-4 py-2 text-sm bg-[#3ecf8e]/20 text-[#3ecf8e] hover:bg-[#3ecf8e]/30 rounded-md">Salvar</button>
                </div>
              </>
            )}
            {folderModal.type === "delete" && folderModal.folder && (
              <>
                <h3 className="font-semibold mb-2">Apagar pasta?</h3>
                <p className="text-sm text-[#666] mb-4">"{folderModal.folder.name}" será removida. Notas dentro não serão excluídas.</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setFolderModal(null)} className="px-4 py-2 text-sm text-[#888] hover:text-white">Cancelar</button>
                  <button onClick={async () => {
                    await folderService.delete(folderModal.folder!.id);
                    setFolderModal(null);
                    if (activeFolderId === folderModal.folder!.id) setActiveFolderId(null);
                    load();
                  }} className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md">Apagar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
