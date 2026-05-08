import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

router.post("/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body as {
      messages: { role: "system" | "user" | "assistant"; content: string }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages,
      max_completion_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content || "لا توجد استجابة";
    res.json({ content });
  } catch (error) {
    req.log.error({ error }, "AI chat error");
    res.status(500).json({ error: "فشل الاتصال بالذكاء الاصطناعي" });
  }
});

export default router;
