function initIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykX4o72pPfgO7h4EYY3mk0dwssrG_8plN_9uWA0shgMWTro-uLXWyt4bqDkMmICGxEhQ/exec";
const DEFAULT_PASSCODE = "gcc-computer";

let classroomData = {};
let activeTeacher = "";
let activeClass = "";
let turtles = [];
let particles = [];
let selectedStudentForReport = null;
let userRole = "student"; 
let studentAbilityInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  initIcons();

  const roleOverlay = document.getElementById("roleSelectionOverlay");
  const passwordOverlay = document.getElementById("passwordLockOverlay");
  const passcodeInput = document.getElementById("passcodeInput");
  const unlockBtn = document.getElementById("unlockBtn");
  const cancelLockBtn = document.getElementById("cancelLockBtn");
  const lockErrorMessage = document.getElementById("lockErrorMessage");
  const switchRoleBtn = document.getElementById("switchRoleBtn");

  const selectStudentBtn = document.getElementById("selectStudentRoleBtn");
  const selectTeacherBtn = document.getElementById("selectTeacherRoleBtn");
  const teacherAdminControls = document.getElementById("teacherAdminControls");
  const rosterPanel = document.getElementById("rosterPanel");

  selectStudentBtn.addEventListener("click", () => {
    userRole = "student";
    roleOverlay.style.display = "none";
    teacherAdminControls.style.display = "none";
    rosterPanel.style.display = "none";
    startStudentAbilityCycle();
  });

  selectTeacherBtn.addEventListener("click", () => {
    roleOverlay.style.display = "none";
    passwordOverlay.style.display = "flex";
    passcodeInput.focus();
  });

  function unlockAdmin() {
    if (passcodeInput.value.trim() === DEFAULT_PASSCODE) {
      userRole = "teacher";
      passwordOverlay.style.display = "none";
      lockErrorMessage.style.display = "none";
      passcodeInput.value = "";
      teacherAdminControls.style.display = "flex";
      rosterPanel.style.display = "flex";
      stopStudentAbilityCycle();
    } else {
      lockErrorMessage.style.display = "block";
      passcodeInput.value = "";
      passcodeInput.focus();
    }
  }

  unlockBtn.addEventListener("click", unlockAdmin);
  passcodeInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") unlockAdmin();
  });

  cancelLockBtn.addEventListener("click", () => {
    passwordOverlay.style.display = "none";
    roleOverlay.style.display = "flex";
  });

  switchRoleBtn.addEventListener("click", () => {
    stopStudentAbilityCycle();
    roleOverlay.style.display = "flex";
  });

  document.getElementById("toggleSidebarBtn")?.addEventListener("click", () => {
    document.getElementById("appSidebar").classList.toggle("open");
  });

  document.getElementById("closeModalBtn")?.addEventListener("click", () => {
    document.getElementById("activityModal").style.display = "none";
  });

  document.getElementById("selectAllStudentsBtn")?.addEventListener("click", () => {
    document.querySelectorAll(".student-checkbox").forEach(cb => cb.checked = true);
  });

  document.getElementById("deselectAllStudentsBtn")?.addEventListener("click", () => {
    document.querySelectorAll(".student-checkbox").forEach(cb => cb.checked = false);
  });
});

// Student Ability Auto-Trigger: 1 Random Turtle every 5 seconds (5-second duration)
function startStudentAbilityCycle() {
  stopStudentAbilityCycle();
  
  studentAbilityInterval = setInterval(() => {
    if (turtles.length > 0) {
      const randomIndex = Math.floor(Math.random() * turtles.length);
      const selectedTurtle = turtles[randomIndex];
      
      if (selectedTurtle) {
        selectedTurtle.triggerAbility(300);
      }
    }
  }, 5000);
}

function stopStudentAbilityCycle() {
  if (studentAbilityInterval) {
    clearInterval(studentAbilityInterval);
    studentAbilityInterval = null;
  }
}

// Canvas Engine Setup
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
    this.alpha -= 0.015; 
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

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

    this.abilityTimer = 0;

    const elements = ['lightning', 'water', 'fire', 'shadow', 'celestial'];
    this.element = elements[Math.floor(Math.random() * elements.length)];
  }

  triggerAbility(frames = 600) {
    this.abilityTimer = frames;
  }

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
    const currentSpeed = this.abilityTimer > 0 ? this.speed * 2.5 : this.speed;

    this.angle += (Math.random() - 0.5) * 0.08;
    this.x += Math.cos(this.angle) * currentSpeed;
    this.y += Math.sin(this.angle) * currentSpeed;
    this.flipperSwimTimer += this.abilityTimer > 0 ? 0.2 : 0.08;
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

    const stage = this.getStage();
    if (stage >= 3 && Math.random() < Math.min(0.8, 0.2 + stage * 0.05)) {
      const colors = this.getElementColors();
      particles.push(new Particle(this.x, this.y, colors.particle || colors.secondary));
    }

    if (this.abilityTimer > 0) {
      this.abilityTimer--;
      this.generateAbilityParticles();
    }
  }

  generateAbilityParticles() {
    const stage = this.getStage();
    const size = this.getSize();

    if (stage < 11) {
      switch (stage) {
        case 1:
          particles.push(new Particle(this.x, this.y, "#e0f7fa", (Math.random() - 0.5) * 1.5, -Math.random() * 2 - 0.5, Math.random() * 4 + 1.5));
          break;
        case 2:
          for (let i = 0; i < 2; i++) particles.push(new Particle(this.x, this.y, "#4dd0e1", (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, Math.random() * 4 + 1.5));
          break;
        case 3:
          for (let i = 0; i < 3; i++) particles.push(new Particle(this.x, this.y, Math.random() < 0.5 ? "#ba68c8" : "#80deea", (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, Math.random() * 4 + 2));
          break;
        case 4:
          for (let i = 0; i < 3; i++) particles.push(new Particle(this.x, this.y, "#fff176", (Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 3.5, Math.random() * 5 + 2));
          break;
        case 5:
          for (let i = 0; i < 4; i++) particles.push(new Particle(this.x, this.y, "#ff8a80", (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, Math.random() * 5 + 2));
          break;
        case 6:
          for (let i = 0; i < 4; i++) particles.push(new Particle(this.x, this.y, "#7986cb", (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, Math.random() * 5 + 2));
          break;
        case 7:
          for (let i = 0; i < 4; i++) particles.push(new Particle(this.x, this.y, "#80cbc4", (Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 3.5, Math.random() * 6 + 2));
          break;
        case 8:
          for (let i = 0; i < 5; i++) particles.push(new Particle(this.x, this.y, "#ff80ab", (Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 4.5, Math.random() * 5 + 2));
          break;
        case 9:
          for (let i = 0; i < 5; i++) particles.push(new Particle(this.x, this.y, "#ffb74d", (Math.random() - 0.5) * 4, -Math.random() * 3 - 1, Math.random() * 6 + 2));
          break;
        case 10:
          for (let i = 0; i < 5; i++) particles.push(new Particle(this.x, this.y, "#ffd700", (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, Math.random() * 6 + 2));
          break;
      }
      return;
    }

    switch (this.element) {
      case 'lightning':
        for (let i = 0; i < 4; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * size * 1.8;
          particles.push(new Particle(this.x + Math.cos(angle) * dist, this.y + Math.sin(angle) * dist, "#ffff00", (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, Math.random() * 5 + 2));
        }
        break;
      case 'water':
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 4 + 1;
          particles.push(new Particle(this.x, this.y, "#00e5ff", Math.cos(angle) * speed, Math.sin(angle) * speed, Math.random() * 6 + 2));
        }
        break;
      case 'fire':
        for (let i = 0; i < 6; i++) {
          particles.push(new Particle(this.x + (Math.random() - 0.5) * size, this.y + (Math.random() - 0.5) * size, Math.random() < 0.5 ? "#ff3d00" : "#ffab00", (Math.random() - 0.5) * 3, -Math.random() * 4 - 1, Math.random() * 7 + 2));
        }
        break;
      case 'shadow':
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = size * 1.4;
          particles.push(new Particle(this.x + Math.cos(angle) * dist, this.y + Math.sin(angle) * dist, "#ea80fc", -Math.cos(angle) * 2, -Math.sin(angle) * 2, Math.random() * 5 + 1.5));
        }
        break;
      case 'celestial':
      default:
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3 + 1;
          particles.push(new Particle(this.x, this.y, `hsl(${Math.random() * 360}, 100%, 80%)`, Math.cos(angle) * speed, Math.sin(angle) * speed, Math.random() * 5 + 2));
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

    if (this.abilityTimer > 0) {
      this.drawAbilityFX(size, style);
    }

    ctx.rotate(this.angle + Math.PI / 2);

    if (stage >= 2) {
      ctx.shadowBlur = this.abilityTimer > 0 ? 60 : Math.min(40, 10 + stage * 3);
      ctx.shadowColor = style.aura;
    }

    if (stage >= 11) {
      ctx.save();
      ctx.strokeStyle = style.secondary;
      ctx.lineWidth = 3 + Math.floor((stage - 10) / 2);
      ctx.beginPath();
      ctx.ellipse(0, -size * 1.2, size * 0.5, size * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Flippers & Head
    ctx.fillStyle = style.primary;
    ctx.save();
    ctx.translate(-size * 0.55, -size * 0.25);
    ctx.rotate(-0.5 + flipperAngle);
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.45, size * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(size * 0.55, -size * 0.25);
    ctx.rotate(0.5 - flipperAngle);
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.45, size * 0.18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.beginPath(); ctx.arc(0, -size * 0.75, size * 0.3, 0, Math.PI * 2); ctx.fill();

    // Eyes & Pupils
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.85, size * 0.07, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.85, size * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = stage >= 11 ? style.secondary : "#000000";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.87, size * 0.03, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.87, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Shell
    ctx.fillStyle = style.primary;
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.65, size * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = style.secondary; ctx.stroke();

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

  drawAbilityFX(size, style) {
    const stage = this.getStage();
    ctx.save();

    if (stage < 11) {
      const pulseRadius = size * 1.3 + Math.sin(this.abilityTimer * 0.15) * (size * 0.3);
      ctx.strokeStyle = style.secondary;
      ctx.lineWidth = 3 + Math.floor(stage / 2);
      ctx.beginPath();
      ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      if (this.element === 'lightning') {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.moveTo(0, 0);
          let lx = 0, ly = 0;
          for (let j = 0; j < 5; j++) {
            lx += (Math.random() - 0.5) * (size * 1.2);
            ly += (Math.random() - 0.5) * (size * 1.2);
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
        }
      } else if (this.element === 'water') {
        const ringRadius = ((600 - this.abilityTimer) % 90) * (size * 0.04);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.85)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.element === 'shadow') {
        ctx.fillStyle = "rgba(49, 27, 146, 0.45)";
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}

// Backend Sync & Hydration
async function fetchSheetData() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("YOUR_DEPLOYED_WEB_APP_URL_HERE")) {
    classroomData = {
      "Mr. Smith": { 
        "Science Section A": [
          { name: "Alex", totalPoints: 1050, activities: [{ activity: "Quiz 1", points: 1050, date: new Date().toLocaleDateString() }] }
        ]
      },
      "Ms. Davis": { 
        "Math Grade 5": [
          { name: "Emma", totalPoints: 350, activities: [{ activity: "Homework 1", points: 350, date: new Date().toLocaleDateString() }] }
        ]
      }
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
    console.warn("Using fallback local data:", err);
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

  if (students.length === 0) {
    list.innerHTML = `<div class="empty-msg">No active students</div>`;
    return;
  }

  students.forEach(student => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.innerHTML = `
      <span><b>${student.name}</b> (${student.totalPoints} pts)</span>
      <div class="card-actions">
        <button class="btn primary small" onclick="openStudentReport('${student.name}')">
          <i data-lucide="file-text"></i> Report
        </button>
        <button class="btn danger small" onclick="deleteStudentPermanently('${student.name}')">
          <i data-lucide="trash-2"></i> Delete
        </button>
      </div>
    `;
    list.appendChild(card);
  });
  
  initIcons();
}

// Permanent Database Delete Function
window.deleteStudentPermanently = async function(studentName) {
  if (!activeTeacher || !activeClass) return;

  const confirmDelete = confirm(`Are you sure you want to PERMANENTLY delete ${studentName} from the database? This action cannot be undone.`);
  if (!confirmDelete) return;

  const activeRoster = classroomData[activeTeacher][activeClass];
  const studentIndex = activeRoster.findIndex(s => s.name === studentName);

  if (studentIndex > -1) {
    activeRoster.splice(studentIndex, 1);
  }

  loadClassroom(activeClass);

  if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("YOUR_DEPLOYED_WEB_APP_URL_HERE")) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteStudentPermanently",
          teacherName: activeTeacher,
          className: activeClass,
          studentName: studentName
        })
      });
    } catch (e) {
      console.error("Permanent deletion failed:", e);
    }
  }
};

// Award Points Event (Teacher Mode)
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
      turtle.triggerAbility(600);
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
      console.error("Sync error:", e);
    }
  }
});

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
      <h1 style="font-size: 24px; margin-bottom: 6px;">Student Activity Report</h1>
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
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 14px;">Activity</th>
            <th style="border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 14px;">Points</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;

  window.print();
  printArea.innerHTML = "";
});

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

document.getElementById("createTeacherBtn")?.addEventListener("click", () => {
  const input = document.getElementById("newTeacherInput");
  const teacherName = input.value.trim();
  if (!teacherName) return;

  if (!classroomData[teacherName]) classroomData[teacherName] = {};
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
      console.error(e);
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
