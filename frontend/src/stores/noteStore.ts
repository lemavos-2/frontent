// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { noteService } from "@/services/noteService";
import type { Note } from "@/types/models";

interface NoteState {
  notes: Note[];
  isLoading: boolean;
  fetch: () => Promise<void>;
  create: (content: string, folderId?: string) => Promise<Note>;
  update: (id: string, content: string) => Promise<Note>;
  get: (id: string) => Promise<Note>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const notes = await noteService.list();
      set({ notes });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (content, folderId) => {
    const note = await noteService.create(content, folderId);
    set((s) => ({ notes: [note, ...s.notes] }));
    return note;
  },

  update: async (id, content) => {
    const note = await noteService.update(id, content);
    set((s) => ({
      notes: s.notes.map((n) => (n.id === id ? note : n)),
    }));
    return note;
  },

  get: async (id) => {
    const note = await noteService.get(id);
    return note;
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id
          ? { ...n, title: note.title, updatedAt: note.updatedAt }
          : n
      ),
    }));
    return note;
  },

  archive: async (id) => {
    await noteService.archive(id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  get: async (id) => noteService.get(id),
}));

// ─────────────────────────────────────────────────────────────────────────────
