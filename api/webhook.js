let latestPlan = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { outputs } = req.body;

  if (outputs?.final_plan) {
    latestPlan = outputs.final_plan;
    console.log("✅ Plan received from Relay");
    res.status(200).json({ ok: true });
  } else {
    console.warn("⚠️ Missing final_plan in webhook");
    res.status(400).json({ error: "No final_plan received" });
  }
}

// Export to allow api/check to read it
export { latestPlan };
