// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { noteService } from "@/services/noteService";
import { entityService } from "@/services/entityService";
import type { NoteResponse, Entity } from "@/types/models";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Eye, Edit, Split } from "lucide-react";

// Simple mention parser: {type:id} patterns shown as colored spans in preview
const MENTION_RE = /\{(\w+):([a-zA-Z0-9_-]+)\}/g;

// Simple markdown preview renderer
function MarkdownPreview({ content, entities }: { content: string; entities: Entity[] }) {
  // Create entity map for mentions
  const entityMap = new Map<string, Entity>();
  entities.forEach(e => entityMap.set(e.id, e));

  // Simple markdown to HTML conversion
  const renderMarkdown = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-background-tertiary border border-border rounded-md p-3 my-3 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-background-tertiary px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent underline hover:text-accent-secondary">$1</a>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>')
      // Mentions
      .replace(MENTION_RE, (match, type, id) => {
        const entity = entityMap.get(id);
        if (entity) {
          const colorClass = type === 'person' ? 'text-accent' :
                           type === 'project' ? 'text-accent-secondary' :
                           type === 'habit' ? 'text-brand' : 'text-foreground-secondary';
          return `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-background-tertiary ${colorClass} text-xs font-medium">
            <span>${entity.icon || '📌'}</span>
            <span>${entity.name}</span>
          </span>`;
        }
        return match;
      });
  };

  return (
    <div className="prose prose-invert max-w-none">
      <div
        className="text-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: `<p class="mb-3">${renderMarkdown(content)}</p>` }}
      />
    </div>
  );
}

function MentionSuggestion({ entities, query, onSelect, highlightedIndex, onHover }: {
  entities: Entity[];
  query: string;
  onSelect: (e: Entity) => void;
  highlightedIndex?: number | null;
  onHover?: (i: number) => void;
}) {
  const matches = entities.filter(
    (e) => e.name.toLowerCase().includes(query.toLowerCase()) && !e.archivedAt
  ).slice(0, 6);

  if (!query || matches.length === 0) return null;

  return (
    <div role="listbox" aria-label="Sugestões" className="fixed z-50 bg-background-secondary border border-border rounded-lg shadow-xl overflow-hidden w-64 max-w-[90vw] sm:w-64">
      {matches.map((e, i) => (
        <button
          key={e.id}
          onMouseDown={(ev) => { ev.preventDefault(); onSelect(e); }}
          onMouseEnter={() => onHover?.(i)}
          role="option"
          aria-selected={highlightedIndex === i}
          className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${highlightedIndex === i ? 'bg-brand/10' : 'hover:bg-background-tertiary'}`}
        >
          <span className="text-sm">{e.icon || "📌"}</span>
          <div>
            <p className="text-sm text-foreground">{e.name}</p>
            <p className="text-xs text-foreground-tertiary font-mono">{e.type.toLowerCase()}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function JournalEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [note, setNote] = useState<NoteResponse | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPos, setMentionPos] = useState<{ top: number; left: number } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    entityService.list().then(setEntities).catch(() => {});
    if (id) {
      noteService.get(id)
        .then((n) => { setNote(n); setContent(n.content); })
        .catch(() => toast.error("Nota não encontrada"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const detectMention = useCallback((text: string, cursorPos: number) => {
    const textBefore = text.slice(0, cursorPos);
    // capture any characters after '@' except whitespace or '{'
    const atMatch = textBefore.match(/@([^\s{]*)$/);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      const ta = textareaRef.current;
      if (ta) {
        // Compute approximate caret coordinates by mirroring textarea content
        const computeCaret = (el: HTMLTextAreaElement, pos: number) => {
          const div = document.createElement("div");
          const style = getComputedStyle(el);
          // copy important styles so measurement matches
          div.style.whiteSpace = "pre-wrap";
          div.style.wordWrap = "break-word";
          div.style.position = "absolute";
          div.style.visibility = "hidden";
          div.style.boxSizing = "border-box";
          div.style.width = style.width;
          div.style.font = style.font;
          div.style.padding = style.padding;
          div.style.lineHeight = style.lineHeight;
          div.style.letterSpacing = style.letterSpacing;
          div.textContent = el.value.substring(0, pos);
          const span = document.createElement("span");
          span.textContent = "|";
          div.appendChild(span);
          document.body.appendChild(div);
          const spanRect = span.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();
          document.body.removeChild(div);
          return { top: spanRect.top - elRect.top + el.scrollTop, left: spanRect.left - elRect.left };
        };

        const rect = ta.getBoundingClientRect();
        const caret = computeCaret(ta, textBefore.length);
        // clamp to viewport and add page scroll
        const top = Math.min(window.innerHeight - 40, rect.top + caret.top + window.scrollY + 20);
        const left = Math.min(window.innerWidth - 280, rect.left + caret.left + window.scrollX + 8);
        setMentionPos({ top, left });
      }
    } else {
      setMentionQuery("");
      setMentionPos(null);
    }
  }, []);

  // hide suggestions on scroll/resize and clear highlighted index
  useEffect(() => {
    const handler = () => { setMentionPos(null); setHighlightedIndex(-1); };
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    detectMention(val, e.target.selectionStart ?? val.length);
    setHighlightedIndex(-1);

    // Auto-save after 1.5s of inactivity
    if (id) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => autoSave(val), 1500);
    }
  };

  const autoSave = async (text: string) => {
    if (!id || !text.trim()) return;
    try {
      await noteService.update(id, text);
    } catch { /* silent */ }
  };

  const insertMention = (entity: Entity) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const textBefore = content.slice(0, pos);
    const atIndex = textBefore.lastIndexOf("@");
    const mentionStr = `{${entity.type.toLowerCase()}:${entity.id}}`;
    let newContent;
    if (atIndex >= 0) {
      newContent = content.slice(0, atIndex) + mentionStr + content.slice(pos);
    } else {
      // fallback: insert at cursor
      newContent = content.slice(0, pos) + mentionStr + content.slice(pos);
    }
    setContent(newContent);
    setMentionQuery("");
    setMentionPos(null);
    setHighlightedIndex(-1);
    ta.focus();
  };

  const handleSave = async () => {
    if (!content.trim()) { toast.error("Conteúdo vazio"); return; }
    setSaving(true);
    try {
      if (id) {
        await noteService.update(id, content);
        toast.success("Nota salva");
      } else {
        const n = await noteService.create(content);
        toast.success("Nota criada");
        navigate(`/journal/${n.id}`, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-5 w-5 animate-spin text-foreground-tertiary" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/journal")} className="flex items-center gap-2 text-sm text-foreground-tertiary hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Journal
        </button>
        <div className="flex items-center gap-2">
          {id && <span className="text-xs text-foreground-tertiary font-mono">salvo automaticamente</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-50 text-background text-sm font-semibold px-4 py-2 rounded-md transition-colors touch-target"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-1 bg-background-tertiary border border-border rounded-lg p-1 w-fit">
        <button
          onClick={() => setViewMode('edit')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'edit' ? 'bg-brand text-background' : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
          }`}
        >
          <Edit className="h-4 w-4" />
          Editar
        </button>
        <button
          onClick={() => setViewMode('split')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'split' ? 'bg-brand text-background' : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
          }`}
        >
          <Split className="h-4 w-4" />
          Dividido
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'preview' ? 'bg-brand text-background' : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
          }`}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* Editor/Preview Area */}
      <div className={`relative ${viewMode === 'split' ? 'grid grid-cols-2 gap-4' : ''}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? '' : 'w-full'}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={(e) => {
                const hasSuggestions = !!mentionPos && !!mentionQuery;
                const getMatches = () => entities.filter((ent) => ent.name.toLowerCase().includes(mentionQuery.toLowerCase()) && !ent.archivedAt).slice(0, 6);
                if (hasSuggestions) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const m = getMatches();
                    setHighlightedIndex((prev) => Math.min(prev + 1, m.length - 1));
                    return;
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                    return;
                  }
                  if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault();
                    const m = getMatches();
                    const idx = highlightedIndex >= 0 ? highlightedIndex : 0;
                    const sel = m[idx];
                    if (sel) insertMention(sel);
                    return;
                  }
                  if (e.key === "Escape") {
                    setMentionQuery(""); setMentionPos(null); setHighlightedIndex(-1);
                    return;
                  }
                } else {
                  if (e.key === "Escape") { setMentionQuery(""); setMentionPos(null); setHighlightedIndex(-1); }
                }
              }}
              placeholder={`Escreva sua entrada...\n\nUse @ para mencionar entidades: @nome\nO formato salvo é {tipo:id}\n\n# Título\n## Subtítulo\n**negrito** *itálico* \`código\``}
              className="w-full min-h-[50vh] bg-background-secondary border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-foreground-tertiary focus:outline-none focus:border-accent resize-none leading-relaxed font-mono transition-colors"
            />
            {mentionPos && (
              <div style={{ position: "fixed", top: mentionPos.top, left: mentionPos.left, zIndex: 60 }}>
                <MentionSuggestion
                  entities={entities}
                  query={mentionQuery}
                  onSelect={insertMention}
                  highlightedIndex={highlightedIndex}
                  onHover={(i) => setHighlightedIndex(i)}
                />
              </div>
            )}
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? '' : 'w-full'} min-h-[50vh] bg-background-secondary border border-border rounded-lg px-4 py-3 overflow-y-auto`}>
            <MarkdownPreview content={content} entities={entities} />
          </div>
        )}
      </div>

      <div className="text-xs text-foreground-tertiary space-y-1">
        <p>Dica: use <code className="bg-background-tertiary px-1.5 py-0.5 rounded text-xs font-mono">@nome</code> para mencionar pessoas, hábitos, projetos e objetivos.</p>
        <p>Markdown suportado: # títulos, **negrito**, *itálico*, `código`, listas, links [texto](url)</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
