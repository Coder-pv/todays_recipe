import { Router } from "express";

const router = Router();

/**
 * Stub Gen AI endpoint — replace or extend with your provider (OpenAI, etc.).
 * Body: { "prompt": string, "messages"?: { role, content }[] }
 */
router.post("/chat", async (req, res, next) => {
  try {
    const { prompt, messages } = req.body ?? {};
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && prompt) {
      const userContent =
        typeof prompt === "string"
          ? prompt
          : Array.isArray(messages)
            ? messages.map((m) => `${m.role}: ${m.content}`).join("\n")
            : "";

      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: userContent || "(empty prompt)" },
          ],
        }),
      });

      if (!r.ok) {
        const errText = await r.text();
        return res.status(502).json({ error: "OpenAI request failed", detail: errText });
      }

      const data = await r.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      return res.json({ reply: text, source: "openai" });
    }

    // Template fallback when no key or no prompt
    res.json({
      reply:
        "[Template] Set OPENAI_API_KEY in server/.env and send { \"prompt\": \"...\" } to use OpenAI. " +
        "Until then, this is a stub response.",
      source: "stub",
    });
  } catch (e) {
    next(e);
  }
});

export default router;
