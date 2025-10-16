import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors({ origin: "*" })); // you can lock this later to your Netlify domain
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Easy Reach chatbot API is running ✅");
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message || "";

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // never hardcode your key here; Render will inject it as an env var
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are Easy Reach Assistant — the friendly support bot for Easy Reach (Epe’s fastest local delivery platform).
- Always say "Easy Reach" (not just "Epe").
- Be concise, helpful, and warm.
- If asked unrelated things, give a short correct answer THEN politely steer back to Easy Reach (orders, delivery, payments, vendors, riders).
- If user asks for a human, say you'll connect them and include the phrase "connect you to a live agent".
            `
          },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || "Sorry, I couldn’t understand that.";
    const handoff = text.toLowerCase().includes("connect you to a live agent");

    res.json({ reply: text, handoff });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ reply: "⚠️ Server error. Please try again later." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
