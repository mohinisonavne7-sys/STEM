/* 
   STEM Quest Frontend Controller
   Client-Side SPA Interactivity and Game Mechanics
*/

// --- State Management ---
const gameState = {
  profile: {
    level: 8,
    xp: 1250,
    coins: 450,
    streak: 21,
    badges: ['Math Warrior', 'Science Explorer']
  },
  currentClass: 8,
  circuitOn: false,
  circuitRewardEarned: false,
  quizRewardEarned: false,
  activeQuizQuestion: 0,
  selectedOption: null,
  hintsShown: 0
};

// --- Quiz Question DB ---
const quizQuestions = [
  {
    question: "Which of the following describes why a bulb lights up when a circuit is closed?",
    options: [
      "The battery becomes hot and heats the bulb",
      "An electric current flows through the closed loop, heating the filament",
      "The switch pulls air into the bulb to start a combustion reaction",
      "Gravity pulls electrons down from the bulb into the battery"
    ],
    answer: 1,
    hints: [
      "Hint 1: Think about how electric charge moves when there is a complete pathway.",
      "Hint 2: The pathway must be 'closed' or unbroken for current to flow and heat the filament."
    ],
    explanation: "Excellent conceptual understanding! When a switch is turned on (closed), it completes the circuit loop. This allows electric current to flow through the filament of the bulb, heating it up and causing it to glow."
  }
];

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
  updateUIStats();
  setupEventListeners();
  renderLeaderboard('students');
  renderTeacherAnalytics();
  
  // Open default view (Landing page or Dashboard)
  switchView('landing-view');
});

// --- UI Sync Functions ---
function updateUIStats() {
  // Navigation elements
  document.querySelectorAll(".xp-val").forEach(el => el.textContent = gameState.profile.xp);
  document.querySelectorAll(".coins-val").forEach(el => el.textContent = gameState.profile.coins);
  document.querySelectorAll(".streak-val").forEach(el => el.textContent = gameState.profile.streak);
  
  // Dashboard profile cards
  const lvlEl = document.getElementById("db-level-val");
  if (lvlEl) lvlEl.textContent = `Level ${gameState.profile.level}`;
  
  // Badges grid highlight
  gameState.profile.badges.forEach(badgeId => {
    const normId = badgeId.toLowerCase().replace(/\s+/g, '-');
    const badgeEl = document.getElementById(`badge-${normId}`);
    if (badgeEl) {
      const iconEl = badgeEl.querySelector('.badge-icon');
      if (iconEl) iconEl.classList.remove('locked');
    }
  });
}

// --- View Router ---
function switchView(viewId) {
  // Hide all sections
  document.querySelectorAll(".view-section").forEach(section => {
    section.classList.remove("active");
  });
  
  // Show target section
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update active state in nav menu
  document.querySelectorAll(".nav-links li").forEach(li => {
    li.classList.remove("active");
    const link = li.querySelector('a');
    if (link && link.getAttribute('onclick')?.includes(viewId)) {
      li.classList.add("active");
    }
  });

  // Load context specific content
  if (viewId === 'lab-view') {
    resetCircuit();
  } else if (viewId === 'quiz-view') {
    loadQuizQuestion(0);
  }
}

// --- Event Handlers Setup ---
function setupEventListeners() {
  // Logo acts as home button
  const logo = document.querySelector(".logo-container");
  if (logo) {
    logo.addEventListener("click", () => switchView('landing-view'));
  }

  // Circuit builder toggle
  const circuitSwitch = document.getElementById("circuit-switch-lever");
  if (circuitSwitch) {
    circuitSwitch.addEventListener("click", toggleCircuit);
  }

  // Close modals
  const modalClose = document.getElementById("close-modal-btn");
  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }
}

// --- Class selection helper ---
function selectClass(classNum) {
  gameState.currentClass = classNum;
  // Visual feedback
  document.querySelectorAll(".class-card").forEach(card => {
    card.style.borderColor = 'var(--dark-border)';
    card.style.boxShadow = 'none';
  });
  
  const selectedCard = event.currentTarget;
  if (selectedCard) {
    selectedCard.style.borderColor = 'var(--primary)';
    selectedCard.style.boxShadow = '0 0 15px var(--primary-glow)';
  }
  
  // Alert and switch to dashboard
  setTimeout(() => {
    switchView('dashboard-view');
  }, 300);
}

// --- Virtual STEM Lab: Circuit Simulation ---
function resetCircuit() {
  gameState.circuitOn = false;
  const switchLever = document.getElementById("circuit-switch-lever");
  const wires = document.getElementById("circuit-wires");
  const bulbGlow = document.getElementById("circuit-bulb-glow");
  const statusText = document.getElementById("circuit-status-text");

  if (switchLever) switchLever.setAttribute("class", "switch-lever");
  if (wires) wires.setAttribute("class", "wire-path");
  if (bulbGlow) bulbGlow.setAttribute("class", "bulb-glow");
  if (statusText) statusText.innerHTML = "Circuit status: <strong>Open (Off)</strong>. Click the switch to close it!";
}

function toggleCircuit() {
  gameState.circuitOn = !gameState.circuitOn;
  
  const switchLever = document.getElementById("circuit-switch-lever");
  const wires = document.getElementById("circuit-wires");
  const bulbGlow = document.getElementById("circuit-bulb-glow");
  const statusText = document.getElementById("circuit-status-text");

  if (gameState.circuitOn) {
    switchLever.setAttribute("class", "switch-lever closed");
    wires.setAttribute("class", "wire-path active");
    bulbGlow.setAttribute("class", "bulb-glow active");
    statusText.innerHTML = "Circuit status: <strong style='color:var(--secondary)'>Closed (On)!</strong> Electrons are flowing through the loop.";
    
    // Reward XP on first activation
    if (!gameState.circuitRewardEarned) {
      gameState.circuitRewardEarned = true;
      addRewardPoints(50, 10, "Circuit Builder Spark");
    }
  } else {
    resetCircuit();
  }
}

// --- Quiz System ---
function loadQuizQuestion(index) {
  gameState.activeQuizQuestion = index;
  gameState.selectedOption = null;
  gameState.hintsShown = 0;
  
  const qData = quizQuestions[index];
  document.getElementById("quiz-q-text").textContent = qData.question;
  
  const optionsDiv = document.getElementById("quiz-options-container");
  optionsDiv.innerHTML = "";
  
  qData.options.forEach((optText, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<span>${optText}</span> <span class="indicator"></span>`;
    btn.onclick = () => selectQuizOption(i);
    optionsDiv.appendChild(btn);
  });
  
  // Hide visual feedback, hints
  document.getElementById("quiz-feedback").style.display = "none";
  document.getElementById("hint-text-1").classList.remove("active");
  document.getElementById("hint-text-2").classList.remove("active");
  document.getElementById("hint-btn-label").textContent = "Need a Hint?";
}

function selectQuizOption(index) {
  if (gameState.selectedOption !== null) return; // Prevent double select after answer check
  
  gameState.selectedOption = index;
  const options = document.querySelectorAll(".option-btn");
  options.forEach((btn, i) => {
    if (i === index) {
      btn.classList.add("selected");
    } else {
      btn.classList.remove("selected");
    }
  });

  checkQuizAnswer();
}

function checkQuizAnswer() {
  const qData = quizQuestions[gameState.activeQuizQuestion];
  const options = document.querySelectorAll(".option-btn");
  const feedbackDiv = document.getElementById("quiz-feedback");
  const isCorrect = (gameState.selectedOption === qData.answer);
  
  options.forEach((btn, i) => {
    btn.classList.remove("selected");
    if (i === qData.answer) {
      btn.classList.add("correct");
    } else if (i === gameState.selectedOption) {
      btn.classList.add("incorrect");
    }
  });
  
  feedbackDiv.style.display = "block";
  if (isCorrect) {
    feedbackDiv.innerHTML = `<p style="color: var(--secondary); font-weight: bold; margin-bottom: 0.5rem;">🎉 Correct Answer!</p>
                             <p style="font-size: 0.95rem;">${qData.explanation}</p>`;
    
    // Reward XP & Coins
    if (!gameState.quizRewardEarned) {
      gameState.quizRewardEarned = true;
      setTimeout(() => {
        // Unlock next badge
        if (!gameState.profile.badges.includes("Coding Ninja")) {
          gameState.profile.badges.push("Coding Ninja");
        }
        addRewardPoints(150, 50, "Quiz Champion Badge Unlocked!");
      }, 1000);
    }
  } else {
    feedbackDiv.innerHTML = `<p style="color: #ff5e57; font-weight: bold; margin-bottom: 0.5rem;">❌ Try Again!</p>
                             <p style="font-size: 0.95rem;">The electric path is still broken. Click another option or review the experiment.</p>`;
    // Reset selected option to allow retries
    setTimeout(() => {
      gameState.selectedOption = null;
    }, 1500);
  }
}

function toggleHint() {
  gameState.hintsShown++;
  const label = document.getElementById("hint-btn-label");
  
  if (gameState.hintsShown === 1) {
    document.getElementById("hint-text-1").classList.add("active");
    label.textContent = "Show Next Hint";
  } else if (gameState.hintsShown >= 2) {
    document.getElementById("hint-text-2").classList.add("active");
    label.textContent = "All Hints Shown";
  }
}

// --- Leaderboard Switcher ---
const mockLeaderboards = {
  students: [
    { rank: 1, name: "Aarav Sharma", entity: "Class 8, Rampur High", xp: 1980, avatar: "A" },
    { rank: 2, name: "Sneha Patel", entity: "Class 9, Bilaspur Academy", xp: 1850, avatar: "S" },
    { rank: 3, name: "Rahul (You)", entity: "Class 8, Sonpur Govt School", xp: 1250, avatar: "R" },
    { rank: 4, name: "Vikram Singh", entity: "Class 7, Sonpur Govt School", xp: 1120, avatar: "V" },
    { rank: 5, name: "Pooja Verma", entity: "Class 8, Rampur High", xp: 980, avatar: "P" }
  ],
  schools: [
    { rank: 1, name: "Rampur High School", entity: "Rampur Village", xp: 14200, avatar: "🏫" },
    { rank: 2, name: "Sonpur Govt School", entity: "Sonpur Village", xp: 12100, avatar: "🏫" },
    { rank: 3, name: "Bilaspur Academy", entity: "Bilaspur Town", xp: 9800, avatar: "🏫" }
  ],
  villages: [
    { rank: 1, name: "Rampur Village", entity: "District Patna", xp: 28500, avatar: "🌾" },
    { rank: 2, name: "Sonpur Village", entity: "District Patna", xp: 24100, avatar: "🌾" },
    { rank: 3, name: "Bilaspur Village", entity: "District Gaya", xp: 19000, avatar: "🌾" }
  ]
};

function renderLeaderboard(type) {
  const container = document.getElementById("leaderboard-list-container");
  if (!container) return;
  
  // Highlight correct tab btn
  document.querySelectorAll(".leaderboard-tabs .tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  const activeBtn = document.getElementById(`tab-btn-${type}`);
  if (activeBtn) activeBtn.classList.add("active");
  
  // Render details
  const list = mockLeaderboards[type];
  container.innerHTML = "";
  
  list.forEach(item => {
    let rankClass = `rank-${item.rank}`;
    let isTopThree = item.rank <= 3 ? "top-three" : "";
    
    // Update player's XP in leaderboard dynamically to match state
    if (type === 'students' && item.name.includes("Rahul")) {
      item.xp = gameState.profile.xp;
    }
    
    const row = document.createElement("div");
    row.className = `leaderboard-row ${isTopThree}`;
    row.innerHTML = `
      <div class="leaderboard-rank ${rankClass}">#${item.rank}</div>
      <div class="leaderboard-avatar">${item.avatar}</div>
      <div class="leaderboard-info">
        <div class="leaderboard-name">${item.name}</div>
        <div style="font-size: 0.8rem; color: var(--text-dark-secondary);">${item.entity}</div>
      </div>
      <div class="leaderboard-xp-val">${item.xp.toLocaleString()} XP</div>
    `;
    container.appendChild(row);
  });
}

// --- Rewards Manager ---
function addRewardPoints(xpAdd, coinsAdd, message) {
  gameState.profile.xp += xpAdd;
  gameState.profile.coins += coinsAdd;
  updateUIStats();
  
  // Show Modal Popup
  showModal(xpAdd, coinsAdd, message);
}

function showModal(xp, coins, message) {
  const overlay = document.getElementById("success-modal-overlay");
  const title = document.getElementById("modal-xp-desc");
  const desc = document.getElementById("modal-coins-desc");
  const messageEl = document.getElementById("modal-custom-message");

  if (title) title.textContent = `+${xp} Experience Points`;
  if (desc) desc.textContent = `+${coins} Reward Coins`;
  if (messageEl) messageEl.textContent = message;
  
  if (overlay) overlay.style.display = "flex";
}

function closeModal() {
  const overlay = document.getElementById("success-modal-overlay");
  if (overlay) overlay.style.display = "none";
}

// --- Analytics Renderer ---
function renderTeacherAnalytics() {
  const graph = document.getElementById("attendance-graph");
  if (!graph) return;
  
  // Generates columns visually based on static data
  const data = [78, 85, 92, 88, 95]; // percentage values
  const bars = graph.querySelectorAll(".bar-rect");
  
  bars.forEach((bar, index) => {
    const val = data[index];
    const height = (val / 100) * 160; // scale to container height
    const yVal = 180 - height;
    
    bar.setAttribute("height", height);
    bar.setAttribute("y", yVal);
  });
}
