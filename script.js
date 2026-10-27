// Paste your deployed Google Apps Script Web App URL here:
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykX4o72pPfgO7h4EYY3mk0dwssrG_8plN_9uWA0shgMWTro-uLXWyt4bqDkMmICGxEhQ/exec";

// Security Passcode Settings
const DEFAULT_PASSCODE = "fromwombtothetomb";

let classroomData = {};
let activeClass = "";
let turtles = [];
let particles = [];

// Lock Screen & Responsive Controls Toggle
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("passwordLockOverlay");
  const input = document.getElementById("passcodeInput");
  const unlockBtn = document.getElementById("unlockBtn");
  const relockBtn = document.getElementById("relockBtn");
  const errorMsg = document.getElementById("lockErrorMessage");
  
  const sidebar = document.getElementById("appSidebar");
  const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");

  function attemptUnlock() {
    if (input.value.trim() === DEFAULT_PASSCODE) {
      overlay.style.display = "none";
      errorMsg.style.display = "none";
      input.value = "";
    } else {
      errorMsg.style.display = "block";
      input.value = "";
      input.focus();
    }
  }

  unlockBtn.addEventListener("click", attemptUnlock);
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") attemptUnlock();
  });

  relockBtn.addEventListener("click", () => {
    overlay.style.display = "flex";
    input.focus();
  });

  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }
});

// Canvas Setup
const canvas = document.getElementById("aquariumCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
resizeCanvas();

// --- Particle Trail System ---
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 3 + 1;
    this.alpha = 1;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.02;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- Enhanced Infinite Turtle Engine ---
class Turtle {
  constructor(name, points) {
    this.name = name;
    this.points = points;
    this.x = Math.random() * (canvas.width - 160) + 80;
    this.y = Math.random() * (canvas.height - 160) + 80;
    
    // Swimming Physics
    this.speed = 1.2 + Math.random() * 0.5;
    this.angle = Math.random() * Math.PI * 2;
    this.targetAngle = this.angle;
    this.flipperSwimTimer = Math.random() * 100;
  }

  // Infinite Stage Evolution Math
  getStage() {
    if (this.points < 100) return 1;  // Hatchling
    if (this.points < 200) return 2;  // Armored Cyan
    if (this.points < 350) return 3;  // Mystic Purple
    if (this.points < 500) return 4;  // Cosmic Golden
    if (this.points < 750) return 5;  // Leviathan
    
    // Infinite God Tier Scaling past 750+ (Stage 6, 7, 8...)
    return 5 + Math.floor((this.points - 750) / 250);
  }

  // Dynamic Scale: Increases smoothly with points endlessly
  getSize() {
    const scaleFactor = canvas.width < 600 ? 0.75 : 1;
    const baseSize = 24 + Math.sqrt(this.points) * 2.8; 
    return Math.min(baseSize, 120) * scaleFactor; // Smooth non-capped scale curve
  }

  getStageTitle() {
    const stage = this.getStage();
    if (stage === 1) return "Hatchling";
    if (stage === 2) return "Armored Shell";
    if (stage === 3) return "Mystic Cyber";
    if (stage === 4) return "Cosmic Leviathan";
    if (stage === 5) return "Ocean Dragon";
    return `Celestial God T-${stage - 5}`;
  }

  update() {
    // Smooth Direction Wobble
    if (Math.random() < 0.02) {
      this.targetAngle += (Math.random() - 0.5) * 1.2;
    }
    
    // Turn smoothly towards target angle
    this.angle += (this.targetAngle - this.angle) * 0.05;

    // Movement Velocity
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;

    this.x += vx;
    this.y += vy;
    this.flipperSwimTimer += 0.08;

    // Boundary Bounce
    const margin = 60;
    if (this.x < margin) { this.x = margin; this.targetAngle = Math.PI - this.angle; }
    if (this.x > canvas.width - margin) { this.x = canvas.width - margin; this.targetAngle = Math.PI - this.angle; }
    if (this.y < margin) { this.y = margin; this.targetAngle = -this.angle; }
    if (this.y > canvas.height - margin) { this.y = canvas.height - margin; this.targetAngle = -this.angle; }

    // Spawn Particles for Stage 3+
    if (this.getStage() >= 3 && Math.random() < 0.4) {
      const colors = ["#80deea", "#b388ff", "#ffd54f", "#ff80ab"];
      const c = colors[this.getStage() % colors.length];
      particles.push(new Particle(this.x, this.y, c));
    }
  }

  draw() {
    const stage = this.getStage();
    const size = this.getSize();
    const flipperAngle = Math.sin(this.flipperSwimTimer) * 0.35;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2); // Facing direction

    // Palette per Evolution
    let primaryColor = "#2e7d32"; 
    let secondaryColor = "#81c784"; 
    let auraColor = "rgba(76, 175, 80, 0.4)";

    if (stage === 2) { primaryColor = "#00838f"; secondaryColor = "#4dd0e1"; auraColor = "rgba(0, 188, 212, 0.5)"; }
    if (stage === 3) { primaryColor = "#6a1b9a"; secondaryColor = "#ba68c8"; auraColor = "rgba(156, 39, 176, 0.6)"; }
    if (stage === 4) { primaryColor = "#f57f17"; secondaryColor = "#fff176"; auraColor = "rgba(255, 215, 0, 0.7)"; }
    if (stage >= 5) { primaryColor = "#c62828"; secondaryColor = "#ff8a80"; auraColor = "rgba(255, 82, 82, 0.8)"; }

    // Aura Glow Effect for higher stages
    if (stage >= 2) {
      ctx.shadowBlur = 12 + stage * 4;
      ctx.shadowColor = auraColor;
    }

    // --- 1. Flippers (Animated Paddling) ---
    ctx.fillStyle = primaryColor;
    
    // Front Left Flipper
    ctx.save();
    ctx.translate(-size * 0.6, -size * 0.3);
    ctx.rotate(-0.5 + flipperAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.5, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Front Right Flipper
    ctx.save();
    ctx.translate(size * 0.6, -size * 0.3);
    ctx.rotate(0.5 - flipperAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.5, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Rear Flippers
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.ellipse(-size * 0.4, size * 0.6, size * 0.25, size * 0.12, 0.4, 0, Math.PI * 2);
    ctx.ellipse(size * 0.4, size * 0.6, size * 0.25, size * 0.12, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // --- 2. Head & Eyes ---
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(0, -size * 0.8, size * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-size * 0.15, -size * 0.9, size * 0.08, 0, Math.PI * 2);
    ctx.arc(size * 0.15, -size * 0.9, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(-size * 0.15, -size * 0.92, size * 0.04, 0, Math.PI * 2);
    ctx.arc(size * 0.15, -size * 0.92, size * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Evolution Crown/Horns for Stage 4+
    if (stage >= 4) {
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.moveTo(-size * 0.2, -size * 1.05);
      ctx.lineTo(0, -size * 1.3);
      ctx.lineTo(size * 0.2, -size * 1.05);
      ctx.closePath();
      ctx.fill();
    }

    // --- 3. Shell (Main Body with Pattern Plate Grid) ---
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.7, size * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = secondaryColor;
    ctx.stroke();

    // Hexagonal Inner Shell Plate Patterns
    ctx.fillStyle = secondaryColor;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#020d18";

    // Center Plate
    ctx.beginPath();
    ctx.arc(0, -size * 0.1, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, size * 0.35, size * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // --- 4. Floating Student Name & Stage Info Tag ---
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${this.name}`, this.x, this.y + size + 16);

    ctx.fillStyle = secondaryColor;
    ctx.font = "11px sans-serif";
    ctx.fillText(`${this.getStageTitle()} • ${this.points} pts`, this.x, this.y + size + 30);
    ctx.restore();
  }
}

// --- Application Logic ---
async function fetchSheetData() {
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    classroomData = await res.json();
    updateClassDropdown();
  } catch (err) {
    console.error("Failed to connect to Google Sheets:", err);
  }
}

function updateClassDropdown() {
  const dropdown = document.getElementById("classDropdown");
  dropdown.innerHTML = "";

  const classNames = Object.keys(classroomData);
  if (classNames.length === 0) {
    dropdown.innerHTML = `<option value="">No classrooms found</option>`;
    return;
  }

  classNames.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    dropdown.appendChild(opt);
  });

  if (!activeClass) activeClass = classNames[0];
  dropdown.value = activeClass;
  loadClassroom(activeClass);
}

function loadClassroom(className) {
  activeClass = className;
  document.getElementById("activeClassTitle").textContent = `Class: ${className}`;

  const students = classroomData[className] || [];
  turtles = students.map(s => new Turtle(s.name, s.points));

  renderStudentFeedList(students);
}

function renderStudentFeedList(students) {
  const list = document.getElementById("studentList");
  list.innerHTML = "";

  students.forEach(student => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
      <span><b>${student.name}</b> (${student.points} pts)</span>
      <div class="feed-btn-group">
        <button class="feed-btn" onclick="feedStudent('${student.name}', 10)">+10</button>
        <button class="feed-btn" onclick="feedStudent('${student.name}', 25)">+25</button>
        <button class="feed-btn" onclick="feedStudent('${student.name}', 50)">+50</button>
      </div>
    `;
    list.appendChild(card);
  });
}

async function feedStudent(studentName, points) {
  const turtle = turtles.find(t => t.name === studentName);
  if (turtle) turtle.points += points;

  const student = classroomData[activeClass].find(s => s.name === studentName);
  if (student) student.points += points;

  renderStudentFeedList(classroomData[activeClass]);

  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "feedTurtle",
      className: activeClass,
      studentName: studentName,
      points: points
    })
  });
}

// Control Event Listeners
document.getElementById("createClassBtn").addEventListener("click", async () => {
  const input = document.getElementById("newClassInput");
  const className = input.value.trim();
  if (!className) return;

  activeClass = className;
  classroomData[className] = [];
  input.value = "";

  updateClassDropdown();

  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "createClassroom", className: className })
  });
});

document.getElementById("addStudentsBtn").addEventListener("click", async () => {
  const textarea = document.getElementById("bulkStudentInput");
  const names = textarea.value.split("\n").map(n => n.trim()).filter(n => n.length > 0);

  if (!activeClass || names.length === 0) return;

  textarea.value = "";

  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "addBulkStudents",
      className: activeClass,
      students: names
    })
  });

  fetchSheetData();
});

document.getElementById("classDropdown").addEventListener("change", (e) => {
  loadClassroom(e.target.value);
});

document.getElementById("syncSheetBtn").addEventListener("click", fetchSheetData);

// Animation Engine Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Render Trails
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }

  // Render Turtles
  turtles.forEach(turtle => {
    turtle.update();
    turtle.draw();
  });

  requestAnimationFrame(animate);
}

// Start Engine
fetchSheetData();
animate();
