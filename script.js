// Paste your deployed Google Apps Script Web App URL here:
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykX4o72pPfgO7h4EYY3mk0dwssrG_8plN_9uWA0shgMWTro-uLXWyt4bqDkMmICGxEhQ/exec";

// Security Passcode Settings
const DEFAULT_PASSCODE = "fromwombtothetomb";

let classroomData = {};
let activeClass = "";
let turtles = [];

// Lock Screen & Responsive Controls Toggle
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("passwordLockOverlay");
  const input = document.getElementById("passcodeInput");
  const unlockBtn = document.getElementById("unlockBtn");
  const relockBtn = document.getElementById("relockBtn");
  const errorMsg = document.getElementById("lockErrorMessage");
  
  // Mobile Sidebar Toggle
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

  toggleSidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
});

// Responsive Canvas Setup
const canvas = document.getElementById("aquariumCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
resizeCanvas();

// --- Turtle Class ---
class Turtle {
  constructor(name, points) {
    this.name = name;
    this.points = points;
    this.x = Math.random() * (canvas.width - 120) + 60;
    this.y = Math.random() * (canvas.height - 120) + 60;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
  }

  getStage() {
    if (this.points >= 300) return 4; // Mythic Leviathan
    if (this.points >= 200) return 3; // Cyber Mystic
    if (this.points >= 100) return 2; // Armored Turtle
    return 1;                         // Hatchling
  }

  getSize() {
    // Dynamic scale for small screens
    const scaleFactor = canvas.width < 500 ? 0.75 : 1;
    return (22 + this.getStage() * 10) * scaleFactor;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 30 || this.x > canvas.width - 30) this.vx *= -1;
    if (this.y < 30 || this.y > canvas.height - 30) this.vy *= -1;
  }

  draw() {
    const stage = this.getStage();
    const size = this.getSize();

    ctx.save();
    ctx.translate(this.x, this.y);

    let shellColor = "#2e7d32"; // Hatchling (Green)
    if (stage === 2) shellColor = "#0288d1"; // Armored (Blue)
    if (stage === 3) shellColor = "#7b1fa2"; // Cyber Mystic (Purple)
    if (stage === 4) shellColor = "#ffd700"; // Mythic (Gold)

    if (stage >= 3) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = shellColor;
    }

    // Shell Body
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = shellColor;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // Flippers
    ctx.fillStyle = "#1b5e20";
    ctx.fillRect(-size - 5, -size / 2, 6, 12);
    ctx.fillRect(size - 1, -size / 2, 6, 12);

    // Name Label
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${this.name} (${this.points} pts)`, 0, size + 14);

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
        <button class="feed-btn" onclick="feedStudent('${student.name}', 5)">+5</button>
        <button class="feed-btn" onclick="feedStudent('${student.name}', 10)">+10</button>
        <button class="feed-btn" onclick="feedStudent('${student.name}', 25)">+25</button>
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

// Controls Listeners
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

// Canvas Animation Loop
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  turtles.forEach(turtle => {
    turtle.update();
    turtle.draw();
  });
  requestAnimationFrame(animate);
}

// Initialize Application
fetchSheetData();
animate();
