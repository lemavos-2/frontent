import React, { useState, useEffect, useRef } from 'react';
import { useNoteStore } from '@/stores/noteStore';
import type { Note } from '@/types/models';

interface NoteEditorProps {
  noteId?: string;
  folderId?: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, folderId }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const { create, update, get } = useNoteStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (noteId) {
      get(noteId).then((note) => {
        setContent(note.content);
        setTitle(note.title);
      });
    }
  }, [noteId, get]);

  const handleSave = async () => {
    if (noteId) {
      await update(noteId, content);
    } else {
      await create(content, folderId);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Autosave logic here
    handleSave();
  };

  const renderContent = () => {
    const entityRegex = /\[\[([^\]]+)\]\]/g;
    const parts = content.split(entityRegex);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span key={index} className="bg-blue-100 text-blue-800 px-1 rounded cursor-pointer">
            [[{part}]]
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="mb-4 p-2 border rounded"
      />
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder="Write your thoughts... use [[Entity]] to reference"
        className="flex-1 p-2 border rounded resize-none"
      />
      <div className="mt-4 p-2 border rounded bg-gray-50">
        <h3>Preview:</h3>
        <div>{renderContent()}</div>
      </div>
    </div>
  );
};