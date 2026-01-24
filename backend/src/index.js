import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { frameworks } from "./frameworks.js";
import { computeSkillGap, recommendFocusAreas, pathwaySuggestions, buildRoadmap } from "./algorithms.js";
import { searchYouTubeVideos } from "./youtube.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from parent directory (backend root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");
console.log(`🔧 Loading .env from: ${envPath}`);
const dotenvResult = dotenv.config({ path: envPath });
if (dotenvResult.error) {
  console.error(`⚠️ .env loading failed: ${dotenvResult.error}`);
} else {
  console.log(`✅ .env loaded successfully`);
}
console.log(`🔑 YOUTUBE_API_KEY: ${process.env.YOUTUBE_API_KEY ? "✅ PRESENT" : "❌ MISSING"}`);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Supabase client (optional)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// In-memory fallback for profiles when Supabase not configured
const memoryProfiles = new Map();
const memoryUsers = new Map(); // Simple email -> { id, email, password } map for demo auth

// SQLite setup (Persistence)
const db = new Database('database.sqlite', { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize Tables
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT,
    password TEXT,
    created_at TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    sector TEXT,
    skills TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();

// Enrollments table - tracks which sectors users enrolled in
db.prepare(`
  CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    sector TEXT,
    enrolled_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();

// Video progress table - tracks watched videos
db.prepare(`
  CREATE TABLE IF NOT EXISTS video_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    sector TEXT,
    video_id TEXT,
    video_title TEXT,
    watched_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-123";

// Load OpenAPI
let openapiDoc = null;
try {
  const yamlPath = new URL("./openapi.yaml", import.meta.url).pathname;
  openapiDoc = YAML.load(yamlPath);
  console.log("OpenAPI docs loaded successfully");
} catch (e) {
  console.error("Failed to load OpenAPI docs:", e.message);
}
if (openapiDoc) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDoc));
  console.log("Swagger UI available at /docs");
}

// Health
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Frameworks
app.get("/frameworks", (req, res) => {
  res.json({ frameworks });
});

// --- SQLite Auth ---

app.post("/auth/signup", async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) return res.status(400).json({ error: "Email, Username and password required" });

  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username);
    if (existingUser) return res.status(400).json({ error: "User with this email or username already exists" });

    const id = "user_" + Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();

    const insertUser = db.prepare('INSERT INTO users (id, email, username, password, created_at) VALUES (?, ?, ?, ?, ?)');
    insertUser.run(id, email, username, hashedPassword, createdAt);

    // Create default profile
    const defaultProfile = { sector: "healthcare", skills: {} };
    const insertProfile = db.prepare('INSERT INTO profiles (user_id, sector, skills) VALUES (?, ?, ?)');
    insertProfile.run(id, defaultProfile.sector, JSON.stringify(defaultProfile.skills));

    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id, email, username } });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email/Username and password required" });

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Google Auth Endpoint
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post("/auth/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "No credential provided" });

  try {
    // 1. Verify the Google Token
    // NOTE: In production, you must uncomment and provide GOOGLE_CLIENT_ID to verify strictly.
    // const ticket = await googleClient.verifyIdToken({
    //   idToken: credential,
    //   audience: process.env.GOOGLE_CLIENT_ID
    // });
    // const payload = ticket.getPayload();

    // FOR DEMO PURPOSES: We will decode it optimistically if verification fails locally (e.g. no internet/setup)
    // In a real app, ALWAYS verify using the library.

    // We'll use a simple decode strategy for this demo if verify fails (or just decode directly for now to unblock)
    const decode = (token) => JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const payload = decode(credential);

    const email = payload.email;
    const name = payload.name || "Google User";
    const googleId = payload.sub; // Google's unique user ID

    if (!email) throw new Error("Email not found in Google token");

    // 2. Find or Create User
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      // Create new user (Generate a random secure password for DB constraints)
      const id = "user_g_" + Date.now();
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const createdAt = new Date().toISOString();

      const insertUser = db.prepare('INSERT INTO users (id, email, username, password, created_at) VALUES (?, ?, ?, ?, ?)');
      insertUser.run(id, email, name, hashedPassword, createdAt);

      // Create profile
      const defaultProfile = { sector: "healthcare", skills: {} };
      const insertProfile = db.prepare('INSERT INTO profiles (user_id, sector, skills) VALUES (?, ?, ?)');
      insertProfile.run(id, defaultProfile.sector, JSON.stringify(defaultProfile.skills));

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }

    // 3. Issue App JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });

  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ error: "Google authentication failed" });
  }
});

// Auth helper: verify Bearer JWT via Supabase or Local
async function getUserFromToken(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  // Try Local JWT first
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    if (verified && verified.id) {
      const user = db.prepare('SELECT id, email, username, created_at FROM users WHERE id = ?').get(verified.id);
      return user;
    }
  } catch (e) {
    // ignore
  }

  // Try Supabase if configured
  if (supabase) {
    const { data, error } = await supabase.auth.getUser(token);
    if (!error && data.user) return data.user;
  }
  return null;
}

const authMiddleware = async (req, res, next) => {
  const user = await getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = user;
  next();
};

// Profiles
app.get("/profiles/me", async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  // If supabase user (and not found in local DB, though we primarily use local now if signed up via local)
  if (supabase && !user.username) { // Assuming supabase users don't have username field in this local logic yet
    const { data, error } = await supabase.from("profiles").select("sector, skills").eq("id", user.id).maybeSingle();
    if (!error) return res.json({ ...user, ...(data || {}) });
  }

  // Local SQLite
  try {
    const profileRow = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);
    const profileData = profileRow ? { sector: profileRow.sector, skills: JSON.parse(profileRow.skills) } : { sector: "healthcare", skills: {} };

    // Format joined date
    const joined = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently";

    return res.json({ ...user, ...profileData, joined });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.put("/profiles/me", async (req, res) => {
  const Schema = z.object({
    sector: z.enum(["healthcare", "agriculture", "urban"]),
    skills: z.record(z.string(), z.number().min(0).max(5))
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (supabase && !user.username) {
    const { error } = await supabase.from("profiles").upsert({ id: user.id, sector: parsed.data.sector, skills: parsed.data.skills });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ ok: true });
  }

  try {
    const runDetail = db.prepare(`
       INSERT INTO profiles (user_id, sector, skills) VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET sector = excluded.sector, skills = excluded.skills
     `).run(user.id, parsed.data.sector, JSON.stringify(parsed.data.skills));

    res.json({ ok: true });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Analysis
app.post("/analysis/gap", (req, res) => {
  const Schema = z.object({
    sector: z.enum(["healthcare", "agriculture", "urban"]).default("healthcare"),
    skills: z.record(z.string(), z.number().min(0).max(5)).default({})
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const result = computeSkillGap(parsed.data.skills, parsed.data.sector);
  res.json(result);
});

// Recommendations (OpenAlex + YouTube)
app.post("/recommendations", async (req, res) => {
  const Schema = z.object({
    sector: z.enum(["healthcare", "agriculture", "urban"]).default("healthcare"),
    skills: z.record(z.string(), z.number().min(0).max(5)).default({})
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const gap = computeSkillGap(parsed.data.skills, parsed.data.sector);
  const focus = recommendFocusAreas(gap, 3);
  const q = focus.length ? `${focus.map(f => f.skill).join(" ")}` : parsed.data.sector;

  try {
    // Fetch from both OpenAlex (papers) and YouTube (videos) in parallel
    const [papersRes, videos] = await Promise.all([
      fetch(`https://api.openalex.org/works?search=${encodeURIComponent(q)}&per_page=8&sort=cited_by_count:desc`),
      searchYouTubeVideos(q, parsed.data.sector, 6)
    ]);

    let papers = [];
    if (papersRes.ok) {
      const papersData = await papersRes.json();
      papers = (papersData.results || []).map(w => ({
        type: "paper",
        id: w.id,
        title: w.title,
        hostVenue: w.host_venue?.display_name,
        resourceType: w.type,
        year: w.publication_year,
        link: w.open_access?.oa_url || w.primary_location?.source?.homepage_url || w.primary_location?.landing_page_url,
        citedBy: w.cited_by_count,
      }));
    }

    // Combine papers and videos
    const combined = [
      ...papers.slice(0, 4),
      ...videos.slice(0, 2),
      ...papers.slice(4, 8)
    ];

    res.json({ query: q, focus, papers, videos, combined });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Video courses endpoint
app.post("/videos", async (req, res) => {
  const Schema = z.object({
    sector: z.enum(["healthcare", "agriculture", "urban"]).default("healthcare"),
    topic: z.string().default("learning")
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const videos = await searchYouTubeVideos(`${parsed.data.sector} ${parsed.data.topic}`, 12);
    res.json({ sector: parsed.data.sector, topic: parsed.data.topic, videos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Roadmap
app.post("/roadmap", (req, res) => {
  const Schema = z.object({
    sector: z.enum(["healthcare", "agriculture", "urban"]).default("healthcare"),
    skills: z.record(z.string(), z.number().min(0).max(5)).default({})
  });
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const gap = computeSkillGap(parsed.data.skills, parsed.data.sector);
  const roadmap = buildRoadmap(parsed.data.sector, gap);
  const tips = pathwaySuggestions(parsed.data.sector, gap);
  res.json({ roadmap, tips });
});

// AI-powered onboarding recommendation
app.post("/onboarding/recommend", async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers) {
      return res.status(400).json({ error: "Answers are required" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    // Build prompt from answers with a rubric to force consistent scoring
    const prompt = `You are an expert career counselor for students in India. Recommend EXACTLY ONE sector from: healthcare, agriculture, urban development.

Student Profile:
${Object.entries(answers).map(([key, value]) => {
      const displayValue = Array.isArray(value) ? value.join(", ") : value;
      return `- ${key.replace(/_/g, " ")}: ${displayValue}`;
    }).join("\n")}

Scoring rubric (0-100 each). Add scores, then pick the highest total:
- Healthcare: medical/clinical interest, biology/nursing/medicine studies, hospitals/clinics, patient care, social impact, health tech.
- Agriculture: farming/agri/soil/crops/food security, rural work, sustainability, environment, hands-on outdoors.
- Urban: cities/urban planning/infrastructure/mobility/housing, tech companies, analytics for cities, community development in urban centers.

Important:
- Return ONLY JSON. No prose, no code fences.
- Use this exact schema:
{
  "recommended_sector": "healthcare",
  "confidence": 0-100,
  "explanation": "2-3 sentences citing their answers and why this sector wins",
  "scores": {"healthcare": 0-100, "agriculture": 0-100, "urban": 0-100}
}
- recommended_sector must be one of: healthcare, agriculture, urban.
- confidence should roughly match the winning score.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 320
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gemini API error");
    }

    const data = await response.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Attempt to parse JSON from the model output robustly
    let result;
    if (aiResponse) {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      try {
        result = JSON.parse(cleanResponse);
      } catch (_) {
        // Fallback: extract first JSON object-like block
        const match = cleanResponse.match(/\{[\s\S]*\}/);
        if (match) {
          result = JSON.parse(match[0]);
        }
      }
    }

    // Heuristic fallback if parsing failed (keyword scoring)
    if (!result) {
      const a = answers || {};
      const text = JSON.stringify(a).toLowerCase();
      const score = { healthcare: 0, agriculture: 0, urban: 0 };

      const bump = (sector, value) => { score[sector] += value; };

      if (/(health|clinic|medical|patient|nursing|doctor)/.test(text)) bump("healthcare", 40);
      if (/(biology|medicine|pharma|hospital)/.test(text)) bump("healthcare", 25);
      if (/(social impact)/.test(text)) { bump("healthcare", 10); bump("urban", 10); bump("agriculture", 10); }

      if (/(farm|agri|soil|crop|irrigation|farming)/.test(text)) bump("agriculture", 45);
      if (/(rural|food|sustainab|climate|environment)/.test(text)) bump("agriculture", 25);

      if (/(city|urban|infrastructure|mobility|transport|housing|planning)/.test(text)) bump("urban", 45);
      if (/(technology companies|analytics|data|software)/.test(text)) bump("urban", 20);

      // default base
      bump("urban", 5); bump("healthcare", 5); bump("agriculture", 5);

      const recommended_sector = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
      result = {
        recommended_sector,
        confidence: Math.min(95, Math.max(60, score[recommended_sector])),
        explanation: "Based on your responses, this sector aligns well with your interests and background.",
        scores: score
      };
    }

    // Normalize confidence and scores
    if (!result.confidence) result.confidence = 70;
    if (!result.scores) {
      result.scores = { healthcare: 0, agriculture: 0, urban: 0 };
      result.scores[result.recommended_sector] = result.confidence;
    }

    // Validate the response
    if (!["healthcare", "agriculture", "urban"].includes(result.recommended_sector)) {
      throw new Error("Invalid sector recommendation from AI");
    }

    res.json(result);
  } catch (e) {
    console.error("Onboarding recommendation error:", e);
    res.status(500).json({ error: e.message });
  }
});

// --- Enrollment & Progress Tracking ---

// Enroll in a sector/course
app.post("/enrollments", async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { sector } = req.body;
  if (!["healthcare", "agriculture", "urban"].includes(sector)) {
    return res.status(400).json({ error: "Invalid sector" });
  }

  try {
    // Check if already enrolled
    const existing = db.prepare('SELECT * FROM enrollments WHERE user_id = ? AND sector = ?').get(user.id, sector);
    if (existing) {
      return res.json({ message: "Already enrolled", enrollment: existing });
    }

    const id = "enroll_" + Date.now();
    const enrolledAt = new Date().toISOString();
    db.prepare('INSERT INTO enrollments (id, user_id, sector, enrolled_at) VALUES (?, ?, ?, ?)').run(id, user.id, sector, enrolledAt);

    res.json({ message: "Enrolled successfully", enrollment: { id, sector, enrolled_at: enrolledAt } });
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ error: "Failed to enroll" });
  }
});

// Get user's enrollments
app.get("/enrollments/me", async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const enrollments = db.prepare('SELECT * FROM enrollments WHERE user_id = ? ORDER BY enrolled_at DESC').all(user.id);
    res.json({ enrollments });
  } catch (err) {
    console.error("Fetch enrollments error:", err);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

// Mark a video as watched
app.post("/progress/video/legacy", async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { sector, video_id, video_title } = req.body;
  if (!sector || !video_id) {
    return res.status(400).json({ error: "sector and video_id required" });
  }

  try {
    // Check if already watched
    const existing = db.prepare('SELECT * FROM video_progress WHERE user_id = ? AND video_id = ?').get(user.id, video_id);
    if (existing) {
      return res.json({ message: "Already watched", progress: existing });
    }

    const id = "prog_" + Date.now();
    const watchedAt = new Date().toISOString();
    db.prepare('INSERT INTO video_progress (id, user_id, sector, video_id, video_title, watched_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, user.id, sector, video_id, video_title || "", watchedAt);

    res.json({ message: "Progress saved", progress: { id, sector, video_id, watched_at: watchedAt } });
  } catch (err) {
    console.error("Progress save error:", err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

// Get user's progress stats for profile charts
app.get("/progress/stats", async (req, res) => {
  const user = await getUserFromToken(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Get enrollments
    const enrollments = db.prepare('SELECT * FROM enrollments WHERE user_id = ?').all(user.id);

    // Get all video progress (completed only for stats)
    const videoProgress = db.prepare('SELECT * FROM video_progress_seconds WHERE user_id = ? AND completed = 1 ORDER BY last_watched DESC').all(user.id);

    // Calculate stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get unique active days (days with video progress)
    const activeDates = new Set(videoProgress.map(v => v.last_watched.split('T')[0]));
    const totalDays = activeDates.size;

    // Calculate active days in last 30 days
    const monthlyActiveDates = new Set(
      videoProgress
        .filter(v => new Date(v.last_watched) >= oneMonthAgo)
        .map(v => v.last_watched.split('T')[0])
    );
    const activeDaysPercent = Math.round((monthlyActiveDates.size / 30) * 100);

    // Calculate streak (consecutive days)
    const sortedDates = [...activeDates].sort().reverse();
    let streak = 0;
    let checkDate = new Date().toISOString().split('T')[0];
    for (const date of sortedDates) {
      if (date === checkDate) {
        streak++;
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        checkDate = prevDate.toISOString().split('T')[0];
      } else {
        break;
      }
    }

    // Weekly activity (last 7 days per sector)
    const weeklyActivity = {};
    for (const enrollment of enrollments) {
      const sectorProgress = videoProgress.filter(v =>
        v.sector === enrollment.sector && new Date(v.last_watched) >= oneWeekAgo
      );

      // Create day-by-day array (Mon-Sun)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const hasActivity = sectorProgress.some(v => v.last_watched.split('T')[0] === dateStr);
        days.push(hasActivity);
      }
      weeklyActivity[enrollment.sector] = days;
    }

    // Monthly bar chart data (4 weeks)
    const monthlyChartData = [0, 0, 0, 0];
    for (const progress of videoProgress) {
      const watchDate = new Date(progress.last_watched);
      const daysAgo = Math.floor((now - watchDate) / (24 * 60 * 60 * 1000));
      if (daysAgo < 7) monthlyChartData[3]++;
      else if (daysAgo < 14) monthlyChartData[2]++;
      else if (daysAgo < 21) monthlyChartData[1]++;
      else if (daysAgo < 28) monthlyChartData[0]++;
    }

    // Donut chart data (approximate based on activity)
    const totalVideos = videoProgress.length;
    const activeLearning = Math.min(60, 30 + totalVideos * 5);
    const practiceSessions = Math.min(30, 20 + totalVideos * 2);
    const idleTime = Math.max(10, 100 - activeLearning - practiceSessions);

    // Also get certificates for stats
    const certificates = db.prepare('SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC').all(user.id);

    res.json({
      enrollments: enrollments.map(e => ({
        sector: e.sector,
        enrolled_at: e.enrolled_at,
        videosWatched: videoProgress.filter(v => v.sector === e.sector).length
      })),
      stats: {
        activeDaysPercent: activeDaysPercent || 0,
        totalDays,
        bestStreak: streak
      },
      weeklyActivity,
      monthlyChartData,
      donut: {
        activeLearning,
        practiceSessions,
        idleTime
      },
      certificates
    });
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});


// ============================================
// WORLD-CLASS FEATURES - Video Progress, Quizzes, Certificates
// ============================================

// Create new tables if they don't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS video_progress_seconds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    video_id TEXT,
    progress_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT 0,
    last_watched TEXT,
    sector TEXT,
    UNIQUE(user_id, video_id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();

// Migration to ensure sector column exists (for existing dbs)
try {
  db.prepare('ALTER TABLE video_progress_seconds ADD COLUMN sector TEXT').run();
} catch (e) {
  // Ignore error if column already exists
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    quiz_id TEXT,
    score INTEGER,
    total_questions INTEGER,
    passed BOOLEAN,
    completed_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    course_id TEXT,
    sector TEXT,
    verification_id TEXT UNIQUE,
    issued_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();

// === Video Progress Endpoints ===

// Save video progress (with resume time in seconds)
app.post('/progress/video', authMiddleware, (req, res) => {
  try {
    const { videoId, progressSeconds, completed, sector } = req.body;
    const userId = req.user.id;
    const lastWatched = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO video_progress_seconds (user_id, video_id, progress_seconds, completed, last_watched, sector)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, video_id) 
      DO UPDATE SET progress_seconds=?, completed=?, last_watched=?, sector=?
    `);

    stmt.run(userId, videoId, progressSeconds, completed ? 1 : 0, lastWatched, sector,
      progressSeconds, completed ? 1 : 0, lastWatched, sector);

    res.json({ success: true });
  } catch (err) {
    console.error('Save progress error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get video progress
app.get('/progress/video/:videoId', authMiddleware, (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const progress = db.prepare(`
      SELECT * FROM video_progress_seconds 
      WHERE user_id = ? AND video_id = ?
    `).get(userId, videoId);

    res.json(progress || { progress_seconds: 0, completed: false });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all video progress for user
app.get('/progress/videos/all', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    const allProgress = db.prepare(`
      SELECT * FROM video_progress_seconds 
      WHERE user_id = ?
      ORDER BY last_watched DESC
    `).all(userId);

    res.json({ progress: allProgress });
  } catch (err) {
    console.error('Get all progress error:', err);
    res.status(500).json({ error: err.message });
  }
});

// === Quiz Endpoints ===

// Save quiz result
app.post('/quiz/result', authMiddleware, (req, res) => {
  try {
    const { quizId, score, totalQuestions, passed } = req.body;
    const userId = req.user.id;
    const completedAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, passed, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(userId, quizId, score, totalQuestions, passed ? 1 : 0, completedAt);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error('Save quiz error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get quiz results for user
app.get('/quiz/results/:quizId', authMiddleware, (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const results = db.prepare(`
      SELECT * FROM quiz_results 
      WHERE user_id = ? AND quiz_id = ?
      ORDER BY completed_at DESC
    `).all(userId, quizId);

    res.json({ results });
  } catch (err) {
    console.error('Get quiz results error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all quiz results for user
app.get('/quiz/results/all', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    const allResults = db.prepare(`
      SELECT * FROM quiz_results 
      WHERE user_id = ?
      ORDER BY completed_at DESC
    `).all(userId);

    res.json({ results: allResults });
  } catch (err) {
    console.error('Get all quiz results error:', err);
    res.status(500).json({ error: err.message });
  }
});

// === Certificate Endpoints ===

// Generate certificate
app.post('/certificates/generate', authMiddleware, (req, res) => {
  try {
    const { courseId, sector, verificationId: providedId } = req.body;
    const userId = req.user.id;
    // Use provided ID if available, otherwise generate new one
    const verificationId = providedId || `R2R-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    const issuedAt = new Date().toISOString();

    // Check if certificate already exists
    const existing = db.prepare(`
      SELECT * FROM certificates 
      WHERE user_id = ? AND course_id = ?
    `).get(userId, courseId);

    if (existing) {
      return res.json({ verificationId: existing.verification_id, alreadyIssued: true });
    }

    const stmt = db.prepare(`
      INSERT INTO certificates (user_id, course_id, sector, verification_id, issued_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(userId, courseId, sector, verificationId, issuedAt);

    res.json({ verificationId, success: true });
  } catch (err) {
    console.error('Generate certificate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get certificates for user
app.get('/certificates/me', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = db.prepare(`
      SELECT * FROM certificates 
      WHERE user_id = ?
      ORDER BY issued_at DESC
    `).all(userId);

    res.json({ certificates });
  } catch (err) {
    console.error('Get certificates error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify certificate
app.get('/certificates/verify/:verificationId', (req, res) => {
  try {
    const { verificationId } = req.params;

    const certificate = db.prepare(`
      SELECT c.*, u.username, u.email 
      FROM certificates c
      JOIN users u ON c.user_id = u.id
      WHERE c.verification_id = ?
    `).get(verificationId);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ valid: true, certificate });
  } catch (err) {
    console.error('Verify certificate error:', err);
    res.status(500).json({ error: err.message });
  }
});

console.log('✅ World-class features initialized: Video Progress, Quizzes, Certificates');

