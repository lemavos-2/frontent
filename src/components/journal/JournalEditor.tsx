import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function JournalEditor({ content, onUpdate }: { content: string; onUpdate: (content: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }: { editor: any }) => onUpdate(editor.getHTML()),
  });

  return (
    <div className="h-full w-full bg-surface rounded-[10px] border border-border p-4">
      <EditorContent editor={editor} className="prose prose-invert w-full h-full min-h-[300px]" />
    </div>
  );
}
