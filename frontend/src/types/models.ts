// ─────────────────────────────────────────────────────────────────────────────

export interface Entity {
  id: string;
  vaultId: string;
  title: string;
  description?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  vaultId: string;
  folderId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteEntity {
  noteId: string;
  entityId: string;
  position: number;
}

// ─────────────────────────────────────────────────────────────────────────────
  preview: string;
}

// NoteResponse — full note with content
export interface NoteResponse {
  id: string;
  userId: string;
  folderId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId?: string;
  createdAt: string;
}

export interface TrackingEvent {
  id: string;
  entityId: string;
  value?: number;
  timestamp: string;
  archivedAt?: string;
}

export interface TrackingStats {
  currentStreak: number;
  longestStreak: number;
  averageValue: number;
  weeklyCompletionRate: number;
}

export interface TopEntity {
  type: string;
  id: string;
  name: string;
  mentions: number;
  mentionFrequency?: number;
}

export interface DashboardMetrics {
  uniquePeople: number;
  uniqueProjects: number;
  uniqueHabits: number;
  totalMentions: number;
  topPeople: TopEntity[];
  topProjects: TopEntity[];
  topHabits: TopEntity[];
  habitsCompletedToday?: string[];
  weeklyAverageCompletionRate?: number;
  globalHeatmap?: Record<string, number>;
}


export interface MentionEntry {
  noteId: string;
  noteTitle: string;
  date: string;   // LocalDate yyyy-MM-dd
  context: string;
}

export interface EntityTimeline {
  entityId: string;
  entityType: string;
  entityName: string;
  totalMentions: number;
  heatmap: Record<string, number>; // date → count
  mentions: MentionEntry[];
  mentionFrequency?: number;
}

export interface SubscriptionDTO {
  id: string;
  userId: string;
  effectivePlan: PlanType;
  status: SubscriptionStatus;
  maxEntities: number;
  maxNotes: number;
  maxHabits: number;
  advancedMetrics: boolean;
  dataExport: boolean;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  inGracePeriod: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  plan: PlanType;
  entityCount: number;
  noteCount: number;
  habitCount: number;
  vaultId: string;
  subscriptionStatus?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  maxEntities?: number;
  maxNotes?: number;
  maxHabits?: number;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  plan: PlanType;
}

// ─────────────────────────────────────────────────────────────────────────────
