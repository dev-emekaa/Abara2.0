import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini wrapper. The free tier is fragile, so every path here degrades
 * gracefully: if the key is missing/placeholder, or the API rate-limits or
 * errors after retries, the caller falls back to a safe canned reply.
 */

const PLACEHOLDER_KEYS = new Set(["", "your-key-here", "changeme"]);

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY?.trim() ?? "";
  return key.length > 10 && !PLACEHOLDER_KEYS.has(key);
}

function getModelName(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

export interface GeminiTurn {
  role: "USER" | "AI";
  content: string;
}

export interface StreamOptions {
  systemPrompt: string;
  history: GeminiTurn[];
  message: string;
}

class GeminiError extends Error {}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRateLimit(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|rate.?limit|quota|resource.?exhausted/i.test(msg);
}

/**
 * Stream a companion reply token-by-token. Retries the initial request with
 * exponential backoff (handling 429s); throws GeminiError if it can't start,
 * so the route handler can fall back.
 */
export async function* streamGeminiReply(
  opts: StreamOptions,
): AsyncGenerator<string> {
  if (!isGeminiConfigured()) {
    throw new GeminiError("Gemini is not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.trim());
  const model = genAI.getGenerativeModel({
    model: getModelName(),
    systemInstruction: opts.systemPrompt,
  });

  const history = opts.history
    .filter((t) => t.content.trim().length > 0)
    .map((t) => ({
      role: t.role === "AI" ? "model" : "user",
      parts: [{ text: t.content }],
    }));

  const chat = model.startChat({
    history,
    generationConfig: { maxOutputTokens: 220, temperature: 0.6 },
  });

  const MAX_ATTEMPTS = 3;
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const result = await chat.sendMessageStream(opts.message);
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
      return;
    } catch (err) {
      lastErr = err;
      // Don't retry non-transient errors (bad key, blocked content, etc.).
      if (!isRateLimit(err) || attempt === MAX_ATTEMPTS - 1) break;
      await sleep(2 ** attempt * 500); // 500ms, 1s, 2s
    }
  }
  throw new GeminiError(
    `Gemini request failed: ${
      lastErr instanceof Error ? lastErr.message : "unknown error"
    }`,
  );
}

/**
 * One-shot, non-streaming generation for short tasks (e.g. polishing a summary).
 * Returns null on any failure or when unconfigured, so callers fall back.
 */
export async function generateText(
  prompt: string,
  maxOutputTokens = 80,
): Promise<string | null> {
  if (!isGeminiConfigured()) return null;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.trim());
    const model = genAI.getGenerativeModel({ model: getModelName() });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens, temperature: 0.4 },
    });
    const text = result.response.text().trim();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

export { GeminiError };
