import { getCurrentUser } from "@/lib/auth/session";
import { isGeminiConfigured, streamGeminiReply } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Diagnostic: tells you whether the live Care Companion AI is actually working,
 * and if not, WHY. Auth-required so it's not abusable. Open it in the browser
 * while signed in:  /api/ai-check
 *
 * Safe to leave in; it reveals config presence and error reasons, never secrets.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Sign in first, then open this URL." }, { status: 401 });
  }

  const key = process.env.GEMINI_API_KEY ?? "";
  const info = {
    configured: isGeminiConfigured(),
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash (default)",
    keyPresent: key.length > 0,
    keyLength: key.length,
    keyHasQuotes: key.startsWith('"') || key.startsWith("'"),
    keyHasWhitespace: key !== key.trim(),
  };

  let test: { ok: boolean; sample?: string; error?: string };
  try {
    let out = "";
    for await (const tok of streamGeminiReply({
      systemPrompt: "You are a test. Reply with a short greeting.",
      history: [],
      message: "Say hello in 4 words.",
    })) {
      out += tok;
    }
    test = { ok: true, sample: out.slice(0, 80) };
  } catch (err) {
    test = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  return Response.json({ ...info, test });
}
