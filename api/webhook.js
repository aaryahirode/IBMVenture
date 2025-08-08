import kv from "../lib/kv.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { outputs } = req.body;

  if (outputs?.final_plan) {
    await kv.set("latest_plan", outputs.final_plan, { ex: 600 }); // expires in 10 mins
    console.log("✅ Stored plan in Vercel KV");
    return res.status(200).json({ ok: true });
  } else {
    console.warn("⚠️ Missing final_plan in webhook");
    return res.status(400).json({ error: "No final_plan received" });
  }
}
