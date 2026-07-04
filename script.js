// Build the Well Puzzle
// This file controls the game logic, score, progress bar, step cards,
// obstacle penalty, restart button, and win celebration.

document.addEventListener("DOMContentLoaded", function () {
  // -----------------------------
  // Get HTML elements
  // -----------------------------
  const startButton = document.querySelector("#startButton");
  const restartButton = document.querySelector("#restartButton");
  const obstacleButton = document.querySelector("#obstacleButton");

  const scoreDisplay = document.querySelector("#scoreDisplay");
  const finalScore = document.querySelector("#finalScore");

  const progressText = document.querySelector("#progressText");
  const progressFill = document.querySelector("#progressFill");

  const messageText = document.querySelector("#messageText");
  const successText = document.querySelector("#successText");
  const stageLabel = document.querySelector("#stageLabel");
  const wellCaption = document.querySelector("#wellCaption");

  const stepCards = document.querySelectorAll(".step-card");
  const wellParts = document.querySelectorAll(".well-part");

  const winPanel = document.querySelector("#winPanel");
  const confettiContainer = document.querySelector("#confettiContainer");

  // -----------------------------
  // Game data
  // -----------------------------
  const projectSteps = [
    {
      title: "Find a Community",
      feedback: "Community selected.",
      success: "Great! You found a community in need.",
      wellCaption: "Stage 1 complete: the community has been selected.",
      points: 25
    },
    {
      title: "Fund the Project",
      feedback: "Project funded.",
      success: "Great! The project has funding support.",
      wellCaption: "Stage 2 complete: the well foundation is ready.",
      points: 25
    },
    {
      title: "Build the Well",
      feedback: "Well built.",
      success: "Great! The well structure is now built.",
      wellCaption: "Stage 3 complete: the well structure is standing.",
      points: 25
    },
    {
      title: "Share the Impact",
      feedback: "Impact shared.",
      success: "Great! The impact has been shared with others.",
      wellCaption: "Stage 4 complete: the well is finished.",
      points: 25
    }
  ];

  // -----------------------------
  // Game state variables
  // -----------------------------
  let gameStarted = false;
  let gameWon = false;
  let currentStep = 0;
  let score = 0;

  // -----------------------------
  // Start the game
  // -----------------------------
  function startGame() {
    if (gameStarted) {
      messageText.textContent = "The game has already started. Complete the active step.";
      return;
    }

    gameStarted = true;
    gameWon = false;

    messageText.textContent = "Game started. Click the active project step.";
    successText.textContent = "Step 1 is active: Find a Community.";

    startButton.textContent = "Game Started";
    startButton.disabled = true;

    updateDisplay();
  }

  // -----------------------------
  // Handle step card clicks
  // -----------------------------
  function handleStepClick(event) {
    const clickedCard = event.currentTarget;
    const clickedStep = Number(clickedCard.dataset.step);

    // The player must press Start first.
    if (!gameStarted) {
      messageText.textContent = "Click Start Game before choosing a project step.";
      return;
    }

    // The game is complete, so no more steps can be clicked.
    if (gameWon) {
      messageText.textContent = "The project is complete. Press Restart to play again.";
      return;
    }

    // If the player clicks a step that is already complete.
    if (clickedStep < currentStep) {
      messageText.textContent = "That step is already complete.";
      return;
    }

    // If the player clicks a locked future step.
    if (clickedStep > currentStep) {
      messageText.textContent = "Complete the current step first.";
      return;
    }

    // If the player clicked the correct active step.
    completeCurrentStep();
  }

  // -----------------------------
  // Complete the current active step
  // -----------------------------
  function completeCurrentStep() {
    const step = projectSteps[currentStep];

    score += step.points;
    currentStep += 1;

    messageText.textContent = step.feedback;
    successText.textContent = step.success;
    wellCaption.textContent = step.wellCaption;

    updateDisplay();

    // Check if all four steps are complete.
    if (currentStep === projectSteps.length) {
      winGame();
    } else {
      const nextStep = projectSteps[currentStep];
      successText.textContent = `${step.success} Next step unlocked: ${nextStep.title}.`;
    }
  }

  // -----------------------------
  // Obstacle button logic
  // -----------------------------
  function handleObstacleClick() {
    if (!gameStarted) {
      messageText.textContent = "Start the game before facing project delays.";
      return;
    }

    if (gameWon) {
      messageText.textContent = "The project is already complete. Press Restart to play again.";
      return;
    }

    // Reduce the score, but do not let the score go below 0.
    score -= 10;

    if (score < 0) {
      score = 0;
    }

    messageText.textContent = "Muddy water delay! You lost 10 points.";
    successText.textContent = "Stay focused and keep building the project.";

    updateDisplay();
  }

  // -----------------------------
  // Update score, progress, cards, and well visuals
  // -----------------------------
  function updateDisplay() {
    updateScore();
    updateProgress();
    updateStepCards();
    updateWellVisual();
  }

  // -----------------------------
  // Update score text
  // -----------------------------
  function updateScore() {
    scoreDisplay.textContent = score;
    finalScore.textContent = score;
  }

  // -----------------------------
  // Update progress bar
  // -----------------------------
  function updateProgress() {
    const progressPercent = currentStep * 25;

    progressText.textContent = `${progressPercent}%`;
    progressFill.style.width = `${progressPercent}%`;
    stageLabel.textContent = `Stage ${currentStep}`;
  }

  // -----------------------------
  // Update the step card classes and labels
  // -----------------------------
  function updateStepCards() {
    stepCards.forEach(function (card) {
      const stepIndex = Number(card.dataset.step);
      const status = card.querySelector(".step-status");

      card.classList.remove("active-step", "locked-step", "completed-step");

      // Before the game starts, all cards should be visually locked.
      if (!gameStarted) {
        card.classList.add("locked-step");
        card.setAttribute("aria-disabled", "true");

        if (stepIndex === 0) {
          status.textContent = "Start First";
        } else {
          status.textContent = "Locked";
        }

        return;
      }

      // Completed steps
      if (stepIndex < currentStep) {
        card.classList.add("completed-step");
        card.setAttribute("aria-disabled", "false");
        status.textContent = "Complete";
        return;
      }

      // Current active step
      if (stepIndex === currentStep && !gameWon) {
        card.classList.add("active-step");
        card.setAttribute("aria-disabled", "false");
        status.textContent = "Active";
        return;
      }

      // Locked future steps
      card.classList.add("locked-step");
      card.setAttribute("aria-disabled", "true");
      status.textContent = "Locked";
    });
  }

  // -----------------------------
  // Show well parts based on progress
  // -----------------------------
  function updateWellVisual() {
    wellParts.forEach(function (part) {
      const partStage = Number(part.dataset.stage);

      if (partStage <= currentStep) {
        part.classList.add("active-well-part");
        part.setAttribute("aria-hidden", "false");
      } else {
        part.classList.remove("active-well-part");
        part.setAttribute("aria-hidden", "true");
      }
    });

    if (currentStep === 0) {
      wellCaption.textContent = "No project steps completed yet. Start the game to begin building.";
    }
  }

  // -----------------------------
  // Win the game
  // -----------------------------
  function winGame() {
    gameWon = true;

    messageText.textContent = "Project complete! Clean water changes everything.";
    successText.textContent = "You brought clean water to a community in need.";

    winPanel.classList.remove("hidden");

    startButton.textContent = "Project Complete";
    startButton.disabled = true;

    updateDisplay();
    launchConfetti();
  }

  // -----------------------------
  // Restart the game
  // -----------------------------
  function restartGame() {
    gameStarted = false;
    gameWon = false;
    currentStep = 0;
    score = 0;

    messageText.textContent = "Click Start Game to begin.";
    successText.textContent = "Complete each step to build the well.";
    wellCaption.textContent = "No project steps completed yet. Start the game to begin building.";

    startButton.textContent = "▶ Start Game";
    startButton.disabled = false;

    winPanel.classList.add("hidden");
    confettiContainer.innerHTML = "";

    updateDisplay();
  }

  // -----------------------------
  // Create a simple confetti effect
  // -----------------------------
  function launchConfetti() {
    confettiContainer.innerHTML = "";

    const confettiColors = [
      "#ffc907",
      "#2e9df7",
      "#8bd1cb",
      "#4fcb53",
      "#ff902a",
      "#f16061"
    ];

    for (let i = 0; i < 45; i++) {
      const confettiPiece = document.createElement("span");

      confettiPiece.classList.add("confetti-piece");

      confettiPiece.style.left = `${Math.random() * 100}%`;
      confettiPiece.style.backgroundColor = confettiColors[i % confettiColors.length];
      confettiPiece.style.animationDelay = `${Math.random() * 0.6}s`;
      confettiPiece.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;

      confettiContainer.appendChild(confettiPiece);
    }

    // Remove confetti after the animation finishes.
    setTimeout(function () {
      confettiContainer.innerHTML = "";
    }, 4500);
  }

  // -----------------------------
  // Event listeners
  // -----------------------------
  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", restartGame);
  obstacleButton.addEventListener("click", handleObstacleClick);

  stepCards.forEach(function (card) {
    card.addEventListener("click", handleStepClick);
  });

  // -----------------------------
  // Set the starting screen
  // -----------------------------
  restartGame();
});
