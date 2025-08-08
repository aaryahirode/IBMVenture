let currentPlan = "";

function validateInputs(name, email, bizType, location) {
  const errorMessage = document.getElementById("error-message");

  if (!name || !email || !bizType || !location) {
    // Show the on-page error message instead of an alert
    errorMessage.textContent = "Please fill all fields before continuing.";
    errorMessage.classList.remove("hidden");
    return false;
  }
  
  // Hide the error message if validation passes
  errorMessage.classList.add("hidden");
  return true;
}

async function generatePlan() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const bizType = document.getElementById("bizType").value;
  const location = document.getElementById("location").value;
  
  const loader = document.getElementById("loader");
  const output = document.getElementById("output");
  const generateBtn = document.getElementById("generateBtn");

  // The validation function will now show/hide the error message.
  if (!validateInputs(name, email, bizType, location)) return;
  
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  loader.classList.remove("hidden");
  output.innerHTML = "";

  try {
    const response = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, business_type: bizType, location })
    });

    if (!response.ok) {
        // If the server responds with an error, show it to the user.
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to trigger plan generation.');
    }

    pollForPlan();

  } catch (error) {
    console.error("Error in generatePlan:", error);
    // If the fetch itself fails, re-enable the button and show an error.
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Plan";
    loader.classList.add("hidden");
    output.innerHTML = `<p style="color: red;">Error: Could not connect to the server. Please try again.</p>`;
  }
}

async function pollForPlan() {
  const output = document.getElementById("output");
  const loader = document.getElementById("loader");
  const generateBtn = document.getElementById("generateBtn");
  const converter = new showdown.Converter();

  const interval = setInterval(async () => {
    try {
        const response = await fetch("/api/check");
        const data = await response.json();

        if (data.final_plan) {
          clearInterval(interval);
          loader.classList.add("hidden");
          
          const html = converter.makeHtml(data.final_plan);
          output.innerHTML = html;
          
          currentPlan = data.final_plan;

          generateBtn.disabled = false;
          generateBtn.textContent = "Generate Plan";
        }
    } catch (error) {
        console.error("Polling error:", await response.text());
        clearInterval(interval);
        loader.classList.add("hidden");
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Plan";
        output.innerHTML = `<p style="color: red;">Error: Lost connection while waiting for the plan.</p>`;
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
