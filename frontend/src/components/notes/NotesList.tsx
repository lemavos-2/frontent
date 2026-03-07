import React, { useEffect } from 'react';
import { useNoteStore } from '@/stores/noteStore';
import type { Note } from '@/types/models';

interface NotesListProps {
  folderId?: string;
}

export const NotesList: React.FC<NotesListProps> = ({ folderId }) => {
  const { notes, isLoading, fetch } = useNoteStore();

  useEffect(() => {
    fetch();
  }, [fetch]);

  if (isLoading) return <div>Loading...</div>;

  const filteredNotes = folderId ? notes.filter(n => n.folderId === folderId) : notes;

  return (
    <div className="space-y-2">
      {filteredNotes.map((note) => (
        <div key={note.id} className="p-4 border rounded cursor-pointer hover:bg-gray-50">
          <h3 className="font-bold">{note.title}</h3>
          <p className="text-sm text-gray-600">{note.content.substring(0, 100)}...</p>
          <p className="text-xs text-gray-400">{new Date(note.updatedAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};