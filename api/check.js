import { plansCache } from "./webhook.js";

export default function handler(req, res) {
  const cached = plansCache["latest"];

  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) { // 10 minutes expiry
    const result = cached.content;
    delete plansCache["latest"]; // Clear after sending
    res.status(200).json({ final_plan: result });
  } else {
    res.status(202).json({ status: "waiting" });
  }
}
