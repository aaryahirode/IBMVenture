import kv from "../lib/kv.js";

export default async function handler(req, res) {
  const plan = await kv.get("latest_plan");

  if (plan) {
    await kv.del("latest_plan"); // one-time display
    return res.status(200).json({ final_plan: plan });
  } else {
    return res.status(202).json({ status: "waiting" });
  }
}
