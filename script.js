// Build the Well Puzzle
// This file controls the game logic, difficulty modes, timer, score,
// water drop collection, delay obstacles, milestones, sounds, and win state.

document.addEventListener("DOMContentLoaded", function () {
  // -----------------------------
  // HTML elements
  // -----------------------------
  const startButton = document.querySelector("#startButton");
  const restartButton = document.querySelector("#restartButton");

  const scoreDisplay = document.querySelector("#scoreDisplay");
  const targetDisplay = document.querySelector("#targetDisplay");
  const timerDisplay = document.querySelector("#timerDisplay");
  const finalScore = document.querySelector("#finalScore");
  const finalMode = document.querySelector("#finalMode");
  const finalTime = document.querySelector("#finalTime");
  const finalMilestone = document.querySelector("#finalMilestone");

  const progressText = document.querySelector("#progressText");
  const progressFill = document.querySelector("#progressFill");

  const messageText = document.querySelector("#messageText");
  const successText = document.querySelector("#successText");
  const milestoneText = document.querySelector("#milestoneText");
  const difficultySummary = document.querySelector("#difficultySummary");

  const stageLabel = document.querySelector("#stageLabel");
  const wellCaption = document.querySelector("#wellCaption");

  const stepCards = document.querySelectorAll(".step-card");
  const wellParts = document.querySelectorAll(".well-part");
  const difficultyInputs = document.querySelectorAll("input[name='difficultyMode']");

  const dropZone = document.querySelector("#dropZone");
  const obstacleZone = document.querySelector("#obstacleZone");

  const winPanel = document.querySelector("#winPanel");
  const confettiContainer = document.querySelector("#confettiContainer");

  // -----------------------------
  // Sound effects
  // -----------------------------
  const sounds = {
    collect: new Audio("sounds/collect.mp3"),
    miss: new Audio("sounds/miss.mp3"),
    win: new Audio("sounds/win.mp3")
  };

  sounds.collect.volume = 0.65;
  sounds.miss.volume = 0.65;
  sounds.win.volume = 0.75;

  function playSound(soundName) {
    const sound = sounds[soundName];

    if (!sound) {
      return;
    }

    // Clone the sound so quick clicks can overlap.
    const soundClone = sound.cloneNode();
    soundClone.volume = sound.volume;

    soundClone.play().catch(function () {
      // Some browsers block sounds until the user interacts with the page.
    });
  }

  // -----------------------------
  // Difficulty settings
  // -----------------------------
  const difficulties = {
    easy: {
      label: "Easy",
      timeLimit: 90,
      targetScore: 100,
      stepPoints: 25,
      dropPoints: 5,
      dropsPerStep: 2,
      obstaclePenalty: 5,
      wrongPenalty: 0,
      obstacleChance: 0.35,
      maxObstacles: 2,
      summary: "Easy: 90 seconds, goal 100 points, light penalties."
    },
    normal: {
      label: "Normal",
      timeLimit: 60,
      targetScore: 120,
      stepPoints: 25,
      dropPoints: 10,
      dropsPerStep: 2,
      obstaclePenalty: 10,
      wrongPenalty: 0,
      obstacleChance: 0.75,
      maxObstacles: 3,
      summary: "Normal: 60 seconds, goal 120 points, medium penalties."
    },
    hard: {
      label: "Hard",
      timeLimit: 45,
      targetScore: 140,
      stepPoints: 25,
      dropPoints: 15,
      dropsPerStep: 3,
      obstaclePenalty: 15,
      wrongPenalty: 5,
      obstacleChance: 1,
      maxObstacles: 4,
      summary: "Hard: 45 seconds, goal 140 points, bigger penalties and wrong-click costs."
    }
  };

  let selectedDifficulty = difficulties.easy;

  // -----------------------------
  // Game steps
  // -----------------------------
  const projectSteps = [
    {
      title: "Find a Community",
      feedback: "Community selected.",
      success: "Great! You found a community in need.",
      wellCaption: "Stage 1 complete: the community has been selected."
    },
    {
      title: "Fund the Project",
      feedback: "Project funded.",
      success: "Great! The project has funding support.",
      wellCaption: "Stage 2 complete: the well foundation is ready."
    },
    {
      title: "Build the Well",
      feedback: "Well built.",
      success: "Great! The well structure is now built.",
      wellCaption: "Stage 3 complete: the well structure is standing."
    },
    {
      title: "Share the Impact",
      feedback: "Impact shared.",
      success: "Great! The impact has been shared with others.",
      wellCaption: "Stage 4 complete: the well is finished."
    }
  ];

  // -----------------------------
  // Milestone messages
  // -----------------------------
  const milestoneMessages = [
    {
      score: 25,
      text: "Milestone: First step complete!"
    },
    {
      score: 50,
      text: "Milestone: Halfway through the project steps!"
    },
    {
      score: 75,
      text: "Milestone: The well is getting closer!"
    },
    {
      score: 100,
      text: "Milestone: Clean water is within reach!"
    },
    {
      score: 120,
      text: "Milestone: You reached the Normal goal!"
    },
    {
      score: 140,
      text: "Milestone: You reached the Hard goal!"
    }
  ];

  // -----------------------------
  // Game state
  // -----------------------------
  let gameStarted = false;
  let gameOver = false;
  let currentStep = 0;
  let score = 0;
  let timeLeft = selectedDifficulty.timeLimit;
  let timerInterval = null;
  let reachedMilestones = [];

  // -----------------------------
  // Difficulty helpers
  // -----------------------------
  function getSelectedDifficultyKey() {
    const checkedInput = document.querySelector("input[name='difficultyMode']:checked");

    if (checkedInput) {
      return checkedInput.value;
    }

    return "easy";
  }

  function applySelectedDifficulty() {
    const difficultyKey = getSelectedDifficultyKey();
    selectedDifficulty = difficulties[difficultyKey];

    timeLeft = selectedDifficulty.timeLimit;

    targetDisplay.textContent = selectedDifficulty.targetScore;
    timerDisplay.textContent = `${timeLeft}s`;
    difficultySummary.textContent = selectedDifficulty.summary;
  }

  function setDifficultyInputsDisabled(isDisabled) {
    difficultyInputs.forEach(function (input) {
      input.disabled = isDisabled;
    });
  }

  // -----------------------------
  // Start game
  // -----------------------------
  function startGame() {
    if (gameStarted) {
      messageText.textContent = "The game has already started. Complete the active step.";
      return;
    }

    applySelectedDifficulty();

    gameStarted = true;
    gameOver = false;
    currentStep = 0;
    score = 0;
    reachedMilestones = [];

    clearDrops();
    clearObstacles();

    startButton.textContent = "Game Started";
    startButton.disabled = true;
    setDifficultyInputsDisabled(true);

    messageText.textContent = "Game started. Click the active project step.";
    successText.textContent = "Step 1 is active: Find a Community.";
    milestoneText.textContent = "Milestone messages will appear as your score grows.";
    wellCaption.textContent = "Complete each step to build the well.";

    updateDisplay();
    startTimer();
  }

  // -----------------------------
  // Timer
  // -----------------------------
  function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(function () {
      if (!gameStarted || gameOver) {
        return;
      }

      timeLeft -= 1;
      updateTimerDisplay();

      if (timeLeft <= 0) {
        endGameByTime();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    timerDisplay.textContent = `${timeLeft}s`;

    if (timeLeft <= 10 && gameStarted) {
      timerDisplay.classList.add("timer-warning");
    } else {
      timerDisplay.classList.remove("timer-warning");
    }
  }

  function endGameByTime() {
    gameStarted = false;
    gameOver = true;
    timeLeft = 0;

    clearInterval(timerInterval);
    playSound("miss");

    messageText.textContent = "Time is up! Press Restart to try again.";
    successText.textContent = "The project needs more time. Try a different strategy.";
    milestoneText.textContent = "Tip: collect water drops to reach the score goal faster.";

    startButton.textContent = "Time's Up";
    startButton.disabled = true;

    updateDisplay();
  }

  // -----------------------------
  // Step clicks
  // -----------------------------
  function handleStepClick(event) {
    const clickedCard = event.currentTarget;
    const clickedStep = Number(clickedCard.dataset.step);

    if (!gameStarted) {
      messageText.textContent = "Click Start Game before choosing a project step.";
      playSound("miss");
      return;
    }

    if (gameOver) {
      messageText.textContent = "The game is over. Press Restart to play again.";
      return;
    }

    if (clickedStep < currentStep) {
      messageText.textContent = "That step is already complete.";
      return;
    }

    if (clickedStep > currentStep) {
      handleWrongStepClick();
      return;
    }

    completeCurrentStep();
  }

  function handleWrongStepClick() {
    playSound("miss");

    if (selectedDifficulty.wrongPenalty > 0) {
      score -= selectedDifficulty.wrongPenalty;

      if (score < 0) {
        score = 0;
      }

      messageText.textContent = `Wrong step! Hard mode penalty: -${selectedDifficulty.wrongPenalty} points.`;
    } else {
      messageText.textContent = "Complete the current step first.";
    }

    successText.textContent = "Follow the project steps in order.";
    updateDisplay();
  }

  function completeCurrentStep() {
    const step = projectSteps[currentStep];

    score += selectedDifficulty.stepPoints;
    currentStep += 1;

    playSound("collect");

    messageText.textContent = `${step.feedback} +${selectedDifficulty.stepPoints} points.`;
    successText.textContent = step.success;
    wellCaption.textContent = step.wellCaption;

    createWaterDrops(selectedDifficulty.dropsPerStep);
    maybeCreateObstacle();
    checkMilestones();
    updateDisplay();

    if (currentStep < projectSteps.length) {
      const nextStep = projectSteps[currentStep];
      successText.textContent = `${step.success} Next step unlocked: ${nextStep.title}.`;
    }

    checkWinCondition();
  }

  // -----------------------------
  // Water drops
  // -----------------------------
  function createWaterDrops(amount) {
    const emptyMessage = dropZone.querySelector(".drop-empty");

    if (emptyMessage) {
      emptyMessage.remove();
    }

    for (let i = 0; i < amount; i++) {
      const dropButton = document.createElement("button");

      dropButton.type = "button";
      dropButton.classList.add("water-drop");
      dropButton.textContent = "💧";
      dropButton.style.setProperty("--drop-delay", `${Math.random() * 0.4}s`);
      dropButton.setAttribute(
        "aria-label",
        `Collect clean water drop worth ${selectedDifficulty.dropPoints} points`
      );

      dropButton.addEventListener("click", collectWaterDrop);

      dropZone.appendChild(dropButton);
    }
  }

  function collectWaterDrop(event) {
    if (!gameStarted || gameOver) {
      return;
    }

    const clickedDrop = event.currentTarget;

    clickedDrop.remove();

    score += selectedDifficulty.dropPoints;

    playSound("collect");

    messageText.textContent = `Clean water drop collected! +${selectedDifficulty.dropPoints} points.`;
    successText.textContent = "Great job collecting extra clean water points.";

    checkMilestones();
    updateDisplay();
    updateDropZoneMessage();
    checkWinCondition();
  }

  function clearDrops() {
    dropZone.innerHTML = '<p class="drop-empty">Water drops will appear after each completed step.</p>';
  }

  function updateDropZoneMessage() {
    const remainingDrops = dropZone.querySelectorAll(".water-drop");

    if (remainingDrops.length === 0) {
      dropZone.innerHTML = '<p class="drop-empty">No water drops right now. Complete another step to create more.</p>';
    }
  }

  // -----------------------------
  // Obstacles
  // -----------------------------
  function maybeCreateObstacle() {
    const existingObstacles = obstacleZone.querySelectorAll(".obstacle-token");

    if (existingObstacles.length >= selectedDifficulty.maxObstacles) {
      return;
    }

    const randomNumber = Math.random();

    if (randomNumber <= selectedDifficulty.obstacleChance) {
      createObstacle();
    }
  }

  function createObstacle() {
    const emptyMessage = obstacleZone.querySelector(".obstacle-empty");

    if (emptyMessage) {
      emptyMessage.remove();
    }

    const obstacleButton = document.createElement("button");

    obstacleButton.type = "button";
    obstacleButton.classList.add("obstacle-token");
    obstacleButton.textContent = `Muddy Delay -${selectedDifficulty.obstaclePenalty}`;
    obstacleButton.setAttribute(
      "aria-label",
      `Clear muddy delay and lose ${selectedDifficulty.obstaclePenalty} points`
    );

    obstacleButton.addEventListener("click", clearObstacle);

    obstacleZone.appendChild(obstacleButton);
  }

  function clearObstacle(event) {
    if (!gameStarted || gameOver) {
      return;
    }

    const obstacle = event.currentTarget;

    obstacle.remove();

    score -= selectedDifficulty.obstaclePenalty;

    if (score < 0) {
      score = 0;
    }

    playSound("miss");

    messageText.textContent = `Delay cleared, but it cost ${selectedDifficulty.obstaclePenalty} points.`;
    successText.textContent = "Keep going. Project challenges can be solved.";

    updateDisplay();
    updateObstacleZoneMessage();
  }

  function clearObstacles() {
    obstacleZone.innerHTML = '<p class="obstacle-empty">No delays yet.</p>';
  }

  function updateObstacleZoneMessage() {
    const remainingObstacles = obstacleZone.querySelectorAll(".obstacle-token");

    if (remainingObstacles.length === 0) {
      obstacleZone.innerHTML = '<p class="obstacle-empty">No delays right now.</p>';
    }
  }

  // -----------------------------
  // Milestones
  // -----------------------------
  function checkMilestones() {
    let newestMilestone = "";

    milestoneMessages.forEach(function (milestone) {
      const alreadyReached = reachedMilestones.includes(milestone.score);

      if (score >= milestone.score && !alreadyReached) {
        reachedMilestones.push(milestone.score);
        newestMilestone = milestone.text;
      }
    });

    if (newestMilestone !== "") {
      milestoneText.textContent = newestMilestone;
      milestoneText.classList.remove("milestone-pop");

      // Restart the animation.
      void milestoneText.offsetWidth;

      milestoneText.classList.add("milestone-pop");
    }
  }

  // -----------------------------
  // Display updates
  // -----------------------------
  function updateDisplay() {
    updateScore();
    updateProgress();
    updateStepCards();
    updateWellVisual();
    updateTimerDisplay();
  }

  function updateScore() {
    scoreDisplay.textContent = score;
    finalScore.textContent = score;
    targetDisplay.textContent = selectedDifficulty.targetScore;
  }

  function updateProgress() {
    const progressPercent = currentStep * 25;

    progressText.textContent = `${progressPercent}%`;
    progressFill.style.width = `${progressPercent}%`;
    stageLabel.textContent = `Stage ${currentStep}`;
  }

  function updateStepCards() {
    stepCards.forEach(function (card) {
      const stepIndex = Number(card.dataset.step);
      const status = card.querySelector(".step-status");

      card.classList.remove("active-step", "locked-step", "completed-step");

      if (!gameStarted && currentStep === 0) {
        card.classList.add("locked-step");

        if (stepIndex === 0) {
          status.textContent = "Start First";
        } else {
          status.textContent = "Locked";
        }

        return;
      }

      if (stepIndex < currentStep) {
        card.classList.add("completed-step");
        status.textContent = "Complete";
        return;
      }

      if (stepIndex === currentStep && gameStarted && !gameOver) {
        card.classList.add("active-step");
        status.textContent = "Active";
        return;
      }

      card.classList.add("locked-step");
      status.textContent = "Locked";
    });
  }

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
      wellCaption.textContent = "Start the game to begin building the well.";
    }
  }

  // -----------------------------
  // Win condition
  // -----------------------------
  function checkWinCondition() {
    const allStepsComplete = currentStep === projectSteps.length;
    const scoreGoalReached = score >= selectedDifficulty.targetScore;

    if (allStepsComplete && scoreGoalReached) {
      winGame();
      return;
    }

    if (allStepsComplete && !scoreGoalReached) {
      messageText.textContent = `All steps are complete. Collect more water drops to reach ${selectedDifficulty.targetScore} points.`;
      successText.textContent = "The well is built. Now reach the score goal before time runs out.";
    }
  }

  function winGame() {
    gameStarted = false;
    gameOver = true;

    clearInterval(timerInterval);

    playSound("win");

    messageText.textContent = "Project complete! Clean water changes everything.";
    successText.textContent = "You reached the goal and completed the clean water project.";
    milestoneText.textContent = "Final milestone: community impact unlocked!";

    finalScore.textContent = score;
    finalMode.textContent = selectedDifficulty.label;
    finalTime.textContent = `${timeLeft}s`;
    finalMilestone.textContent = "You helped bring clean water closer to a community in need.";

    winPanel.classList.remove("hidden");

    startButton.textContent = "Project Complete";
    startButton.disabled = true;

    updateDisplay();
    launchConfetti();
  }

  // -----------------------------
  // Restart
  // -----------------------------
  function restartGame() {
    clearInterval(timerInterval);

    applySelectedDifficulty();

    gameStarted = false;
    gameOver = false;
    currentStep = 0;
    score = 0;
    reachedMilestones = [];

    startButton.textContent = "▶ Start Game";
    startButton.disabled = false;

    setDifficultyInputsDisabled(false);

    messageText.textContent = "Choose a difficulty mode, then click Start Game.";
    successText.textContent = "Complete each project step to build the well.";
    milestoneText.textContent = "Milestone messages will appear as your score grows.";
    wellCaption.textContent = "Start the game to begin building the well.";

    winPanel.classList.add("hidden");

    clearDrops();
    clearObstacles();
    confettiContainer.innerHTML = "";

    updateDisplay();
  }

  // -----------------------------
  // Confetti
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

    for (let i = 0; i < 55; i++) {
      const confettiPiece = document.createElement("span");

      confettiPiece.classList.add("confetti-piece");

      confettiPiece.style.left = `${Math.random() * 100}%`;
      confettiPiece.style.backgroundColor = confettiColors[i % confettiColors.length];
      confettiPiece.style.animationDelay = `${Math.random() * 0.7}s`;
      confettiPiece.style.animationDuration = `${2.6 + Math.random() * 1.6}s`;

      confettiContainer.appendChild(confettiPiece);
    }

    setTimeout(function () {
      confettiContainer.innerHTML = "";
    }, 4800);
  }

  // -----------------------------
  // Event listeners
  // -----------------------------
  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", restartGame);

  stepCards.forEach(function (card) {
    card.addEventListener("click", handleStepClick);
  });

  difficultyInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      if (!gameStarted && !gameOver) {
        applySelectedDifficulty();
        updateDisplay();
      }
    });
  });

  // -----------------------------
  // Initial screen
  // -----------------------------
  restartGame();
});
