/**
 * Domain types — intentionally shaped to match the future Prisma models so the
 * Phase 1 mock data can be swapped for real DB data with zero call-site churn.
 */

export type TimelineEventType =
  | "CONSULT"
  | "FOLLOWUP"
  | "MEDICATION"
  | "CHECKIN"
  | "TIP";

export type ConsultationStatus = "COMPLETED" | "SCHEDULED" | "CANCELLED";

export type CompanionRole = "USER" | "AI" | "SYSTEM";

export type NudgeKind = "FOLLOWUP" | "MEDICATION" | "SEASONAL";

export type NudgeStatus = "PENDING" | "SEEN" | "ACTED";

export interface User {
  id: string;
  email: string;
  fullName: string;
  location: string;
  createdAt: string; // ISO
}

export interface Consultation {
  id: string;
  userId: string;
  doctorName: string;
  specialty: string;
  summary: string;
  status: ConsultationStatus;
  createdAt: string; // ISO
}

export interface TimelineEvent {
  id: string;
  userId: string;
  type: TimelineEventType;
  title: string;
  detail: string;
  occurredAt: string; // ISO
}

export interface CompanionMessage {
  id: string;
  threadId: string;
  role: CompanionRole;
  content: string;
  escalated: boolean;
  createdAt: string; // ISO
}

export interface CompanionThread {
  id: string;
  userId: string;
  consultationId?: string;
  createdAt: string; // ISO
  messages: CompanionMessage[];
}

export interface Streak {
  id: string;
  userId: string;
  count: number;
  lastCheckInDate: string; // ISO (date)
}

export interface Nudge {
  id: string;
  userId: string;
  kind: NudgeKind;
  title: string;
  body: string;
  deepLink: string;
  status: NudgeStatus;
  createdAt: string; // ISO
}
