let quote = "";
let timer = 0;
let interval;
let isPlaying = false;
let isSubmitted = false;
let soundEnabled = true;

const quoteDisplay = document.getElementById("quote");
const input = document.getElementById("input");
const timerDisplay = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const submitBtn = document.getElementById("submitBtn");

const resultModal = document.getElementById("resultModal");
const resultWPM = document.getElementById("resultWPM");
const resultAccuracy = document.getElementById("resultAccuracy");
const resultMistakes = document.getElementById("resultMistakes");

const typeSound = new Audio("assets/type.mp3");
const completeSound = new Audio("assets/complete.mp3");

// ✅ Quotes for both difficulties
const staticQuotes = [
  // Easy
  "Push yourself, because no one else will.",
  "Dream it. Wish it. Do it.",
  "Work hard in silence.",
  "Success is no accident.",
  "Great things take time.",
  // Hard
  "Success doesn’t come from what you do occasionally, it comes from what you do consistently.",
  "Your time is limited, so don’t waste it living someone else’s life. Have the courage to follow your heart.",
  "Hard work beats talent when talent doesn't work hard. Always stay hungry, stay humble.",
  "In the middle of every difficulty lies opportunity. Keep going and trust the process.",
  "Discipline is the bridge between goals and accomplishment. Stay focused and be patient."
];

// ✅ Get random quote based on difficulty
function getRandomQuote() {
  const difficulty = document.getElementById("difficulty").value;
  const filtered = staticQuotes.filter(q =>
    difficulty === "easy" ? q.length <= 60 : q.length > 60
  );
  if (filtered.length === 0) return "No quote available.";
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// ✅ Load a new quote
function loadQuote() {
  quoteDisplay.textContent = "Loading...";
  setTimeout(() => {
    quote = getRandomQuote();
    quoteDisplay.textContent = quote;
  }, 200);

  input.value = "";
  timer = 0;
  isPlaying = false;
  isSubmitted = false;
  clearInterval(interval);
  timerDisplay.textContent = 0;
  wpmDisplay.textContent = 0;
  accuracyDisplay.textContent = 0;
  submitBtn.disabled = false;
  closeModal();
}

// ✅ Calculate WPM, accuracy
function calculateStats() {
  const typed = input.value;
  let correctChars = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === quote[i]) correctChars++;
  }

  const wordsTyped = typed.trim().split(/\s+/).length;
  const wpm = Math.round((wordsTyped / timer) * 60) || 0;
  const accuracy = Math.round((correctChars / typed.length) * 100) || 0;

  wpmDisplay.textContent = wpm;
  accuracyDisplay.textContent = accuracy;
}

// ✅ Submit logic
function submitGame() {
  clearInterval(interval);
  if (soundEnabled) completeSound.play();
  calculateStats();
  isSubmitted = true;
  submitBtn.disabled = true;

  const typed = input.value;
  let mistakes = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== quote[i]) mistakes++;
  }

  resultWPM.textContent = wpmDisplay.textContent;
  resultAccuracy.textContent = accuracyDisplay.textContent;
  resultMistakes.textContent = mistakes;
  resultModal.style.display = "flex";

  saveScore(
    parseInt(wpmDisplay.textContent),
    parseInt(accuracyDisplay.textContent)
  );
  displayLeaderboard();
}

function closeModal() {
  resultModal.style.display = "none";
}

function restartGame() {
  loadQuote();
}

// ✅ Save to local leaderboard
function saveScore(wpm, accuracy) {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  scores.push({ wpm, accuracy, date: new Date().toLocaleString() });
  scores.sort((a, b) => b.wpm - a.wpm);
  scores = scores.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

function displayLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const leaderboardList = document.getElementById("leaderboardList");
  leaderboardList.innerHTML = "";
  scores.forEach(score => {
    const li = document.createElement("li");
    li.textContent = `WPM: ${score.wpm}, Accuracy: ${score.accuracy}%, Date: ${score.date}`;
    leaderboardList.appendChild(li);
  });
}

// ✅ Listeners
input.addEventListener("input", () => {
  if (!isPlaying) {
    isPlaying = true;
    interval = setInterval(() => {
      timer++;
      timerDisplay.textContent = timer;
      calculateStats();
    }, 1000);
  }

  if (input.value === quote && !isSubmitted) {
    submitGame();
  } else {
    calculateStats();
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key.length === 1 && soundEnabled) {
    typeSound.currentTime = 0;
    typeSound.play();
  }
});

submitBtn.addEventListener("click", () => {
  if (!isSubmitted) {
    submitGame();
  }
});

document.getElementById("difficulty").addEventListener("change", () => {
  restartGame();
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  const menu = document.getElementById("settingsMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

document.getElementById("soundToggle").addEventListener("change", (e) => {
  soundEnabled = e.target.checked;
});

document.getElementById("themeToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("light", e.target.checked);
});

// ✅ Init
window.onload = () => {
  loadQuote();
  displayLeaderboard();
};
