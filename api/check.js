import { latestPlan } from "./webhook.js";

export default function handler(req, res) {
  if (latestPlan) {
    const result = latestPlan;
    // Clear the plan once served
    latestPlan = null;
    res.status(200).json({ final_plan: result });
  } else {
    res.status(202).json({ status: "waiting" });
  }
}
