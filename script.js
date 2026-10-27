function initIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}
// Paste your deployed Google Apps Script Web App URL here:
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykX4o72pPfgO7h4EYY3mk0dwssrG_8plN_9uWA0shgMWTro-uLXWyt4bqDkMmICGxEhQ/exec";

// Security Passcode Settings
const DEFAULT_PASSCODE = "fromwombtothetomb";

let classroomData = {};
let activeClass = "";
let turtles = [];
let particles = [];
let floatingTexts = [];
let foodPellets = [];

// App Event Listeners Setup
document.addEventListener("DOMContentLoaded", () => {
  initIcons();

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

// Canvas Engine Setup
const canvas = document.getElementById("aquariumCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
resizeCanvas();

// Visual Particle Class
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 3.5 + 1.5;
    this.alpha = 1;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 1.2;
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

// Floating Score Text
class FloatingText {
  constructor(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.alpha = 1;
    this.vy = -1.5;
  }
  update() {
    this.y += this.vy;
    this.alpha -= 0.015;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = "#ffd54f";
    ctx.font = "bold 18px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// Food Drop Particle Class
class FoodPellet {
  constructor(targetX, targetY) {
    this.x = targetX + (Math.random() - 0.5) * 40;
    this.y = 0;
    this.targetY = targetY;
    this.speed = 3 + Math.random() * 2;
    this.size = 5;
    this.reached = false;
  }
  update() {
    if (this.y < this.targetY) {
      this.y += this.speed;
    } else {
      this.reached = true;
    }
  }
  draw() {
    if (!this.reached) {
      ctx.save();
      ctx.fillStyle = "#ff7043";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// Evolving Turtle Vector Class
class Turtle {
  constructor(name, points) {
    this.name = name;
    this.points = points;

    const padding = 100;
    this.x = Math.random() * Math.max(100, canvas.width - padding * 2) + padding;
    this.y = Math.random() * Math.max(100, canvas.height - padding * 2) + padding;
    
    this.speed = 0.9 + Math.random() * 0.5;
    this.angle = Math.random() * Math.PI * 2;
    this.flipperSwimTimer = Math.random() * 100;
  }

  getStage() {
    if (this.points < 100) return 1;  
    if (this.points < 250) return 2;  
    if (this.points < 500) return 3;  
    if (this.points < 1000) return 4; 
    if (this.points < 2000) return 5; 
    if (this.points < 5000) return 6; 
    if (this.points < 10000) return 7; 
    return 7 + Math.floor((this.points - 10000) / 5000); 
  }

  getSize() {
    const scaleFactor = canvas.width < 600 ? 0.75 : 1;
    // Logarithmic curve with continuous growth beyond 1000 pts up to a cap of 240px
    const baseSize = 22 + Math.sqrt(this.points) * 2.8 + Math.log10(Math.max(1, this.points - 1000 + 1)) * 12; 
    return Math.min(baseSize, 240) * scaleFactor;
  }

  getStageTitle() {
    const stage = this.getStage();
    if (stage === 1) return "Hatchling";
    if (stage === 2) return "Armored Sentinel";
    if (stage === 3) return "Cyber Mystic";
    if (stage === 4) return "Solar Leviathan";
    if (stage === 5) return "Abyssal Leviathan";
    if (stage === 6) return "Cosmic Sovereign";
    if (stage === 7) return "Omnipotent Entity";
    return `Celestial Overlord Rank-${stage - 7}`;
  }

  update() {
    this.angle += (Math.random() - 0.5) * 0.06;

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.flipperSwimTimer += 0.07;

    const margin = this.getSize() + 40;
    
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

    // Particle frequency increases as turtles reach high ranks
    const particleChance = Math.min(0.9, 0.2 + this.getStage() * 0.1);
    if (this.getStage() >= 3 && Math.random() < particleChance) {
      const colors = ["#80deea", "#b388ff", "#ffd54f", "#ff80ab", "#00e676", "#76ff03", "#ff3d00", "#00e5ff"];
      particles.push(new Particle(this.x, this.y, colors[this.getStage() % colors.length]));
    }
  }

  draw() {
    const stage = this.getStage();
    const size = this.getSize();
    const flipperSwing = Math.sin(this.flipperSwimTimer) * 0.4;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2);

    let shellBase = "#2e7d32";
    let shellPlate = "#81c784";
    let skinColor = "#1b5e20";
    let auraGlow = "rgba(76, 175, 80, 0.4)";

    if (stage === 2) { 
      shellBase = "#006064"; shellPlate = "#4dd0e1"; skinColor = "#004d40"; auraGlow = "rgba(0, 188, 212, 0.5)";
    } else if (stage === 3) { 
      shellBase = "#4a148c"; shellPlate = "#e040fb"; skinColor = "#311b92"; auraGlow = "rgba(156, 39, 176, 0.6)";
    } else if (stage === 4) { 
      shellBase = "#e65100"; shellPlate = "#ffd54f"; skinColor = "#bf360c"; auraGlow = "rgba(255, 193, 7, 0.7)";
    } else if (stage === 5) { 
      shellBase = "#880e4f"; shellPlate = "#ff80ab"; skinColor = "#4a0072"; auraGlow = "rgba(255, 64, 129, 0.85)";
    } else if (stage === 6) { 
      shellBase = "#1a237e"; shellPlate = "#00e5ff"; skinColor = "#0d47a1"; auraGlow = "rgba(0, 229, 255, 0.9)";
    } else if (stage >= 7) { 
      // Dynamic pulsing colors for end-game ranks
      const hue = (Date.now() / 20 + stage * 45) % 360;
      shellBase = `hsl(${hue}, 80%, 20%)`;
      shellPlate = `hsl(${hue}, 100%, 70%)`;
      skinColor = `hsl(${hue}, 90%, 12%)`;
      auraGlow = `hsla(${hue}, 100%, 60%, 0.95)`;
    }

    if (stage >= 2) {
      ctx.shadowBlur = 14 + stage * 5;
      ctx.shadowColor = auraGlow;
    }

    ctx.fillStyle = skinColor;
    
    // Stage Specific Flippers
    if (stage === 1) { 
      ctx.save();
      ctx.translate(-size * 0.55, -size * 0.25);
      ctx.rotate(-0.5 + flipperSwing);
      ctx.beginPath(); ctx.ellipse(0, 0, size * 0.45, size * 0.18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(size * 0.55, -size * 0.25);
      ctx.rotate(0.5 - flipperSwing);
      ctx.beginPath(); ctx.ellipse(0, 0, size * 0.45, size * 0.18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (stage === 2) { 
      ctx.save();
      ctx.translate(-size * 0.6, -size * 0.2);
      ctx.rotate(-0.6 + flipperSwing);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(-size * 0.6, -size * 0.2); ctx.lineTo(-size * 0.4, size * 0.2);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(size * 0.6, -size * 0.2);
      ctx.rotate(0.6 - flipperSwing);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(size * 0.6, -size * 0.2); ctx.lineTo(size * 0.4, size * 0.2);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    } else { 
      ctx.save();
      ctx.translate(-size * 0.65, -size * 0.25);
      ctx.rotate(-0.5 + flipperSwing);
      ctx.beginPath(); ctx.ellipse(0, 0, size * 0.6, size * 0.22, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(size * 0.65, -size * 0.25);
      ctx.rotate(0.5 - flipperSwing);
      ctx.beginPath(); ctx.ellipse(0, 0, size * 0.6, size * 0.22, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Tail
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, size * 0.75);
    ctx.lineTo(0, size * 1.1);
    ctx.lineTo(size * 0.1, size * 0.75);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(0, -size * 0.75, size * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.85, size * 0.08, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.85, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.87, size * 0.04, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.87, size * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Head Ornaments & Crown Evolutions
    if (stage === 2) { 
      ctx.fillStyle = shellPlate;
      ctx.beginPath();
      ctx.arc(0, -size * 0.85, size * 0.2, Math.PI, 0);
      ctx.fill();
    } else if (stage === 3) { 
      ctx.strokeStyle = shellPlate;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-size * 0.1, -size * 0.9); ctx.lineTo(-size * 0.3, -size * 1.2);
      ctx.moveTo(size * 0.1, -size * 0.9); ctx.lineTo(size * 0.3, -size * 1.2);
      ctx.stroke();
    } else if (stage === 4) { 
      ctx.fillStyle = "#ffd54f";
      ctx.beginPath();
      ctx.moveTo(-size * 0.25, -size * 0.95);
      ctx.lineTo(0, -size * 1.35);
      ctx.lineTo(size * 0.25, -size * 0.95);
      ctx.closePath();
      ctx.fill();
    } else if (stage === 5) { 
      ctx.fillStyle = "#ff80ab";
      ctx.beginPath();
      ctx.moveTo(-size * 0.15, -size * 0.9); ctx.lineTo(-size * 0.4, -size * 1.4); ctx.lineTo(-size * 0.05, -size * 1.0);
      ctx.moveTo(size * 0.15, -size * 0.9); ctx.lineTo(size * 0.4, -size * 1.4); ctx.lineTo(size * 0.05, -size * 1.0);
      ctx.fill();
    } else if (stage >= 6) {
      // Celestial Halo & Spire Crown
      ctx.strokeStyle = shellPlate;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -size * 1.1, size * 0.35, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = shellPlate;
      ctx.beginPath();
      ctx.moveTo(-size * 0.2, -size * 0.95);
      ctx.lineTo(0, -size * 1.5);
      ctx.lineTo(size * 0.2, -size * 0.95);
      ctx.closePath();
      ctx.fill();
    }

    // Main Shell Base
    ctx.fillStyle = shellBase;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.68, size * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = shellPlate;
    ctx.stroke();

    // Shell Crest Pattern
    ctx.fillStyle = shellPlate;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";

    if (stage === 1) { 
      ctx.beginPath();
      ctx.arc(0, -size * 0.1, size * 0.25, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (stage === 2) { 
      ctx.fillRect(-size * 0.3, -size * 0.4, size * 0.6, size * 0.25);
      ctx.fillRect(-size * 0.3, 0, size * 0.6, size * 0.25);
    } else if (stage === 3) { 
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff"; ctx.fill();
    } else if (stage === 4) { 
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.45);
      ctx.lineTo(size * 0.35, 0);
      ctx.lineTo(0, size * 0.45);
      ctx.lineTo(-size * 0.35, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (stage >= 5) {
      // Complex geometry & expanding star emblem
      const pointsCount = Math.min(12, 5 + (stage - 5) * 2);
      ctx.beginPath();
      for (let i = 0; i < pointsCount; i++) {
        const rad = (i * Math.PI * 2) / pointsCount;
        const r = i % 2 === 0 ? size * 0.45 : size * 0.22;
        const px = Math.cos(rad) * r;
        const py = Math.sin(rad) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    ctx.restore();

    // Floating Name & Status Label
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${this.name}`, this.x, this.y + size + 18);

    ctx.fillStyle = shellPlate;
    ctx.font = "11px Fredoka, sans-serif";
    ctx.fillText(`${this.getStageTitle()} • ${this.points} pts`, this.x, this.y + size + 32);
    ctx.restore();
  }
}

// Google Apps Script Sync Operations
async function fetchSheetData() {
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    classroomData = await res.json();
    updateClassDropdown();
  } catch (err) {
    console.error("Failed to fetch data from Google Apps Script Web App API:", err);
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
  if (turtle) {
    turtle.points += points;
    
    floatingTexts.push(new FloatingText(turtle.x, turtle.y - turtle.getSize(), `+${points} Pts!`));
    foodPellets.push(new FoodPellet(turtle.x, turtle.y));
  }

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

// User Dashboard Forms
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

// Main Engine Frame Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = foodPellets.length - 1; i >= 0; i--) {
    foodPellets[i].update();
    foodPellets[i].draw();
    if (foodPellets[i].reached) foodPellets.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }

  turtles.forEach(turtle => {
    turtle.update();
    turtle.draw();
  });

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].update();
    floatingTexts[i].draw();
    if (floatingTexts[i].alpha <= 0) floatingTexts.splice(i, 1);
  }

  requestAnimationFrame(animate);
}

// Start Engine
fetchSheetData();
animate();
