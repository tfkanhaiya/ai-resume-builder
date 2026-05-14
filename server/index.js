import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

console.log("✅ RUNNING FILE: server.js | MODEL: llama-3.3-70b-versatile");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10kb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many requests, please try again later.",
});
app.use("/generate", limiter);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const logger = {
  info: (msg, data = {}) =>
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data),
  error: (msg, err = {}) =>
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err),
  warn: (msg, data = {}) =>
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data),
};

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server healthy",
    model: "llama-3.3-70b-versatile",
    time: new Date().toISOString(),
  });
});

const validateInput = ({ name, skills, experience, role }) => {
  const errors = [];
  if (!name?.trim()) errors.push("Name is required");
  if (!skills?.trim()) errors.push("Skills are required");
  if (!experience?.trim()) errors.push("Experience is required");
  if (!role?.trim()) errors.push("Role is required");
  return errors;
};

// ✅ Helper to flatten any experience item to a string
const normalizeExperienceItem = (item) => {
  if (typeof item === "string") return item;
  if (typeof item === "object" && item !== null) {
    const parts = [];
    if (item.position) parts.push(item.position);
    if (item.company) parts.push(`at ${item.company}`);
    if (item.duration) parts.push(`(${item.duration})`);
    if (item.achievements) {
      const ach = Array.isArray(item.achievements)
        ? item.achievements.join(", ")
        : item.achievements;
      parts.push(`— ${ach}`);
    }
    return parts.length > 0 ? parts.join(" ") : JSON.stringify(item);
  }
  return String(item);
};

app.post("/generate", async (req, res) => {
  try {
    logger.info("Request received", { body: req.body });

    const errors = validateInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Missing GROQ_API_KEY in .env" });
    }

    const { name, skills, experience, role } = req.body;

    const prompt = `
Create a professional resume.

Name: ${name}
Role: ${role}
Skills: ${skills}
Experience: ${experience}

IMPORTANT: Return ONLY raw valid JSON. No markdown. No backticks. No explanation. Just JSON.
The "experience" field MUST be a plain array of strings. NOT objects. Each string is one bullet point.

{
  "summary": "A short professional summary here",
  "experience": [
    "Worked as X at Y company for Z years doing A and B",
    "Developed X feature using Y technology that improved Z by N%",
    "Led a team of N engineers to deliver X project on time",
    "Reduced system latency by X% through Y optimization",
    "Collaborated with cross-functional teams to ship X product"
  ],
  "coverLetter": "A professional cover letter here"
}
`;

    logger.info("Sending prompt to llama-3.3-70b-versatile...");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume writer. Always respond with valid raw JSON only. No markdown, no backticks, no extra text. The experience field must always be an array of plain strings, never objects.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    let text = completion.choices[0]?.message?.content || "";

    logger.info("AI raw response received", { preview: text.slice(0, 150) });

    // Strip markdown fences just in case
    text = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      logger.error("JSON parse failed", err);
      return res.status(500).json({
        error: "AI returned invalid JSON. Please try again.",
        raw: text,
      });
    }

    // ✅ Normalize experience array — flatten objects to strings if AI ignores instructions
    if (Array.isArray(parsed.experience)) {
      parsed.experience = parsed.experience.map(normalizeExperienceItem);
    }

    // ✅ Normalize summary and coverLetter to strings just in case
    if (typeof parsed.summary !== "string") {
      parsed.summary = JSON.stringify(parsed.summary);
    }
    if (typeof parsed.coverLetter !== "string") {
      parsed.coverLetter = JSON.stringify(parsed.coverLetter);
    }

    res.json({ result: parsed });

  } catch (error) {
    logger.error("Server error", error);

    if (error.message?.includes("429")) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait a moment and try again.",
      });
    }

    if (error.message?.includes("401") || error.message?.includes("API key")) {
      return res.status(500).json({
        error: "Invalid or missing Groq API key. Check your .env file.",
      });
    }

    res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
  console.log("🤖 Model: llama-3.3-70b-versatile (Groq - Free)");
});
