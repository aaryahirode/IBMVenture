import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let latestPlan = null;

// Vercel provides the base URL automatically through an environment variable.
// It will be something like "my-app-name.vercel.app".
// We fall back to a local URL for local testing.
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// This handles the root path to serve your index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.post("/api/plan", async (req, res) => {
  const { name, email, business_type, location } = req.body;

  // The webhook URL is now constructed dynamically based on the deployment URL
  const webhookUrl = `${BASE_URL}/api/webhook`;
  console.log(`Sending webhook callback to: ${webhookUrl}`);

  const payload = {
    inputs: {
      name,
      email,
      business_type,
      location,
      callback_url: webhookUrl
    }
  };

  try {
    await fetch(process.env.RELAY_TRIGGER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    res.json({ status: "Triggered" });
  } catch (error) {
    console.error("Error triggering Relay:", error);
    res.status(500).json({ error: "Failed to trigger Relay" });
  }
});

app.post("/api/webhook", (req, res) => {
  const { outputs } = req.body;

  if (outputs?.final_plan) {
    latestPlan = outputs.final_plan;
    console.log("✅ Plan received from Relay");
    res.status(200).json({ ok: true });
  } else {
    console.warn("⚠️ Missing final_plan in webhook");
    res.status(400).json({ error: "No final_plan received" });
  }
});

app.get("/api/check", (req, res) => {
  if (latestPlan) {
    const result = latestPlan;
    latestPlan = null; // Clear after sending
    res.json({ final_plan: result });
  } else {
    res.status(202).json({ status: "waiting" });
  }
});

// Vercel doesn't use app.listen(). Instead, we export the app.
// For local development, you can run `vercel dev` which will use this export.
export default app;
