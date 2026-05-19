import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        reply: "Assistant is offline. GROQ_API_KEY is missing in .env file.",
      });
    }

    if (!message) {
      return res.status(400).json({
        reply: "Please type a message first.",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are KashiBot, a friendly portfolio assistant for Kashish Khubchandani. Answer only about Kashish's portfolio, skills, projects, experience, education, resumes, contact, product management, data analytics, business analysis, and BI. Keep answers short, helpful, warm, and professional.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    res.json({
      reply: completion.choices[0]?.message?.content || "I could not generate a response.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      reply: "Assistant is offline right now. Please check backend server and Groq API key.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
});