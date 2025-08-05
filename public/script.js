let currentPlan = "";

function validateInputs(name, email, bizType, location) {
  if (!name || !email || !bizType || !location) {
    alert("Please fill all fields before continuing.");
    return false;
  }
  return true;
}

async function generatePlan() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const bizType = document.getElementById("bizType").value;
  const location = document.getElementById("location").value;

  if (!validateInputs(name, email, bizType, location)) return;

  await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, business_type: bizType, location })
  });

  pollForPlan();
}

async function pollForPlan() {
  const output = document.getElementById("output");

  const interval = setInterval(async () => {
    const response = await fetch("/api/check");
    const data = await response.json();

    if (data.final_plan) {
      clearInterval(interval);
      output.value = data.final_plan;
      currentPlan = data.final_plan;
    }
  }, 3000);
}

function revisePlan() {
  document.getElementById("editPrompt").style.display = "block";
  document.querySelector('button[onclick="submitRevision()"]').style.display = "block";
}

async function submitRevision() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const bizType = document.getElementById("bizType").value;
  const location = document.getElementById("location").value;
  const editPrompt = document.getElementById("editPrompt").value;

  if (!validateInputs(name, email, bizType, location)) return;

  await fetch("/api/revise", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      business_type: bizType,
      location,
      custom_prompt: editPrompt,
      previous_plan: currentPlan
    })
  });

  pollForPlan();
}
