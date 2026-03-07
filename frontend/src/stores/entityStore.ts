// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { entityService } from "@/services/entityService";
import type { Entity, Note } from "@/types/models";

interface EntityState {
  getEntity: (id: string) => Promise<Entity>;
  getNotes: (id: string) => Promise<Note[]>;
  getConnections: (id: string) => Promise<Entity[]>;
}

export const useEntityStore = create<EntityState>((set) => ({
  getEntity: async (id) => {
    return await entityService.get(id);
  },

  getNotes: async (id) => {
    return await entityService.getNotes(id);
  },

  getConnections: async (id) => {
    return await entityService.getConnections(id);
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
  fetch: (type?: EntityType) => Promise<void>;
  search: (q: string, type?: EntityType) => Promise<Entity[]>;
  debouncedSearch: (q: string, type?: EntityType) => Promise<Entity[]>;
  create: (p: EntityCreatePayload) => Promise<Entity>;
  update: (id: string, p: EntityUpdatePayload) => Promise<Entity>;
  archive: (id: string) => Promise<void>;
}

export const useEntityStore = create<EntityState>((set, get) => ({
  entities: [],
  isLoading: false,
  searchCache: new Cache<Entity[]>(10 * 60 * 1000), // 10 minutes for search

  fetch: async (type) => {
    set({ isLoading: true });
    try {
      const entities = await entityService.list(type);
      set({ entities });
    } finally {
      set({ isLoading: false });
    }
  },

  search: async (q, type) => {
    const cacheKey = `${q}:${type || 'all'}`;
    const cached = get().searchCache.get(cacheKey);
    if (cached) return cached;

    const results = await entityService.search(q, type);
    get().searchCache.set(cacheKey, results);
    return results;
  },

  debouncedSearch: debounce(async (q: string, type?: EntityType) => {
    return get().search(q, type);
  }, 300),

  create: async (p) => {
    const entity = await entityService.create(p);
    set((s) => ({ entities: [entity, ...s.entities] }));
    get().searchCache.clear(); // Clear search cache on create
    return entity;
  },

  update: async (id, p) => {
    const entity = await entityService.update(id, p);
    set((s) => ({ entities: s.entities.map((e) => (e.id === id ? entity : e)) }));
    get().searchCache.clear(); // Clear search cache on update
    return entity;
  },

  archive: async (id) => {
    await entityService.archive(id);
    set((s) => ({ entities: s.entities.filter((e) => e.id !== id) }));
    get().searchCache.clear(); // Clear search cache on archive
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
