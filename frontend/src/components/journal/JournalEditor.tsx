import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { entityService } from "@/services/entityService";
import type { Entity } from "@/types/models";

interface MentionState {
  active: boolean;
  query: string;
  position: { top: number; left: number };
}

export function JournalEditor({ content, onUpdate }: { content: string; onUpdate: (content: string) => void }) {
  const [mention, setMention] = useState<MentionState>({ active: false, query: "", position: { top: 0, left: 0 } });
  const [entities, setEntities] = useState<Entity[]>([]);
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  // Load entities for autocomplete
  useEffect(() => {
    entityService.list().then(setEntities);
  }, []);

  // Filter entities based on query
  useEffect(() => {
    if (!mention.query) {
      setFilteredEntities(entities.slice(0, 10));
    } else {
      const filtered = entities.filter(e =>
        e.name.toLowerCase().includes(mention.query.toLowerCase()) ||
        e.entityType.toLowerCase().includes(mention.query.toLowerCase())
      ).slice(0, 10);
      setFilteredEntities(filtered);
    }
  }, [mention.query, entities]);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }: { editor: any }) => {
      const html = editor.getHTML();
      onUpdate(html);

      // Check for mention trigger
      const { from } = editor.state.selection;
      const text = editor.getText();
      const beforeCursor = text.slice(0, from);
      const match = beforeCursor.match(/\{([^}]*)$/);

      if (match) {
        const query = match[1];
        const rect = editor.view.coordsAtPos(from);

        setMention({
          active: true,
          query,
          position: {
            top: rect.top + 20,
            left: rect.left
          }
        });
      } else {
        setMention(prev => ({ ...prev, active: false }));
      }
    },
  });

  const insertMention = (entity: Entity) => {
    if (!editor) return;

    const { from } = editor.state.selection;
    const text = editor.getText();
    const beforeCursor = text.slice(0, from);
    const match = beforeCursor.match(/\{[^}]*$/);

    if (match) {
      const start = from - match[0].length;
      const end = from;

      editor.chain()
        .deleteRange({ from: start, to: end })
        .insertContent(`{${entity.entityType.toLowerCase()}:${entity.id}} `)
        .run();
    }

    setMention(prev => ({ ...prev, active: false }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!mention.active) return;

    if (e.key === "Escape") {
      setMention(prev => ({ ...prev, active: false }));
      e.preventDefault();
    } else if (e.key === "Enter" && filteredEntities.length > 0) {
      insertMention(filteredEntities[0]);
      e.preventDefault();
    }
  };

  return (
    <div className="relative h-full w-full" ref={editorRef}>
      <div className="h-full w-full bg-surface rounded-[10px] border border-border p-4">
        <EditorContent
          editor={editor}
          className="prose prose-invert w-full h-full min-h-[300px] focus:outline-none"
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Mention dropdown */}
      {mention.active && (
        <div
          className="absolute z-50 bg-[#111] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto w-64"
          style={{ top: mention.position.top, left: mention.position.left }}
        >
          {filteredEntities.length === 0 ? (
            <div className="p-3 text-xs text-[#555]">Nenhuma entidade encontrada</div>
          ) : (
            filteredEntities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => insertMention(entity)}
                className="w-full text-left p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{entity.icon || "📄"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{entity.name}</div>
                    <div className="text-xs text-[#555] capitalize">{entity.entityType.toLowerCase()}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
