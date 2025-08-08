import plansCache from "./cache.js";

export default function handler(req, res) {
  const cached = plansCache["latest"];
  console.log("📦 Reading plan from cache:", cached);

  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
    const result = cached.content;
    delete plansCache["latest"];
    res.status(200).json({ final_plan: result });
  } else {
    res.status(202).json({ status: "waiting" });
  }
}
