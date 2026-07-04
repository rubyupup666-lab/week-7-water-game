// charity: water Build the Well Game

// Difficulty settings
const difficultySettings = {
  easy: {
    label: "Easy",
    goal: 10,
    time: 40,
    dropSpeed: 1400,
    dropLife: 2200,
  },
  normal: {
    label: "Normal",
    goal: 15,
    time: 30,
    dropSpeed: 1100,
    dropLife: 1800,
  },
  hard: {
    label: "Hard",
    goal: 20,
    time: 25,
    dropSpeed: 800,
    dropLife: 1300,
  },
};

// Milestone messages array
const milestones = [
  {
    percent: 25,
    message: "Great start! Clean water is on the way.",
  },
  {
    percent: 50,
    message: "Halfway there! The well is coming together.",
  },
  {
    percent: 75,
    message: "Almost there! Keep collecting water drops.",
  },
  {
    percent: 100,
    message: "Well completed! You reached the clean water goal.",
  },
];

// Get HTML elements
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const scoreDisplay = document.getElementById("score");
const goalDisplay = document.getElementById("goal");
const timeLeftDisplay = document.getElementById("timeLeft");
const levelText = document.getElementById("levelText");

const progressBar = document.getElementById("progressBar");
const milestoneMessage = document.getElementById("milestoneMessage");

const gameArea = document.getElementById("gameArea");
const gameHint = document.getElementById("gameHint");

const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");

// Sound effects
// Create a sounds folder and add collect.mp3, miss.mp3, and win.mp3
const collectSound = new Audio("sounds/collect.mp3");
const missSound = new Audio("sounds/miss.mp3");
const winSound = new Audio("sounds/win.mp3");

// Game state
let currentDifficulty = "normal";
let score = 0;
let goal = difficultySettings.normal.goal;
let timeLeft = difficultySettings.normal.time;
let gameRunning = false;

let dropInterval;
let timerInterval;
let triggeredMilestones = [];

// Select difficulty
difficultyButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    if (gameRunning) {
      return;
    }

    difficultyButtons.forEach(function (btn) {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");

    currentDifficulty = button.dataset.level;
    applyDifficulty();
  });
});

// Apply difficulty settings to page
function applyDifficulty() {
  const settings = difficultySettings[currentDifficulty];

  goal = settings.goal;
  timeLeft = settings.time;

  goalDisplay.textContent = goal;
  timeLeftDisplay.textContent = timeLeft;
  levelText.textContent = settings.label;

  resetStatsOnly();

  milestoneMessage.textContent =
    `${settings.label} mode selected. Collect ${goal} water drops before time runs out.`;
}

// Start game
startBtn.addEventListener("click", function () {
  startGame();
});

// Reset game
resetBtn.addEventListener("click", function () {
  resetGame();
});

// Start game function
function startGame() {
  if (gameRunning) {
    return;
  }

  resetStatsOnly();

  gameRunning = true;
  startBtn.disabled = true;

  resultTitle.textContent = "Game in progress";
  resultMessage.textContent = "Click the water drops before they disappear!";

  gameHint.style.display = "none";

  const settings = difficultySettings[currentDifficulty];

  dropInterval = setInterval(createWaterDrop, settings.dropSpeed);

  timerInterval = setInterval(function () {
    timeLeft--;
    timeLeftDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

// Reset only game numbers
function resetStatsOnly() {
  score = 0;
  triggeredMilestones = [];

  scoreDisplay.textContent = score;
  progressBar.style.width = "0%";

  const settings = difficultySettings[currentDifficulty];
  timeLeft = settings.time;
  goal = settings.goal;

  goalDisplay.textContent = goal;
  timeLeftDisplay.textContent = timeLeft;
  levelText.textContent = settings.label;

  removeAllDrops();
}

// Full reset
function resetGame() {
  clearInterval(dropInterval);
  clearInterval(timerInterval);

  gameRunning = false;
  startBtn.disabled = false;

  resetStatsOnly();

  gameHint.style.display = "block";
  milestoneMessage.textContent = "Choose a difficulty and start collecting water drops!";
  resultTitle.textContent = "Ready to build?";
  resultMessage.textContent =
    "Start the game and collect enough water drops before time runs out.";
}

// Create water drop and add it to the DOM
function createWaterDrop() {
  if (!gameRunning) {
    return;
  }

  const drop = document.createElement("div");
  drop.classList.add("water-drop");

  const gameAreaWidth = gameArea.clientWidth;
  const gameAreaHeight = gameArea.clientHeight;

  const maxLeft = gameAreaWidth - 60;
  const maxTop = gameAreaHeight - 60;

  const randomLeft = Math.floor(Math.random() * maxLeft);
  const randomTop = Math.floor(Math.random() * maxTop);

  drop.style.left = randomLeft + "px";
  drop.style.top = randomTop + "px";

  gameArea.appendChild(drop);

  let collected = false;

  // Player collects the drop
  drop.addEventListener("click", function () {
    if (!gameRunning || collected) {
      return;
    }

    collected = true;
    score++;
    scoreDisplay.textContent = score;

    playSound(collectSound);

    drop.remove();

    updateProgress();
    checkMilestones();

    if (score >= goal) {
      endGame(true);
    }
  });

  // Drop disappears if missed
  setTimeout(function () {
    if (!collected && drop.parentElement && gameRunning) {
      drop.remove();
      playSound(missSound);
    }
  }, difficultySettings[currentDifficulty].dropLife);
}

// Update progress bar
function updateProgress() {
  const progressPercent = Math.min((score / goal) * 100, 100);
  progressBar.style.width = progressPercent + "%";
}

// Check milestone messages
function checkMilestones() {
  const progressPercent = (score / goal) * 100;

  milestones.forEach(function (milestone) {
    if (
      progressPercent >= milestone.percent &&
      !triggeredMilestones.includes(milestone.percent)
    ) {
      milestoneMessage.textContent = milestone.message;
      triggeredMilestones.push(milestone.percent);
    }
  });
}

// End game
function endGame(playerWon) {
  clearInterval(dropInterval);
  clearInterval(timerInterval);

  gameRunning = false;
  startBtn.disabled = false;

  removeAllDrops();

  if (playerWon) {
    playSound(winSound);
    resultTitle.textContent = "You built the well!";
    resultMessage.textContent =
      `Amazing work! You collected ${score} water drops and helped bring clean water closer to a community.`;
    milestoneMessage.textContent =
      "Mission complete! Clean water changes everything.";
  } else {
    resultTitle.textContent = "Time is up!";
    resultMessage.textContent =
      `You collected ${score} out of ${goal} water drops. Try again and help finish the well.`;
    milestoneMessage.textContent =
      "Keep going! Every drop still matters.";
  }

  gameHint.style.display = "block";
  gameHint.textContent = "Click Start Game to try again.";
}

// Remove all water drops from the DOM
function removeAllDrops() {
  const drops = document.querySelectorAll(".water-drop");

  drops.forEach(function (drop) {
    drop.remove();
  });
}

// Play sound safely
function playSound(sound) {
  sound.currentTime = 0;

  sound.play().catch(function () {
    // Some browsers block sound until the user interacts.
    // This prevents the game from crashing.
  });
}

// Load normal settings when page opens
applyDifficulty();
