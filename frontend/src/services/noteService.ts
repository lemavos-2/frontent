// ─────────────────────────────────────────────────────────────────────────────

import api from "@/lib/api";
import type { NoteIndex, NoteResponse } from "@/types/models";

export const noteService = {
  // POST /api/notes — content + optional folderId
  async create(content: string, folderId?: string): Promise<NoteResponse> {
    return (await api.post<NoteResponse>("/api/notes", { content, folderId })).data;
  },
  // PUT /api/notes/:id — only content
  async update(id: string, content: string): Promise<NoteResponse> {
    return (await api.put<NoteResponse>(`/api/notes/${id}`, { content })).data;
  },
  // DELETE /api/notes/:id — archives (soft delete)
  async archive(id: string): Promise<void> {
    await api.delete(`/api/notes/${id}`);
  },
  // GET /api/notes/:id — full note with content
  async get(id: string): Promise<NoteResponse> {
    return (await api.get<NoteResponse>(`/api/notes/${id}`)).data;
  },
  // GET /api/notes — list by folderId, rootOnly, or days
  async list(options?: { folderId?: string; rootOnly?: boolean; days?: number }): Promise<NoteIndex[]> {
    return (await api.get<NoteIndex[]>("/api/notes", { params: options })).data;
  },
  // GET /api/notes/recent
  async recent(): Promise<NoteIndex[]> {
    return (await api.get<NoteIndex[]>("/api/notes/recent")).data;
  },
  // GET /api/notes/search?q=
  async search(q: string): Promise<NoteIndex[]> {
    return (await api.get<NoteIndex[]>("/api/notes/search", { params: { q } })).data;
  },
  // PATCH /api/notes/:id/move
  async move(id: string, folderId: string | null): Promise<void> {
    await api.patch(`/api/notes/${id}/move`, { folderId });
  },
};

// ─────────────────────────────────────────────────────────────────────────────
