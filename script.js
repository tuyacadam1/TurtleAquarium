function initIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

// Deployed Google Apps Script Web App URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykX4o72pPfgO7h4EYY3mk0dwssrG_8plN_9uWA0shgMWTro-uLXWyt4bqDkMmICGxEhQ/exec";

// Security Passcode Settings
const DEFAULT_PASSCODE = "gcc-computer";

let classroomData = {};
let activeTeacher = "";
let activeClass = "";
let turtles = [];
let particles = [];
let selectedStudentForReport = null;

// Lock Screen & Initial setup
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

  const closeModalBtn = document.getElementById("closeModalBtn");
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      document.getElementById("activityModal").style.display = "none";
    });
  }

  // Bulk Selection Helpers
  document.getElementById("selectAllStudentsBtn")?.addEventListener("click", () => {
    document.querySelectorAll(".student-checkbox").forEach(cb => cb.checked = true);
  });

  document.getElementById("deselectAllStudentsBtn")?.addEventListener("click", () => {
    document.querySelectorAll(".student-checkbox").forEach(cb => cb.checked = false);
  });
});

// Canvas Setup
const canvas = document.getElementById("aquariumCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  if (!canvas || !canvas.parentElement) return;
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
resizeCanvas();

class Particle {
  constructor(x, y, color, vx = null, vy = null, size = null) {
    this.x = x; this.y = y; this.color = color;
    this.size = size || (Math.random() * 3 + 1);
    this.alpha = 1;
    this.vx = vx !== null ? vx : (Math.random() - 0.5) * 0.8;
    this.vy = vy !== null ? vy : (Math.random() - 0.5) * 0.8;
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
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// Evolutionary & Elemental Turtle Engine
class Turtle {
  constructor(name, points) {
    this.name = name;
    this.points = points;
    const padding = 80;
    const w = canvas.width || 800;
    const h = canvas.height || 600;
    this.x = Math.random() * Math.max(100, w - padding * 2) + padding;
    this.y = Math.random() * Math.max(100, h - padding * 2) + padding;
    this.speed = 1.0 + Math.random() * 0.5;
    this.angle = Math.random() * Math.PI * 2;
    this.flipperSwimTimer = Math.random() * 100;
    this.hueShift = Math.random() * 360;

    // Ability activation timer (in animation frames)
    this.abilityTimer = 0;

    // Randomize permanent elemental branch for 1000+ points
    const elements = ['lightning', 'water', 'fire', 'shadow', 'celestial'];
    this.element = elements[Math.floor(Math.random() * elements.length)];
  }

  // Trigger Elemental Ability
  triggerAbility() {
    if (this.getStage() >= 11) {
      this.abilityTimer = 180; // Ability animates for 3 seconds (60fps * 3)
    }
  }

  // Evolves every 100 points indefinitely
  getStage() {
    return Math.max(1, Math.floor(this.points / 100) + 1);
  }

  getSize() {
    const scaleFactor = canvas.width < 600 ? 0.75 : 1;
    const baseSize = 24 + (this.getStage() - 1) * 6; 
    return Math.min(baseSize, 150) * scaleFactor;
  }

  getStageTitle() {
    const stage = this.getStage();
    
    if (stage === 1) return "Hatchling";
    if (stage === 2) return "Armored Shell";
    if (stage === 3) return "Mystic Cyber";
    if (stage === 4) return "Cosmic Leviathan";
    if (stage === 5) return "Ocean Guardian";
    if (stage === 6) return "Abyssal Drake";
    if (stage === 7) return "Titan Shell";
    if (stage === 8) return "Prismatic Behemoth";
    if (stage === 9) return "Elder Leviathan";
    if (stage === 10) return "Ascended Warden";

    const elementalTitles = {
      lightning: "Storm-Forged Raiju",
      water: "Tidal Abyss Sovereign",
      fire: "Infernal Sun-Crusher",
      shadow: "Void Stalker",
      celestial: "Astral Galaxy Titan"
    };

    const elementTitle = elementalTitles[this.element] || "Elemental Overlord";
    return `${elementTitle} (Tier ${stage - 10})`;
  }

  getElementColors() {
    const stage = this.getStage();

    if (stage < 11) {
      const palette = [
        { primary: "#2e7d32", secondary: "#81c784", aura: "rgba(76, 175, 80, 0.4)" },
        { primary: "#00838f", secondary: "#4dd0e1", aura: "rgba(0, 188, 212, 0.5)" },
        { primary: "#6a1b9a", secondary: "#ba68c8", aura: "rgba(156, 39, 176, 0.6)" },
        { primary: "#f57f17", secondary: "#fff176", aura: "rgba(255, 215, 0, 0.7)" },
        { primary: "#c62828", secondary: "#ff8a80", aura: "rgba(255, 82, 82, 0.8)" },
        { primary: "#283593", secondary: "#7986cb", aura: "rgba(63, 81, 181, 0.8)" },
        { primary: "#00695c", secondary: "#80cbc4", aura: "rgba(0, 150, 136, 0.8)" },
        { primary: "#d81b60", secondary: "#ff80ab", aura: "rgba(233, 30, 99, 0.8)" },
        { primary: "#ef6c00", secondary: "#ffb74d", aura: "rgba(255, 152, 0, 0.8)" },
        { primary: "#4e342e", secondary: "#bcaaa4", aura: "rgba(121, 85, 72, 0.8)" }
      ];
      return palette[(stage - 1) % palette.length];
    }

    switch (this.element) {
      case 'lightning':
        return { primary: "#ffd600", secondary: "#ffffff", aura: "rgba(255, 235, 59, 0.95)", particle: "#ffff8d" };
      case 'water':
        return { primary: "#0288d1", secondary: "#80deea", aura: "rgba(3, 169, 244, 0.9)", particle: "#00e5ff" };
      case 'fire':
        return { primary: "#dd2c00", secondary: "#ffab00", aura: "rgba(255, 61, 0, 0.95)", particle: "#ff6d00" };
      case 'shadow':
        return { primary: "#311b92", secondary: "#ea80fc", aura: "rgba(103, 58, 183, 0.9)", particle: "#d500f9" };
      case 'celestial':
      default:
        return { 
          primary: `hsl(${this.hueShift}, 85%, 50%)`, 
          secondary: `hsl(${(this.hueShift + 60) % 360}, 100%, 75%)`, 
          aura: `hsla(${this.hueShift}, 100%, 65%, 0.9)`,
          particle: "#ffffff"
        };
    }
  }

  update() {
    // Speed boost when unleashing ability
    const currentSpeed = this.abilityTimer > 0 ? this.speed * 2.2 : this.speed;

    this.angle += (Math.random() - 0.5) * 0.08;
    this.x += Math.cos(this.angle) * currentSpeed;
    this.y += Math.sin(this.angle) * currentSpeed;
    this.flipperSwimTimer += 0.08;
    this.hueShift = (this.hueShift + 1.5) % 360;

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

    // Standard Particle Trail
    const stage = this.getStage();
    if (stage >= 3 && Math.random() < Math.min(0.8, 0.2 + stage * 0.05)) {
      const colors = this.getElementColors();
      particles.push(new Particle(this.x, this.y, colors.particle || colors.secondary));
    }

    // Execute Elemental Ability Effects when Active
    if (this.abilityTimer > 0) {
      this.abilityTimer--;
      this.generateAbilityParticles();
    }
  }

  generateAbilityParticles() {
    const colors = this.getElementColors();
    const size = this.getSize();

    switch (this.element) {
      case 'lightning':
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * size * 1.5;
          particles.push(new Particle(
            this.x + Math.cos(angle) * dist,
            this.y + Math.sin(angle) * dist,
            "#ffff00",
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            Math.random() * 4 + 2
          ));
        }
        break;

      case 'water':
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3 + 1;
          particles.push(new Particle(
            this.x, this.y,
            "#00e5ff",
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            Math.random() * 5 + 2
          ));
        }
        break;

      case 'fire':
        for (let i = 0; i < 5; i++) {
          particles.push(new Particle(
            this.x + (Math.random() - 0.5) * size,
            this.y + (Math.random() - 0.5) * size,
            Math.random() < 0.5 ? "#ff3d00" : "#ffab00",
            (Math.random() - 0.5) * 2,
            -Math.random() * 3 - 1,
            Math.random() * 6 + 2
          ));
        }
        break;

      case 'shadow':
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = size * 1.2;
          particles.push(new Particle(
            this.x + Math.cos(angle) * dist,
            this.y + Math.sin(angle) * dist,
            "#ea80fc",
            -Math.cos(angle) * 1.5,
            -Math.sin(angle) * 1.5,
            Math.random() * 4 + 1
          ));
        }
        break;

      case 'celestial':
      default:
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2 + 1;
          particles.push(new Particle(
            this.x, this.y,
            `hsl(${Math.random() * 360}, 100%, 80%)`,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            Math.random() * 4 + 2
          ));
        }
        break;
    }
  }

  draw() {
    const stage = this.getStage();
    const size = this.getSize();
    const flipperAngle = Math.sin(this.flipperSwimTimer) * 0.35;
    const style = this.getElementColors();

    ctx.save();
    ctx.translate(this.x, this.y);

    // Render Ability Canvas FX overlay (Lightning Arcs / Shockwaves)
    if (this.abilityTimer > 0 && stage >= 11) {
      this.drawAbilityFX(size, style);
    }

    ctx.rotate(this.angle + Math.PI / 2);

    // Dynamic Glow Aura
    if (stage >= 2) {
      ctx.shadowBlur = this.abilityTimer > 0 ? 50 : Math.min(40, 10 + stage * 3);
      ctx.shadowColor = style.aura;
    }

    // Elemental Crown / Halo for 1000+ points
    if (stage >= 11) {
      ctx.save();
      ctx.strokeStyle = style.secondary;
      ctx.lineWidth = 3 + Math.floor((stage - 10) / 2);
      ctx.beginPath();
      ctx.ellipse(0, -size * 1.2, size * 0.5, size * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Left Flipper
    ctx.fillStyle = style.primary;
    ctx.save();
    ctx.translate(-size * 0.55, -size * 0.25);
    ctx.rotate(-0.5 + flipperAngle);
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.45, size * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Right Flipper
    ctx.save();
    ctx.translate(size * 0.55, -size * 0.25);
    ctx.rotate(0.5 - flipperAngle);
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.45, size * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Head
    ctx.fillStyle = style.primary;
    ctx.beginPath(); ctx.arc(0, -size * 0.75, size * 0.3, 0, Math.PI * 2); ctx.fill();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.85, size * 0.07, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.85, size * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = stage >= 11 ? style.secondary : "#000000";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.87, size * 0.03, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.87, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Shell Body
    ctx.fillStyle = style.primary;
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.65, size * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = style.secondary; ctx.stroke();

    // Hex Pattern
    ctx.strokeStyle = style.secondary;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const hexRadius = size * 0.25;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = hexRadius * Math.cos(angle);
      const hy = hexRadius * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();

    // Shell Crest Lines (Stage 4+)
    if (stage >= 4) {
      ctx.beginPath();
      ctx.moveTo(0, -hexRadius); ctx.lineTo(0, -size * 0.65);
      ctx.moveTo(0, hexRadius); ctx.lineTo(0, size * 0.65);
      ctx.moveTo(-hexRadius, 0); ctx.lineTo(-size * 0.5, 0);
      ctx.moveTo(hexRadius, 0); ctx.lineTo(size * 0.5, 0);
      ctx.stroke();
    }

    ctx.restore();

    // Student Label
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px 'Fredoka', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${this.name}`, this.x, this.y + size + 16);

    ctx.fillStyle = style.secondary;
    ctx.font = "11px 'Fredoka', sans-serif";
    ctx.fillText(`${this.getStageTitle()} • ${this.points} pts`, this.x, this.y + size + 30);
    ctx.restore();
  }

  // Draw Specific Ability FX per Element
  drawAbilityFX(size, style) {
    ctx.save();

    if (this.element === 'lightning') {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        let lx = 0, ly = 0;
        for (let j = 0; j < 4; j++) {
          lx += (Math.random() - 0.5) * size;
          ly += (Math.random() - 0.5) * size;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }
    } else if (this.element === 'water') {
      const ringRadius = ((180 - this.abilityTimer) % 60) * (size * 0.05);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.element === 'shadow') {
      ctx.fillStyle = "rgba(49, 27, 146, 0.4)";
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// Backend Data Sync
async function fetchSheetData() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("YOUR_DEPLOYED_WEB_APP_URL_HERE")) {
    classroomData = {
      "Mr. Smith": { "Science Section A": [{ name: "Alex", totalPoints: 1050, activities: [{ activity: "Quiz 1", points: 1050, date: new Date().toLocaleDateString() }] }] },
      "Ms. Davis": { "Math Grade 5": [{ name: "Emma", totalPoints: 350, activities: [{ activity: "Homework 1", points: 350, date: new Date().toLocaleDateString() }] }] }
    };
    updateTeacherDropdown();
    return;
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL);
    classroomData = await res.json();
    if (!classroomData || Object.keys(classroomData).length === 0) {
      classroomData = { "Default Teacher": { "Class 1": [] } };
    }
    updateTeacherDropdown();
  } catch (err) {
    console.warn("Using offline fallback data:", err);
    if (Object.keys(classroomData).length === 0) {
      classroomData = { "Default Teacher": { "Class 1": [] } };
    }
    updateTeacherDropdown();
  }
}

function updateTeacherDropdown() {
  const dropdown = document.getElementById("teacherDropdown");
  if (!dropdown) return;
  dropdown.innerHTML = "";

  const teachers = Object.keys(classroomData);
  teachers.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t; opt.textContent = t;
    dropdown.appendChild(opt);
  });

  if (!activeTeacher || !classroomData[activeTeacher]) activeTeacher = teachers[0] || "";
  dropdown.value = activeTeacher;
  updateClassDropdown();
}

function updateClassDropdown() {
  const dropdown = document.getElementById("classDropdown");
  if (!dropdown) return;
  dropdown.innerHTML = "";

  const teacherClasses = classroomData[activeTeacher] || {};
  const classNames = Object.keys(teacherClasses);

  if (classNames.length === 0) {
    dropdown.innerHTML = `<option value="">No classes created yet</option>`;
    activeClass = "";
    loadClassroom("");
    return;
  }

  classNames.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    dropdown.appendChild(opt);
  });

  if (!activeClass || !teacherClasses[activeClass]) activeClass = classNames[0];
  dropdown.value = activeClass;
  loadClassroom(activeClass);
}

function loadClassroom(className) {
  activeClass = className;
  document.getElementById("activeClassTitle").textContent = className ? `Class: ${className}` : "No Class Selected";
  document.getElementById("activeTeacherSubtitle").textContent = `Teacher: ${activeTeacher || "None"}`;

  const students = (classroomData[activeTeacher] && classroomData[activeTeacher][className]) ? classroomData[activeTeacher][className] : [];
  turtles = students.map(s => new Turtle(s.name, s.totalPoints));

  populateStudentCheckboxes(students);
  populateActivityHistory(students);
  renderLeaderboard(students);
  renderStudentRoster(students);
}

function populateStudentCheckboxes(students) {
  const container = document.getElementById("studentCheckboxContainer");
  if (!container) return;
  container.innerHTML = "";

  if (students.length === 0) {
    container.innerHTML = `<div class="empty-msg">No students loaded</div>`;
    return;
  }

  students.forEach(s => {
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "6px";
    label.style.fontSize = "12px";
    label.style.cursor = "pointer";

    label.innerHTML = `
      <input type="checkbox" class="student-checkbox" value="${s.name}" style="width: auto;" />
      <span>${s.name} (${s.totalPoints} pts)</span>
    `;
    container.appendChild(label);
  });
}

function populateActivityHistory(students) {
  const datalist = document.getElementById("activityHistoryList");
  if (!datalist) return;
  datalist.innerHTML = "";

  const uniqueActivities = new Set();
  students.forEach(s => {
    if (s.activities) {
      s.activities.forEach(a => {
        if (a.activity && a.activity !== "Initial Registration" && a.activity !== "Enrolled") {
          uniqueActivities.add(a.activity);
        }
      });
    }
  });

  uniqueActivities.forEach(act => {
    const opt = document.createElement("option");
    opt.value = act;
    datalist.appendChild(opt);
  });
}

function renderLeaderboard(students) {
  const list = document.getElementById("leaderboardList");
  if (!list) return;
  list.innerHTML = "";

  if (students.length === 0) {
    list.innerHTML = `<div class="empty-msg">No students ranked yet</div>`;
    return;
  }

  const sorted = [...students].sort((a, b) => b.totalPoints - a.totalPoints);
  
  let currentRank = 1;
  sorted.forEach((student, index) => {
    if (index > 0 && student.totalPoints < sorted[index - 1].totalPoints) {
      currentRank = index + 1;
    }

    const item = document.createElement("div");
    const rankClass = currentRank <= 3 ? `top-${currentRank}` : "";
    item.className = `rank-item ${rankClass}`;

    let medal = `#${currentRank}`;
    if (currentRank === 1) medal = "🥇";
    if (currentRank === 2) medal = "🥈";
    if (currentRank === 3) medal = "🥉";

    item.innerHTML = `
      <span><span class="rank-badge">${medal}</span> <b>${student.name}</b></span>
      <span>${student.totalPoints} pts</span>
    `;
    list.appendChild(item);
  });
}

function renderStudentRoster(students) {
  const list = document.getElementById("studentList");
  if (!list) return;
  list.innerHTML = "";

  students.forEach(student => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
      <span><b>${student.name}</b> (${student.totalPoints} pts)</span>
      <button class="btn primary" style="padding: 4px 8px; font-size: 11px;" onclick="openStudentReport('${student.name}')">
        <i data-lucide="file-text"></i> Report
      </button>
    `;
    list.appendChild(card);
  });
  
  initIcons();
}

// Point Awarding Action with Elemental Ability Activation
document.getElementById("submitActivityBtn")?.addEventListener("click", async () => {
  const checkedBoxes = document.querySelectorAll(".student-checkbox:checked");
  const selectedStudents = Array.from(checkedBoxes).map(cb => cb.value);
  const activityTitle = document.getElementById("activityTitleInput").value.trim() || "Activity Points";
  const points = parseInt(document.getElementById("activityPointsInput").value, 10);

  if (!activeTeacher || !activeClass || selectedStudents.length === 0 || isNaN(points)) {
    alert("Please select a teacher, class, at least one student, and enter valid points!");
    return;
  }

  const currentDate = new Date().toLocaleDateString();

  selectedStudents.forEach(studentName => {
    const student = classroomData[activeTeacher][activeClass].find(s => s.name === studentName);
    if (student) {
      student.totalPoints += points;
      if (!student.activities) student.activities = [];
      student.activities.push({
        activity: activityTitle,
        points: points,
        date: currentDate
      });
    }

    const turtle = turtles.find(t => t.name === studentName);
    if (turtle) {
      turtle.points += points;
      turtle.triggerAbility(); // Triggers elemental ability effect
    }
  });

  const students = classroomData[activeTeacher][activeClass];
  populateStudentCheckboxes(students);
  populateActivityHistory(students);
  renderLeaderboard(students);
  renderStudentRoster(students);

  document.getElementById("activityTitleInput").value = "";
  document.getElementById("activityPointsInput").value = "";

  if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("YOUR_DEPLOYED_WEB_APP_URL_HERE")) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addBulkActivityPoints",
          teacherName: activeTeacher,
          className: activeClass,
          studentsList: selectedStudents,
          activityName: activityTitle,
          points: points
        })
      });
    } catch (e) {
      console.error("Backend sync failed:", e);
    }
  }
});

// Modal Display Handler
window.openStudentReport = function(studentName) {
  selectedStudentForReport = studentName;
  const student = classroomData[activeTeacher][activeClass].find(s => s.name === studentName);
  if (!student) return;

  document.getElementById("modalStudentName").textContent = `${student.name}'s Activity Log`;
  const tbody = document.getElementById("modalActivityTableBody");
  tbody.innerHTML = "";

  if (!student.activities || student.activities.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 12px;">No activity records found.</td></tr>`;
  } else {
    student.activities.forEach(act => {
      const row = document.createElement("tr");
      row.innerHTML = `<td style="padding: 8px; border-bottom: 1px solid #103454;">${act.date}</td><td style="padding: 8px; border-bottom: 1px solid #103454;">${act.activity}</td><td style="padding: 8px; border-bottom: 1px solid #103454;"><b>+${act.points}</b></td>`;
      tbody.appendChild(row);
    });
  }

  document.getElementById("activityModal").style.display = "flex";
  initIcons();
};

// Individual Student PDF Generator
document.getElementById("printSingleReportBtn")?.addEventListener("click", () => {
  const student = classroomData[activeTeacher][activeClass].find(s => s.name === selectedStudentForReport);
  if (!student) return;

  const printArea = document.getElementById("printableReport");
  let rowsHtml = (student.activities || []).map(a => `
    <tr>
      <td style="border: 1px solid #ccc; padding: 10px; font-size: 14px;">${a.date}</td>
      <td style="border: 1px solid #ccc; padding: 10px; font-size: 14px;">${a.activity}</td>
      <td style="border: 1px solid #ccc; padding: 10px; font-size: 14px; font-weight: bold;">+${a.points}</td>
    </tr>
  `).join("");

  printArea.innerHTML = `
    <div style="font-family: Arial, sans-serif; color: #000; padding: 10px;">
      <h1 style="font-size: 24px; margin-bottom: 6px;">Student Activity & Points Report</h1>
      <h3 style="font-size: 14px; color: #444; margin-bottom: 20px;">
        <b>Teacher:</b> ${activeTeacher} &nbsp;|&nbsp; 
        <b>Class:</b> ${activeClass} &nbsp;|&nbsp; 
        <b>Student:</b> ${student.name} &nbsp;|&nbsp; 
        <b>Total Points:</b> ${student.totalPoints}
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 14px;">Date</th>
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 14px;">Activity Title</th>
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 14px;">Points Awarded</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;

  window.print();
  printArea.innerHTML = "";
});

// Classroom PDF Summary Generator
document.getElementById("printClassReportBtn")?.addEventListener("click", () => {
  const students = (classroomData[activeTeacher] && classroomData[activeTeacher][activeClass]) ? classroomData[activeTeacher][activeClass] : [];
  const printArea = document.getElementById("printableReport");

  let rowsHtml = students.map(s => `
    <tr>
      <td style="border: 1px solid #ccc; padding: 10px; font-size: 14px; font-weight: bold;">${s.name}</td>
      <td style="border: 1px solid #ccc; padding: 10px; font-size: 14px; text-align: center;">${s.totalPoints}</td>
      <td style="border: 1px solid #ccc; padding: 10px; font-size: 14px; text-align: center;">${s.activities ? s.activities.length : 0} activities</td>
    </tr>
  `).join("");

  printArea.innerHTML = `
    <div style="font-family: Arial, sans-serif; color: #000; padding: 10px;">
      <h1 style="font-size: 24px; margin-bottom: 6px;">Classroom Summary Report</h1>
      <h3 style="font-size: 14px; color: #444; margin-bottom: 20px;">
        <b>Teacher:</b> ${activeTeacher} &nbsp;|&nbsp; 
        <b>Class:</b> ${activeClass} &nbsp;|&nbsp; 
        <b>Date:</b> ${new Date().toLocaleDateString()}
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 14px;">Student Name</th>
            <th style="border: 1px solid #ccc; padding: 10px; text-align: center; font-size: 14px;">Total Accumulated Points</th>
            <th style="border: 1px solid #ccc; padding: 10px; text-align: center; font-size: 14px;">Total Activities Completed</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;

  window.print();
  printArea.innerHTML = "";
});

// App Controls
document.getElementById("createTeacherBtn")?.addEventListener("click", () => {
  const input = document.getElementById("newTeacherInput");
  const teacherName = input.value.trim();
  if (!teacherName) return;

  if (!classroomData[teacherName]) {
    classroomData[teacherName] = {};
  }
  activeTeacher = teacherName;
  input.value = "";
  updateTeacherDropdown();
});

document.getElementById("createClassBtn")?.addEventListener("click", async () => {
  const input = document.getElementById("newClassInput");
  const className = input.value.trim();
  if (!activeTeacher || !className) return;

  activeClass = className;
  if (!classroomData[activeTeacher]) classroomData[activeTeacher] = {};
  classroomData[activeTeacher][className] = [];
  input.value = "";
  updateClassDropdown();

  if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("YOUR_DEPLOYED_WEB_APP_URL_HERE")) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createClassroom", teacherName: activeTeacher, className: className })
      });
    } catch (e) {
      console.error("Failed to post class to Apps Script:", e);
    }
  }
});

document.getElementById("addStudentsBtn")?.addEventListener("click", async () => {
  const textarea = document.getElementById("bulkStudentInput");
  const names = textarea.value.split("\n").map(n => n.trim()).filter(n => n.length > 0);
  if (!activeTeacher || !activeClass || names.length === 0) return;

  textarea.value = "";

  if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("YOUR_DEPLOYED_WEB_APP_URL_HERE")) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addBulkStudents", teacherName: activeTeacher, className: activeClass, students: names })
      });
    } catch (e) {
      console.error(e);
    }
    names.forEach(n => classroomData[activeTeacher][activeClass].push({ name: n, totalPoints: 0, activities: [] }));
    loadClassroom(activeClass);
  } else {
    names.forEach(n => classroomData[activeTeacher][activeClass].push({ name: n, totalPoints: 0, activities: [] }));
    loadClassroom(activeClass);
  }
});

document.getElementById("teacherDropdown")?.addEventListener("change", (e) => {
  activeTeacher = e.target.value;
  updateClassDropdown();
});

document.getElementById("classDropdown")?.addEventListener("change", (e) => {
  loadClassroom(e.target.value);
});

document.getElementById("syncSheetBtn")?.addEventListener("click", fetchSheetData);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].alpha <= 0) particles.splice(i, 1);
  }
  turtles.forEach(turtle => { turtle.update(); turtle.draw(); });
  requestAnimationFrame(animate);
}

fetchSheetData();
animate();
