import kv from "../lib/kv.js";

export default async function handler(req, res) {
  try {
    const plan = await kv.get("latest_plan");

    if (plan) {
      await kv.del("latest_plan"); // show only once
      return res.status(200).json({ final_plan: plan });
    } else {
      return res.status(202).json({ status: "waiting" });
    }
  } catch (error) {
    console.error("❌ KV error in /api/check:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
