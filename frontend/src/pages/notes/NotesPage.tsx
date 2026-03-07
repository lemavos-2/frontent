import React from 'react';
import { NoteEditor } from '@/components/editor/NoteEditor';
import { NotesList } from '@/components/notes/NotesList';

export const NotesPage: React.FC = () => {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 border-r">
        <NotesList />
      </div>
      <div className="w-3/4 p-4">
        <NoteEditor />
      </div>
    </div>
  );
};