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

// --- Turtle Class ---
class Turtle {
  constructor(name, points) {
    this.name = name;
    this.points = points;

    // Spawn safely inside canvas bounds
    const padding = 100;
    this.x = Math.random() * Math.max(100, canvas.width - padding * 2) + padding;
    this.y = Math.random() * Math.max(100, canvas.height - padding * 2) + padding;
    
    this.speed = 1.0 + Math.random() * 0.6;
    this.angle = Math.random() * Math.PI * 2;
    this.flipperSwimTimer = Math.random() * 100;
  }

  getStage() {
    if (this.points < 100) return 1;  // Hatchling
    if (this.points < 200) return 2;  // Armored Cyan
    if (this.points < 350) return 3;  // Mystic Purple
    if (this.points < 500) return 4;  // Cosmic Golden
    if (this.points < 750) return 5;  // Leviathan
    return 5 + Math.floor((this.points - 750) / 250);
  }

  getSize() {
    const scaleFactor = canvas.width < 600 ? 0.75 : 1;
    const baseSize = 22 + Math.sqrt(this.points) * 2.5; 
    return Math.min(baseSize, 110) * scaleFactor;
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
    // Gentle angle random changes
    this.angle += (Math.random() - 0.5) * 0.08;

    // Movement
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.flipperSwimTimer += 0.08;

    // FIXED BOUNDARY BOUNCE (Prevents turtles getting trapped in corners)
    const margin = this.getSize() + 30;
    
    if (this.x < margin) {
      this.x = margin;
      this.angle = Math.atan2(Math.sin(this.angle), Math.abs(Math.cos(this.angle)));
    } else if (this.x > canvas.width - margin) {
      this.x = canvas.width - margin;
      this.angle = Math.atan2(Math.sin(this.angle), -Math.abs(Math.cos(this.angle)));
    }

    if (this.y < margin) {
      this.y = margin;
      this.angle = Math.atan2(Math.abs(Math.sin(this.angle)), Math.cos(this.angle));
    } else if (this.y > canvas.height - margin) {
      this.y = canvas.height - margin;
      this.angle = Math.atan2(-Math.abs(Math.sin(this.angle)), Math.cos(this.angle));
    }

    // Particles for higher stages
    if (this.getStage() >= 3 && Math.random() < 0.3) {
      const colors = ["#80deea", "#b388ff", "#ffd54f", "#ff80ab"];
      particles.push(new Particle(this.x, this.y, colors[this.getStage() % colors.length]));
    }
  }

  draw() {
    const stage = this.getStage();
    const size = this.getSize();
    const flipperAngle = Math.sin(this.flipperSwimTimer) * 0.35;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2);

    let primaryColor = "#2e7d32"; 
    let secondaryColor = "#81c784"; 
    let auraColor = "rgba(76, 175, 80, 0.4)";

    if (stage === 2) { primaryColor = "#00838f"; secondaryColor = "#4dd0e1"; auraColor = "rgba(0, 188, 212, 0.5)"; }
    if (stage === 3) { primaryColor = "#6a1b9a"; secondaryColor = "#ba68c8"; auraColor = "rgba(156, 39, 176, 0.6)"; }
    if (stage === 4) { primaryColor = "#f57f17"; secondaryColor = "#fff176"; auraColor = "rgba(255, 215, 0, 0.7)"; }
    if (stage >= 5) { primaryColor = "#c62828"; secondaryColor = "#ff8a80"; auraColor = "rgba(255, 82, 82, 0.8)"; }

    if (stage >= 2) {
      ctx.shadowBlur = 12 + stage * 3;
      ctx.shadowColor = auraColor;
    }

    // Flippers
    ctx.fillStyle = primaryColor;
    
    // Front Flippers
    ctx.save();
    ctx.translate(-size * 0.55, -size * 0.25);
    ctx.rotate(-0.5 + flipperAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.45, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(size * 0.55, -size * 0.25);
    ctx.rotate(0.5 - flipperAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.45, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Head
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(0, -size * 0.75, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.85, size * 0.07, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.85, size * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.87, size * 0.035, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.87, size * 0.035, 0, Math.PI * 2);
    ctx.fill();

    // Crown for Stage 4+
    if (stage >= 4) {
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.moveTo(-size * 0.18, -size * 1.0);
      ctx.lineTo(0, -size * 1.25);
      ctx.lineTo(size * 0.18, -size * 1.0);
      ctx.closePath();
      ctx.fill();
    }

    // Shell
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.65, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = secondaryColor;
    ctx.stroke();

    // Shell Pattern
    ctx.fillStyle = secondaryColor;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#020d18";
    ctx.beginPath();
    ctx.arc(0, -size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Student Label
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

  renderLeaderboard(students);
  renderStudentFeedList(students);
}

function renderLeaderboard(students) {
  const leaderboardList = document.getElementById("leaderboardList");
  leaderboardList.innerHTML = "";

  if (students.length === 0) {
    leaderboardList.innerHTML = `<div class="empty-msg">No students added yet</div>`;
    return;
  }

  // Sort students descending by points
  const sorted = [...students].sort((a, b) => b.points - a.points);

  sorted.forEach((student, index) => {
    const item = document.createElement("div");
    const rankClass = index < 3 ? `top-${index + 1}` : "";
    item.className = `rank-item ${rankClass}`;

    let medal = `#${index + 1}`;
    if (index === 0) medal = "🥇";
    if (index === 1) medal = "🥈";
    if (index === 2) medal = "🥉";

    item.innerHTML = `
      <span><span class="rank-badge">${medal}</span> <b>${student.name}</b></span>
      <span>${student.points} pts</span>
    `;
    leaderboardList.appendChild(item);
  });
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

  renderLeaderboard(classroomData[activeClass]);
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

// Event Listeners
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

// Animation Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }

  turtles.forEach(turtle => {
    turtle.update();
    turtle.draw();
  });

  requestAnimationFrame(animate);
}

// Start Engine
fetchSheetData();
animate();
