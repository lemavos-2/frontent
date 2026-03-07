// ─────────────────────────────────────────────────────────────────────────────

import api from "@/lib/api";
import type { Entity, Note } from "@/types/models";

export const entityService = {
  // GET /api/entities/:id
  async get(id: string): Promise<Entity> {
    return (await api.get<Entity>(`/api/entities/${id}`)).data;
  },
  // GET /api/entities/:id/notes
  async getNotes(id: string): Promise<Note[]> {
    return (await api.get<Note[]>(`/api/entities/${id}/notes`)).data;
  },
  // GET /api/entities/:id/connections
  async getConnections(id: string): Promise<Entity[]> {
    return (await api.get<Entity[]>(`/api/entities/${id}/connections`)).data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
  // POST /api/entities/:id/restore
  async restore(id: string): Promise<Entity> {
    return (await api.post<Entity>(`/api/entities/${id}/restore`)).data;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
