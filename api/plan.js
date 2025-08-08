import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, business_type, location } = req.body;

  const payload = {
    inputs: {
      name,
      email,
      business_type,
      location,
      callback_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/webhook`
    }
  };

  try {
    await fetch(process.env.RELAY_TRIGGER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    res.status(200).json({ status: "Triggered" });
  } catch (error) {
    console.error("Error triggering Relay:", error);
    res.status(500).json({ error: "Failed to trigger Relay" });
  }
}
