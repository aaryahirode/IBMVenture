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
  
  const loader = document.getElementById("loader");
  const output = document.getElementById("output");
  const generateBtn = document.getElementById("generateBtn"); // Get the button

  if (!validateInputs(name, email, bizType, location)) return;
  
  // Disable button and show loading state
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  loader.classList.remove("hidden");
  output.innerHTML = "";

  await fetch("/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, business_type: bizType, location })
  });

  pollForPlan();
}

async function pollForPlan() {
  const output = document.getElementById("output");
  const loader = document.getElementById("loader");
  const generateBtn = document.getElementById("generateBtn"); // Get the button
  const converter = new showdown.Converter();

  const interval = setInterval(async () => {
    const response = await fetch("/api/check");
    const data = await response.json();

    if (data.final_plan) {
      clearInterval(interval);
      loader.classList.add("hidden");
      
      const html = converter.makeHtml(data.final_plan);
      output.innerHTML = html;
      
      currentPlan = data.final_plan;

      // Re-enable the button and restore its text
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Plan";
    }
  }, 3000);
}

function copyToClipboard() {
  const output = document.getElementById("output");
  navigator.clipboard.writeText(output.innerText).then(() => {
    const copyBtn = document.getElementById("copyBtn");
    copyBtn.textContent = "✅ Copied!";
    setTimeout(() => {
      copyBtn.textContent = "📋 Copy";
    }, 1500);
  });
}
