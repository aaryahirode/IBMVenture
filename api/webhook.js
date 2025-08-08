const plansCache = {};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { outputs } = req.body;

  if (outputs?.final_plan) {
    // Store plan with timestamp (to auto-expire)
    plansCache["latest"] = {
      content: outputs.final_plan,
      timestamp: Date.now()
    };

    console.log("✅ Plan received from Relay");
    res.status(200).json({ ok: true });
  } else {
    console.warn("⚠️ Missing final_plan in webhook");
    res.status(400).json({ error: "No final_plan received" });
  }
}

// Export to allow api/check to access it
export { plansCache };
