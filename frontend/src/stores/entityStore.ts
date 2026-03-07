// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { entityService, type EntityCreatePayload, type EntityUpdatePayload } from "@/services/entityService";
import type { Entity, EntityType } from "@/types/models";

// Simple cache implementation
class Cache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // 5 minutes default
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: T) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear() {
    this.cache.clear();
  }
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface EntityState {
  entities: Entity[];
  isLoading: boolean;
  searchCache: Cache<Entity[]>;
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
