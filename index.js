import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import ngrok from "ngrok";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

let latestPlan = null;
let BASE_URL = "";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  try {
    BASE_URL = await ngrok.connect({
      addr: port,
      authtoken: process.env.NGROK_AUTHTOKEN, // Required!
    });
    console.log(`🌐 Ngrok public URL: ${BASE_URL}`);
    console.log(`📩 Webhook will be sent to: ${BASE_URL}/webhook`);
  } catch (err) {
    console.error("❌ Error starting ngrok:", err);
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.post("/api/plan", async (req, res) => {
  const { name, email, business_type, location } = req.body;

  const payload = {
    inputs: {
      name,
      email,
      business_type,
      location,
      callback_url: `${BASE_URL}/webhook`
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

app.post("/webhook", (req, res) => {
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

