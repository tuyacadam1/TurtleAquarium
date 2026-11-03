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

  document.getElementById("closeModalBtn").addEventListener("click", () => {
    document.getElementById("activityModal").style.display = "none";
  });

  // Bulk Selection Helpers
  document.getElementById("selectAllStudentsBtn").addEventListener("click", () => {
    document.querySelectorAll(".student-checkbox").forEach(cb => cb.checked = true);
  });

  document.getElementById("deselectAllStudentsBtn").addEventListener("click", () => {
    document.querySelectorAll(".student-checkbox").forEach(cb => cb.checked = false);
  });
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

class Particle {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
    this.size = Math.random() * 3 + 1;
    this.alpha = 1;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
  }
  update() { this.x += this.vx; this.y += this.vy; this.alpha -= 0.02; }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// Evolutionary Turtle Rendering Engine
class Turtle {
  constructor(name, points) {
    this.name = name;
    this.points = points;
    const padding = 80;
    this.x = Math.random() * Math.max(100, canvas.width - padding * 2) + padding;
    this.y = Math.random() * Math.max(100, canvas.height - padding * 2) + padding;
    this.speed = 1.0 + Math.random() * 0.5;
    this.angle = Math.random() * Math.PI * 2;
    this.flipperSwimTimer = Math.random() * 100;
    this.hueShift = Math.random() * 360;
  }

  getStage() {
    if (this.points < 100) return 1;
    if (this.points < 200) return 2;
    if (this.points < 350) return 3;
    if (this.points < 500) return 4;
    if (this.points < 750) return 5;
    if (this.points < 1000) return 6;
    return 6 + Math.floor((this.points - 1000) / 250);
  }

  getSize() {
    const scaleFactor = canvas.width < 600 ? 0.75 : 1;
    const baseSize = 24 + Math.sqrt(Math.max(0, this.points)) * 2.8; 
    return Math.min(baseSize, 140) * scaleFactor;
  }

  getStageTitle() {
    const stage = this.getStage();
    if (stage === 1) return "Hatchling";
    if (stage === 2) return "Armored Shell";
    if (stage === 3) return "Mystic Cyber";
    if (stage === 4) return "Cosmic Leviathan";
    if (stage === 5) return "Ocean Dragon";
    if (stage === 6) return "Abyssal Leviathan";
    return `Celestial Overlord T-${stage - 6}`;
  }

  update() {
    this.angle += (Math.random() - 0.5) * 0.08;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
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

    if (this.getStage() >= 3 && Math.random() < 0.35) {
      const colors = ["#80deea", "#b388ff", "#ffd54f", "#ff80ab", "#00e676"];
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

    if (stage === 2) {
      primaryColor = "#00838f"; secondaryColor = "#4dd0e1"; auraColor = "rgba(0, 188, 212, 0.5)";
    } else if (stage === 3) {
      primaryColor = "#6a1b9a"; secondaryColor = "#ba68c8"; auraColor = "rgba(156, 39, 176, 0.6)";
    } else if (stage === 4) {
      primaryColor = "#f57f17"; secondaryColor = "#fff176"; auraColor = "rgba(255, 215, 0, 0.7)";
    } else if (stage === 5) {
      primaryColor = "#c62828"; secondaryColor = "#ff8a80"; auraColor = "rgba(255, 82, 82, 0.8)";
    } else if (stage >= 6) {
      primaryColor = `hsl(${this.hueShift}, 85%, 45%)`;
      secondaryColor = `hsl(${(this.hueShift + 60) % 360}, 100%, 75%)`;
      auraColor = `hsla(${this.hueShift}, 100%, 65%, 0.9)`;
    }

    if (stage >= 2) {
      ctx.shadowBlur = 12 + stage * 4;
      ctx.shadowColor = auraColor;
    }

    // Celestial Halo (Stage 6+)
    if (stage >= 6) {
      ctx.save();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -size * 1.15, size * 0.45, size * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Left Flipper
    ctx.fillStyle = primaryColor;
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
    ctx.fillStyle = primaryColor;
    ctx.beginPath(); ctx.arc(0, -size * 0.75, size * 0.3, 0, Math.PI * 2); ctx.fill();

    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.85, size * 0.07, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.85, size * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(-size * 0.12, -size * 0.87, size * 0.03, 0, Math.PI * 2);
    ctx.arc(size * 0.12, -size * 0.87, size * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // Shell Body
    ctx.fillStyle = primaryColor;
    ctx.beginPath(); ctx.ellipse(0, 0, size * 0.65, size * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = secondaryColor; ctx.stroke();

    // Hex Pattern
    ctx.strokeStyle = secondaryColor;
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

    ctx.fillStyle = secondaryColor;
    ctx.font = "11px 'Fredoka', sans-serif";
    ctx.fillText(`${this.getStageTitle()} • ${this.points} pts`, this.x, this.y + size + 30);
    ctx.restore();
  }
}

// Backend Data Sync
async function fetchSheetData() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("YOUR_DEPLOYED_WEB_APP_URL_HERE")) {
    classroomData = {
      "Mr. Smith": { "Science Section A": [{ name: "Alex", totalPoints: 50, activities: [{ activity: "Quiz 1", points: 50, date: new Date().toLocaleDateString() }] }] },
      "Ms. Davis": { "Math Grade 5": [{ name: "Emma", totalPoints: 30, activities: [{ activity: "Homework 1", points: 30, date: new Date().toLocaleDateString() }] }] }
    };
    updateTeacherDropdown();
    return;
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL);
    classroomData = await res.json();
    if (Object.keys(classroomData).length === 0) {
      classroomData = { "Default Teacher": { "Class 1": [] } };
    }
    updateTeacherDropdown();
  } catch (err) {
    console.error("Fetch error:", err);
    if (Object.keys(classroomData).length === 0) {
      classroomData = { "Default Teacher": { "Class 1": [] } };
    }
    updateTeacherDropdown();
  }
}

function updateTeacherDropdown() {
  const dropdown = document.getElementById("teacherDropdown");
  dropdown.innerHTML = "";

  const teachers = Object.keys(classroomData);
  teachers.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t; opt.textContent = t;
    dropdown.appendChild(opt);
  });

  if (!activeTeacher || !classroomData[activeTeacher]) activeTeacher = teachers[0];
  dropdown.value = activeTeacher;
  updateClassDropdown();
}

function updateClassDropdown() {
  const dropdown = document.getElementById("classDropdown");
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

// Point Awarding Action
document.getElementById("submitActivityBtn").addEventListener("click", async () => {
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
      student.activities.push({
        activity: activityTitle,
        points: points,
        date: currentDate
      });
    }

    const turtle = turtles.find(t => t.name === studentName);
    if (turtle) turtle.points += points;
  });

  const students = classroomData[activeTeacher][activeClass];
  populateStudentCheckboxes(students);
  populateActivityHistory(students);
  renderLeaderboard(students);
  renderStudentRoster(students);

  document.getElementById("activityTitleInput").value = "";
  document.getElementById("activityPointsInput").value = "";

  if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("YOUR_DEPLOYED_WEB_APP_URL_HERE")) {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addBulkActivityPoints",
        teacherName: activeTeacher,
        className: activeClass,
        studentsList: selectedStudents,
        activityName: activityTitle,
        points: points
      })
    });
  }
});

// Modal Display Handler
function openStudentReport(studentName) {
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
}

// Individual Student PDF Generator
document.getElementById("printSingleReportBtn").addEventListener("click", () => {
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
document.getElementById("printClassReportBtn").addEventListener("click", () => {
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
document.getElementById("createTeacherBtn").addEventListener("click", () => {
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

document.getElementById("createClassBtn").addEventListener("click", async () => {
  const input = document.getElementById("newClassInput");
  const className = input.value.trim();
  if (!activeTeacher || !className) return;

  activeClass = className;
  if (!classroomData[activeTeacher]) classroomData[activeTeacher] = {};
  classroomData[activeTeacher][className] = [];
  input.value = "";
  updateClassDropdown();

  if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("YOUR_DEPLOYED_WEB_APP_URL_HERE")) {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "createClassroom", teacherName: activeTeacher, className: className })
    });
  }
});

document.getElementById("addStudentsBtn").addEventListener("click", async () => {
  const textarea = document.getElementById("bulkStudentInput");
  const names = textarea.value.split("\n").map(n => n.trim()).filter(n => n.length > 0);
  if (!activeTeacher || !activeClass || names.length === 0) return;

  textarea.value = "";

  if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes("YOUR_DEPLOYED_WEB_APP_URL_HERE")) {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "addBulkStudents", teacherName: activeTeacher, className: activeClass, students: names })
    });
    fetchSheetData();
  } else {
    names.forEach(n => classroomData[activeTeacher][activeClass].push({ name: n, totalPoints: 0, activities: [] }));
    loadClassroom(activeClass);
  }
});

document.getElementById("teacherDropdown").addEventListener("change", (e) => {
  activeTeacher = e.target.value;
  updateClassDropdown();
});

document.getElementById("classDropdown").addEventListener("change", (e) => {
  loadClassroom(e.target.value);
});

document.getElementById("syncSheetBtn").addEventListener("click", fetchSheetData);

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
