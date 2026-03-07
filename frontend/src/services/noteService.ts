// ─────────────────────────────────────────────────────────────────────────────

import api from "@/lib/api";
import type { Note } from "@/types/models";

export const noteService = {
  // POST /api/notes — content + optional folderId
  async create(content: string, folderId?: string): Promise<Note> {
    return (await api.post<Note>("/api/notes", { content, folderId })).data;
  },
  // PUT /api/notes/:id — content
  async update(id: string, content: string): Promise<Note> {
    return (await api.put<Note>(`/api/notes/${id}`, { content })).data;
  },
  // GET /api/notes/:id — full note
  async get(id: string): Promise<Note> {
    return (await api.get<Note>(`/api/notes/${id}`)).data;
  },
  // GET /api/notes — list notes
  async list(): Promise<Note[]> {
    return (await api.get<Note[]>("/api/notes")).data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
