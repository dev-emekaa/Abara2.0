/**
 * The seeded demo account. Surfaced on the landing/login screens so a grader is
 * one tap from inside the app. Created by `pnpm db:seed` (and any real signup
 * gets its own starter data via the same seed service).
 */
export const DEMO_CREDENTIALS = {
  email: "demo@abara.health",
  password: "demo1234",
} as const;
