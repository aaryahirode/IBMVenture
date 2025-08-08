import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { createServer } from "http";
import { handler } from "vercel-node-express"; // We will simulate this behavior manually

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let latestPlan = null;

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/plan", async (req, res) => {
  const { name, email, business_type, location } = req.body;

  const webhookUrl = `${BASE_URL}/api/webhook`;
  console.log(`Sending webhook callback to: ${webhookUrl}`);

  const payload = {
    inputs: {
      name,
      email,
      business_type,
      location,
      callback_url: webhookUrl,
    },
  };

  try {
    await fetch(process.env.RELAY_TRIGGER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    latestPlan = null;
    res.json({ final_plan: result });
  } else {
    res.status(202).json({ status: "waiting" });
  }
});

// ✅ Here's the Vercel-compatible export
export default app;
