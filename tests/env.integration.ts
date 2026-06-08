/**
 * Runs before the test framework in each worker. Points Prisma at the dedicated
 * TEST database so integration tests never touch dev data.
 */
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}
// Keep AI off in tests — the companion suite exercises the guardrail + DB only.
process.env.GEMINI_API_KEY = "";
process.env.EMAIL_PROVIDER = "console";
