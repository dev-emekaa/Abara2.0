import { execSync } from "node:child_process";

/**
 * Push the Prisma schema to the TEST database once before the integration suite.
 * Uses `db push` (no migration history needed for an ephemeral test DB).
 */
export default async function globalSetup(): Promise<void> {
  const url = process.env.DATABASE_URL_TEST;
  if (!url) {
    throw new Error(
      "DATABASE_URL_TEST is not set — start the test DB (docker compose up -d) and configure .env",
    );
  }
  execSync("pnpm exec prisma db push --skip-generate --accept-data-loss", {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });
}
