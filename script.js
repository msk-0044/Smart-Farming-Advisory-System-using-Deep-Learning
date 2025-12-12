// ================== LOCAL "DATABASE" KEYS ==================

const FARMERS_KEY = "sf_farmers_db";
const CURRENT_FARMER_KEY = "sf_current_farmer";
const ADMIN_KEY = "sf_admin";

// Initialize single admin (for demo)
(function initAdmin() {
  if (!localStorage.getItem(ADMIN_KEY)) {
    const admin = {
      email: "admin@sf.com",
      password: "admin123",
    };
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  }

  // For admin dashboard: show number of farmers
  const farmersRaw = localStorage.getItem(FARMERS_KEY);
  const farmers = farmersRaw ? JSON.parse(farmersRaw) : [];
  const countEl = document.getElementById("adminFarmersCount");
  if (countEl) countEl.textContent = farmers.length.toString();
})();

// ===============================
// PERMANENT DEMO FARMER ACCOUNT
// ===============================

const DEMO_FARMER = {
  name: "Demo Farmer",
  mobile: "9637601053",
  password: "demo123",
  village: "DemoVillage",
  crop: "Wheat",
};

// Add demo farmer permanently into localStorage
(function ensureDemoFarmer() {
  let farmers = JSON.parse(localStorage.getItem("sf_farmers") || "[]");

  const exists = farmers.some((f) => f.mobile === DEMO_FARMER.mobile);

  if (!exists) {
    farmers.push(DEMO_FARMER);
    localStorage.setItem("sf_farmers", JSON.stringify(farmers));
  }
})();

// ================== FARMER REGISTRATION ==================

function registerFarmer(event) {
  event.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const mobile = document.getElementById("regMobile").value.trim();
  const village = document.getElementById("regVillage").value.trim();
  const crop = document.getElementById("regCrop").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const msg = document.getElementById("regMessage");

  msg.className = "sf-message";

  if (!name || !mobile || !village || !crop || !password) {
    msg.textContent = "⚠️ All fields are required.";
    msg.classList.add("sf-message--error");
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    msg.textContent = "⚠️ Mobile number must be 10 digits.";
    msg.classList.add("sf-message--error");
    return;
  }

  let farmers = JSON.parse(localStorage.getItem("sf_farmers") || "[]");

  // Prevent duplicate numbers
  if (farmers.some((f) => f.mobile === mobile)) {
    msg.textContent = "❌ Mobile number already registered.";
    msg.classList.add("sf-message--error");
    return;
  }

  // Add new farmer
  const newFarmer = { name, mobile, village, crop, password };
  farmers.push(newFarmer);

  localStorage.setItem("sf_farmers", JSON.stringify(farmers));

  msg.textContent = "✅ Account created! You can now login.";
  msg.classList.add("sf-message--success");

  document.getElementById("regName").value = "";
  document.getElementById("regMobile").value = "";
  document.getElementById("regVillage").value = "";
  document.getElementById("regCrop").value = "";
  document.getElementById("regPassword").value = "";
}

// ================== FARMER LOGIN ==================

function loginFarmer(event) {
  event.preventDefault();

  const mobile = document.getElementById("loginMobile").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const msg = document.getElementById("loginMessage");

  msg.className = "sf-message";

  if (!mobile || !password) {
    msg.textContent = "⚠️ Please enter mobile number and password.";
    msg.classList.add("sf-message--error");
    return;
  }

  // Load all farmers including demo farmer
  const farmers = JSON.parse(localStorage.getItem("sf_farmers") || "[]");

  // Find matching farmer
  const farmer = farmers.find(
    (f) => f.mobile === mobile && f.password === password
  );

  if (!farmer) {
    msg.textContent = "❌ Invalid mobile or password.";
    msg.classList.add("sf-message--error");
    return;
  }

  // Save login session
  localStorage.setItem("sf_current_farmer", JSON.stringify(farmer));

  msg.textContent = "✅ Login successful! Redirecting...";
  msg.classList.add("sf-message--success");

  setTimeout(() => {
    window.location.href = "farmer-dashboard.html";
  }, 700);
}

// ================== ADMIN LOGIN ==================

function loginAdmin(event) {
  event.preventDefault();

  const email = document.getElementById("adminEmail")?.value.trim();
  const password = document.getElementById("adminPassword")?.value.trim();
  const messageEl = document.getElementById("adminMessage");

  if (!messageEl) return;
  messageEl.className = "sf-message";

  if (!email || !password) {
    messageEl.textContent = "⚠️ Please enter email and password.";
    messageEl.classList.add("sf-message--error");
    return;
  }

  const adminRaw = localStorage.getItem(ADMIN_KEY);
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  if (!admin || admin.email !== email || admin.password !== password) {
    messageEl.textContent = "❌ Invalid admin credentials.";
    messageEl.classList.add("sf-message--error");
    return;
  }

  messageEl.textContent = "✅ Admin login successful! Redirecting...";
  messageEl.classList.add("sf-message--success");

  setTimeout(() => {
    window.location.href = "admin-dashboard.html";
  }, 800);
}

// ================== CROP RECOMMENDATION ==================

function recommendCrop() {
  const soil = document.getElementById("soilType")?.value;
  const ph = Number(document.getElementById("ph")?.value);
  const temp = Number(document.getElementById("temp")?.value);
  const rain = Number(document.getElementById("rainfall")?.value);
  const box = document.getElementById("cropResult");
  if (!box) return;

  box.style.display = "block";

  if (!soil || !ph || !temp || !rain) {
    box.innerHTML = "⚠️ Please fill all soil and climate details.";
    return;
  }

  let crops = [];

  if (soil === "black") crops.push("Cotton", "Soybean", "Pigeon Pea");
  if (soil === "loamy") crops.push("Wheat", "Rice", "Maize");
  if (soil === "clay") crops.push("Paddy", "Sugarcane");
  if (soil === "sandy") crops.push("Groundnut", "Millet");

  if (ph < 5.5) crops.push("Potato");
  else if (ph > 7.5) crops.push("Barley");

  let seasonNote = "";
  if (temp > 30 && rain > 150) {
    seasonNote = "Warm conditions with high rainfall.";
  } else if (temp < 22 && rain < 80) {
    seasonNote = "Cool and dry climatic conditions.";
  } else {
    seasonNote = "Moderate conditions.";
  }

  crops = [...new Set(crops)]; // remove duplicates

  box.innerHTML = `
    <b>Recommended Crops:</b> ${crops.join(", ")}<br />
    <b>Seasonal Note:</b> ${seasonNote}
  `;
}

// ================== FERTILIZER ADVICE ==================

function recommendFertilizer() {
  const crop = document.getElementById("cropType")?.value;
  const N = Number(document.getElementById("nitrogen")?.value);
  const P = Number(document.getElementById("phosphorus")?.value);
  const K = Number(document.getElementById("potassium")?.value);
  const box = document.getElementById("fertilizerResult");
  if (!box) return;

  box.style.display = "block";

  if (!crop || !N || !P || !K) {
    box.innerHTML = "⚠️ Please fill crop and all NPK values.";
    return;
  }

  let plan = "";

  if (crop === "rice")
    plan = "Recommended: Urea + DAP with nitrogen in split doses.";
  if (crop === "wheat")
    plan = "Recommended: Urea + SSP + MOP with phosphorus as basal.";
  if (crop === "maize")
    plan = "Recommended: NPK 15:15:15 basal + Urea for top dressing.";
  if (crop === "soybean") plan = "Recommended: SSP + Potash depending on soil.";
  if (crop === "cotton")
    plan = "Recommended: High nitrogen and potassium strategy.";

  let issues = [];
  if (N > P + 40) issues.push("Nitrogen level is high.");
  if (K < N / 2) issues.push("Potassium level is low.");
  if (P < 20) issues.push("Phosphorus level is low.");

  box.innerHTML = `
    <b>Fertilizer Recommendation:</b> ${plan}<br /><br />
    ${
      issues.length
        ? `<b>Nutrient Balance Alerts:</b><br />• ${issues.join("<br />• ")}`
        : ""
    }
  `;
}
0;
// ================== DISEASE DETECTION ==================

// Quick demo result button (no image)
function quickDemoDisease() {
  const diseaseBox = document.getElementById("diseaseResult");
  const adviceBox = document.getElementById("treatmentAdvice");
  const riskBox = document.getElementById("riskLevel");
  const spreadBox = document.getElementById("spreadPrediction");
  if (!diseaseBox || !adviceBox || !riskBox || !spreadBox) return;

  const demoData = {
    disease: "Early Blight",
    confidence: 0.92,
    treatment: {
      organic:
        "Apply a 3% neem oil spray, follow regular crop rotation, and remove infected leaves.",
      chemical:
        "Apply Mancozeb or Chlorothalonil fungicide at the recommended dosage. Repeat every 10-14 days.",
    },
    fertilizerFix:
      "Improve the potassium (K) level, as it strengthens plant immunity. Use a balanced NPK fertilizer.",
    humidity: 78,
    temperature: 29,
  };

  renderDiseaseAdvice(
    demoData,
    diseaseBox,
    adviceBox,
    riskBox,
    spreadBox,
    true
  );
}

// Main detection: leaf validation + (demo) disease result
async function detectDisease() {
  const input = document.getElementById("leafImage");
  const diseaseBox = document.getElementById("diseaseResult");
  const adviceBox = document.getElementById("treatmentAdvice");
  const riskBox = document.getElementById("riskLevel");
  const spreadBox = document.getElementById("spreadPrediction");

  if (!diseaseBox || !adviceBox || !riskBox || !spreadBox) return;

  diseaseBox.style.display = "block";
  adviceBox.style.display = "none";
  riskBox.style.display = "none";
  spreadBox.style.display = "none";

  if (!input || input.files.length === 0) {
    diseaseBox.innerHTML = "⚠️ Please upload a leaf image first.";
    return;
  }

  const file = input.files[0];

  // 1) Leaf validation
  diseaseBox.innerHTML = "⏳ Checking if image contains a leaf...";
  const isLeaf = await validateLeafImage(file);

  if (!isLeaf) {
    diseaseBox.innerHTML =
      "❌ Error: Uploaded image does <b>not</b> look like a plant leaf. Please upload a clear leaf image.";
    return;
  }

  // 2) (Here you would call backend API for disease detection)
  diseaseBox.innerHTML = "⏳ Leaf detected. Running disease detection model...";

  try {
    // Example actual API call (when backend ready):
    //
    // const formData = new FormData();
    // formData.append("leaf_image", file);
    // const response = await fetch("http://localhost:5000/api/detect-disease", {
    //   method: "POST",
    //   body: formData
    // });
    // const data = await response.json();

    // DEMO DATA (fake for college project)
    await new Promise((res) => setTimeout(res, 1000));
    const data = {
      disease: "Leaf Blight",
      confidence: 0.89,
      treatment: {
        organic:
          "Neem oil 3% spray, infected leaves remove karein, proper spacing maintain karein.",
        chemical:
          "Apply copper oxychloride or the recommended fungicide at intervals of 10–14 days.",
      },
      fertilizerFix:
        "Maintain a balanced NPK schedule, reduce overhead irrigation, and apply foliar sprays of micronutrients such as zinc (Zn) and boron (B).",
      humidity: 82,
      temperature: 27,
    };

    renderDiseaseAdvice(data, diseaseBox, adviceBox, riskBox, spreadBox, false);
  } catch (err) {
    console.error(err);
    diseaseBox.innerHTML =
      "⚠️ Could not connect to disease detection API. (Demo mode output only.)";
  }
}

// ========== LEAF VALIDATION (FRONTEND HEURISTIC) ==========
//
// Idea: image ko chhote canvas par draw karke pixels analyse karte hain:
// - Green channel high hona chahiye (G > R + small margin, G > B).
// - Pure white / gray / black area ignore karte hain.
// - Agar total pixels mein se enough 'leaf-like green' pixels milte hain
//   then we assume image contains a leaf.

function validateLeafImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const size = 80; // downscale for speed
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;

        let greenishCount = 0;
        let totalCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];

          if (alpha === 0) continue; // transparent

          const brightness = (r + g + b) / 3;

          // ignore very bright (white paper) or very dark pixels
          if (brightness > 245 || brightness < 20) continue;

          totalCount++;

          const isGreenDominant = g > r + 10 && g > b + 10;
          const notTooYellow = !(r > g && g > b); // rough
          if (isGreenDominant && notTooYellow) {
            greenishCount++;
          }
        }

        const ratio = totalCount ? greenishCount / totalCount : 0;

        // threshold: if less than ~18% pixels are strongly green, probably not leaf
        if (ratio < 0.18) resolve(false);
        else resolve(true);
      };
      img.onerror = function () {
        resolve(false);
      };
      img.src = e.target.result;
    };
    reader.onerror = function () {
      resolve(false);
    };
    reader.readAsDataURL(file);
  });
}

// ========== RENDER DISEASE ADVICE ==========

function renderDiseaseAdvice(
  data,
  diseaseBox,
  adviceBox,
  riskBox,
  spreadBox,
  isDemo
) {
  const confPercent = (data.confidence * 100).toFixed(1);

  diseaseBox.style.display = "block";
  diseaseBox.innerHTML = `
    <b>Disease Detected:</b> ${data.disease}<br />
    <b>Model Confidence:</b> ${confPercent}%<br />
    ${isDemo ? "<small>(Demo mode – static sample result)</small>" : ""}
  `;

  adviceBox.style.display = "block";
  adviceBox.innerHTML = `
    <b>Organic Solution:</b> ${data.treatment.organic}<br /><br />
    <b>Chemical Solution:</b> ${data.treatment.chemical}<br /><br />
    <b>Fertilizer Adjustment:</b> ${data.fertilizerFix}
  `;

  // Simple weather-based risk
  let riskLabel = "Low Risk";
  if (data.humidity > 60 && data.temperature > 24)
    riskLabel = "High Risk (favourable conditions)";
  else if (data.humidity > 45) riskLabel = "Medium Risk";

  riskBox.style.display = "block";
  riskBox.innerHTML = `
    <b>Weather-Based Risk Level:</b> ${riskLabel}<br />
    <b>Humidity:</b> ${data.humidity}% &nbsp; | &nbsp; <b>Temperature:</b> ${data.temperature}°C
  `;

  let spread = "Slow spread expected in current conditions.";
  if (riskLabel.startsWith("High")) {
    spread =
      "⚠ Rapid spread possible next 3–5 days – timely spray & sanitation required.";
  } else if (riskLabel.startsWith("Medium")) {
    spread = "Moderate spread possible – regular monitoring zaroori hai.";
  }

  spreadBox.style.display = "block";
  spreadBox.innerHTML = `<b>Disease Spread Prediction:</b> ${spread}`;
}

// ========== PREVENTION TIPS ==========

function showTips() {
  const box = document.getElementById("tipsResult");
  if (!box) return;
  box.style.display = "block";
  box.innerHTML = `
    <b>General Prevention & Field Health Tips:</b><br />
   • Use certified, disease-free seeds and follow proper seed treatment procedures.<br />
• Practice proper crop rotation—avoid growing the same crop repeatedly in the same field.<br />
• Prevent waterlogging and maintain an effective drainage system in the field.<br />
• Apply balanced fertilizers—excess nitrogen can increase the risk of disease.<br />
• Promptly remove infected leaves or plants and dispose of them outside the field.<br />
• Apply fungicides or pesticides only when needed, always following the recommended dosage and application intervals.<br />

  `;
}

// ⭐ NEW CODE ADDED FOR STATUS BAR ⭐
// ===============================

(function showLoggedInFarmer() {
  const nameBox = document.getElementById("loggedUser");
  if (!nameBox) return; // only run on dashboard

  const farmerRaw = localStorage.getItem("sf_current_farmer");
  if (!farmerRaw) {
    nameBox.textContent = "Not logged in.";
    return;
  }

  const farmer = JSON.parse(farmerRaw);
  nameBox.innerHTML = `👨‍🌾 Logged in as: <b>${farmer.name}</b>`;
})();

// ⭐ NEW: FARMER LOGOUT FUNCTION ⭐
// ===============================
function logoutFarmer() {
  localStorage.removeItem("sf_current_farmer");

  alert("You have been logged out.");

  // Redirect to login page
  window.location.href = "farmer-login.html";
}
