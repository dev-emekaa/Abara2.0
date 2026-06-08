/**
 * Centralized mock data for Phase 1 (UI-first).
 *
 * This is the SINGLE place dummy data lives. Everything is typed to the domain
 * models in `./types`, so Phase 5 swaps these constants for RSC/server-action
 * data without touching component call sites.
 *
 * Demo persona: Chidinma Okafor — a real-feeling Nigerian patient in Enugu,
 * recovering from malaria, so the retention layer looks alive on first load.
 */

import type {
  CompanionThread,
  Consultation,
  Nudge,
  Streak,
  TimelineEvent,
  User,
} from "./types";

export const DEMO_CREDENTIALS = {
  email: "demo@abara.health",
  password: "demo1234",
} as const;

export const demoUser: User = {
  id: "user_demo",
  email: DEMO_CREDENTIALS.email,
  fullName: "Chidinma Okafor",
  location: "Enugu, Nigeria",
  createdAt: "2025-09-02T09:12:00.000Z",
};

export const demoConsultations: Consultation[] = [
  {
    id: "consult_1",
    userId: demoUser.id,
    doctorName: "Dr. Ngozi Eze",
    specialty: "General Practice",
    summary:
      "Confirmed uncomplicated malaria. Prescribed a 3-day artemisinin course. Advised rest, fluids, and a follow-up if fever persists past day 4.",
    status: "COMPLETED",
    createdAt: "2026-06-02T10:30:00.000Z",
  },
  {
    id: "consult_2",
    userId: demoUser.id,
    doctorName: "Dr. Tunde Bakare",
    specialty: "General Practice",
    summary:
      "Seasonal cold with mild sore throat. Reassurance, warm fluids, and saline gargle. No antibiotics indicated.",
    status: "COMPLETED",
    createdAt: "2026-03-14T15:05:00.000Z",
  },
  {
    id: "consult_3",
    userId: demoUser.id,
    doctorName: "Dr. Ngozi Eze",
    specialty: "General Practice",
    summary:
      "Routine wellness check. Blood pressure normal. Discussed rainy-season malaria prevention and bed-net use.",
    status: "COMPLETED",
    createdAt: "2025-11-20T11:45:00.000Z",
  },
];

export const demoTimeline: TimelineEvent[] = [
  {
    id: "tl_1",
    userId: demoUser.id,
    type: "CONSULT",
    title: "Malaria consultation with Dr. Ngozi Eze",
    detail: "Diagnosed with uncomplicated malaria. 3-day treatment started.",
    occurredAt: "2026-06-02T10:30:00.000Z",
  },
  {
    id: "tl_2",
    userId: demoUser.id,
    type: "MEDICATION",
    title: "Started artemisinin course",
    detail: "Day 1 of 3. Take with food, morning and evening.",
    occurredAt: "2026-06-02T19:00:00.000Z",
  },
  {
    id: "tl_3",
    userId: demoUser.id,
    type: "CHECKIN",
    title: "You checked in: feeling weak but no fever",
    detail: "Temperature normal. Fatigue still present — expected on day 2.",
    occurredAt: "2026-06-04T08:15:00.000Z",
  },
  {
    id: "tl_4",
    userId: demoUser.id,
    type: "TIP",
    title: "Read: staying hydrated during recovery",
    detail: "Small, frequent sips beat large amounts at once.",
    occurredAt: "2026-06-05T07:40:00.000Z",
  },
  {
    id: "tl_5",
    userId: demoUser.id,
    type: "FOLLOWUP",
    title: "Follow-up window opens",
    detail: "If fever returns or fatigue worsens, a check-in is recommended.",
    occurredAt: "2026-06-06T09:00:00.000Z",
  },
];

export const demoStreak: Streak = {
  id: "streak_demo",
  userId: demoUser.id,
  count: 4,
  lastCheckInDate: "2026-06-07T08:00:00.000Z",
};

export const demoThread: CompanionThread = {
  id: "thread_demo",
  userId: demoUser.id,
  consultationId: "consult_1",
  createdAt: "2026-06-06T09:05:00.000Z",
  messages: [
    {
      id: "msg_1",
      threadId: "thread_demo",
      role: "AI",
      content:
        "Hi Chidinma 👋 It's been 4 days since your malaria consult with Dr. Eze. I wanted to check in — how are you feeling today? No rush, just whatever's true.",
      escalated: false,
      createdAt: "2026-06-06T09:05:00.000Z",
    },
  ],
};

export const demoNudges: Nudge[] = [
  {
    id: "nudge_1",
    userId: demoUser.id,
    kind: "FOLLOWUP",
    title: "Your malaria follow-up is due",
    body: "It's day 4 since treatment started. A quick check-in helps us catch anything that isn't settling the way it should.",
    deepLink: "/app/companion",
    status: "PENDING",
    createdAt: "2026-06-06T09:00:00.000Z",
  },
  {
    id: "nudge_2",
    userId: demoUser.id,
    kind: "MEDICATION",
    title: "Last dose of your course today",
    body: "You're on the final day of your artemisinin course. Finishing the full course matters even once you feel better.",
    deepLink: "/app/timeline",
    status: "SEEN",
    createdAt: "2026-06-04T18:30:00.000Z",
  },
  {
    id: "nudge_3",
    userId: demoUser.id,
    kind: "SEASONAL",
    title: "Rainy season in Enugu — protect against malaria",
    body: "Mosquito activity is high right now in your area. A two-minute read on bed-net use could spare you a repeat.",
    deepLink: "/app/timeline",
    status: "PENDING",
    createdAt: "2026-06-05T06:00:00.000Z",
  },
];

/** Convenience bundle for screens that want the whole demo world at once. */
export const mockWorld = {
  user: demoUser,
  consultations: demoConsultations,
  timeline: demoTimeline,
  streak: demoStreak,
  thread: demoThread,
  nudges: demoNudges,
} as const;
