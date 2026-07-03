// fitness.js - FitnexaX smart fitness tracker

const EXERCISE_LIBRARY = [
  // Chest / upper body
  { name: "Push-ups", difficulty: "beginner", muscle: "chest" },
  { name: "Incline Push-ups", difficulty: "beginner", muscle: "chest" },
  { name: "Wide Push-ups", difficulty: "intermediate", muscle: "chest" },
  { name: "Diamond Push-ups", difficulty: "advanced", muscle: "chest" },
  { name: "Decline Push-ups", difficulty: "advanced", muscle: "chest" },
  { name: "Pike Push-ups", difficulty: "intermediate", muscle: "shoulders" },
  { name: "Shoulder Taps", difficulty: "beginner", muscle: "shoulders" },
  { name: "Arm Circles", difficulty: "beginner", muscle: "shoulders" },
  { name: "Tricep Dips (chair)", difficulty: "intermediate", muscle: "arms" },
  { name: "Superman Hold", difficulty: "beginner", muscle: "back" },
  { name: "Reverse Snow Angels", difficulty: "intermediate", muscle: "back" },
  { name: "Inchworms", difficulty: "intermediate", muscle: "back" },
  // Legs / lower body
  { name: "Bodyweight Squats", difficulty: "beginner", muscle: "legs" },
  { name: "Sumo Squats", difficulty: "beginner", muscle: "legs" },
  { name: "Jump Squats", difficulty: "intermediate", muscle: "legs" },
  { name: "Pistol Squats", difficulty: "advanced", muscle: "legs" },
  { name: "Lunges", difficulty: "beginner", muscle: "legs" },
  { name: "Reverse Lunges", difficulty: "beginner", muscle: "legs" },
  { name: "Jumping Lunges", difficulty: "advanced", muscle: "legs" },
  { name: "Glute Bridges", difficulty: "beginner", muscle: "legs" },
  { name: "Single-Leg Glute Bridge", difficulty: "intermediate", muscle: "legs" },
  { name: "Calf Raises", difficulty: "beginner", muscle: "legs" },
  { name: "Wall Sit", difficulty: "intermediate", muscle: "legs" },
  { name: "Step-ups", difficulty: "beginner", muscle: "legs" },
  // Core
  { name: "Plank", difficulty: "beginner", muscle: "core" },
  { name: "Side Plank", difficulty: "intermediate", muscle: "core" },
  { name: "Plank Up-Downs", difficulty: "advanced", muscle: "core" },
  { name: "Crunches", difficulty: "beginner", muscle: "core" },
  { name: "Bicycle Crunches", difficulty: "intermediate", muscle: "core" },
  { name: "Leg Raises", difficulty: "intermediate", muscle: "core" },
  { name: "Russian Twists", difficulty: "intermediate", muscle: "core" },
  { name: "Dead Bug", difficulty: "beginner", muscle: "core" },
  { name: "V-Ups", difficulty: "advanced", muscle: "core" },
  { name: "Flutter Kicks", difficulty: "intermediate", muscle: "core" },
  // Cardio / full body
  { name: "Jumping Jacks", difficulty: "beginner", muscle: "cardio" },
  { name: "High Knees", difficulty: "beginner", muscle: "cardio" },
  { name: "Butt Kicks", difficulty: "beginner", muscle: "cardio" },
  { name: "Mountain Climbers", difficulty: "intermediate", muscle: "cardio" },
  { name: "Burpees", difficulty: "advanced", muscle: "cardio" },
  { name: "Skaters", difficulty: "intermediate", muscle: "cardio" },
  { name: "Squat Thrusts", difficulty: "intermediate", muscle: "cardio" },
  { name: "Star Jumps", difficulty: "advanced", muscle: "cardio" },
  { name: "Bear Crawl", difficulty: "advanced", muscle: "full-body" },
  { name: "Sprawls", difficulty: "advanced", muscle: "full-body" }
];

function videoLink(name) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent("how to do " + name + " exercise")}`;
}

let currentWorkout = null;
let currentExerciseIndex = 0;
let exerciseTimerInterval = null;
let workoutStartedAt = null;
let elapsedSeconds = 0;
let isPaused = false;

document.addEventListener("DOMContentLoaded", () => {
  const user = getSessionUser();
  if (!user) return;

  initWorkoutGenerator(user);
  initLiveTracker();
  renderFitnessStats(user);
  renderAchievements(user);
  renderWorkoutHistory(user);
});

// ---------- Generator ----------
function initWorkoutGenerator(user) {
  const form = document.getElementById("workoutGeneratorForm");
  const listEl = document.getElementById("generatedWorkout");
  if (!form || !listEl) return;

  // preselect user's fitness level
  const levelSel = document.getElementById("genFitnessLevel");
  if (levelSel && user.profile.fitnessLevel) levelSel.value = user.profile.fitnessLevel;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const level = document.getElementById("genFitnessLevel").value;
    const category = document.getElementById("genCategory").value;
    const duration = Number(document.getElementById("genDuration").value);

    currentWorkout = generateWorkoutPlan(level, category, duration);
    currentExerciseIndex = 0;
    renderWorkoutList(currentWorkout, listEl);
    showToast(`Workout plan ready - ${currentWorkout.exercises.length} exercises. Press Start!`);
  });
}

function generateWorkoutPlan(level, category, durationMinutes) {
  const catMap = {
    "full-body": ex => true,
    "upper-body": ex => ["chest", "shoulders", "arms", "back"].includes(ex.muscle),
    "lower-body": ex => ex.muscle === "legs",
    "core": ex => ex.muscle === "core",
    "cardio": ex => ["cardio", "full-body"].includes(ex.muscle)
  };
  const levelRank = { beginner: 0, intermediate: 1, advanced: 2 };

  let pool = EXERCISE_LIBRARY.filter(catMap[category] || (() => true))
    .filter(ex => levelRank[ex.difficulty] <= levelRank[level]);
  if (pool.length < 4) pool = EXERCISE_LIBRARY.filter(catMap[category] || (() => true));

  // shuffle
  pool = [...pool].sort(() => Math.random() - 0.5);

  const estPerExercise = 5;
  const count = Math.min(pool.length, Math.max(4, Math.round(durationMinutes / estPerExercise)));

  const exercises = pool.slice(0, count).map(ex => ({
    name: ex.name,
    muscle: ex.muscle,
    sets: level === "advanced" ? 4 : level === "intermediate" ? 3 : 2,
    reps: level === "advanced" ? 15 : level === "intermediate" ? 12 : 10,
    duration: estPerExercise,
    video: videoLink(ex.name),
    completed: false
  }));

  return {
    id: Date.now(),
    date: new Date().toISOString(),
    category,
    level,
    exercises,
    totalDuration: durationMinutes,
    caloriesBurned: 0,
    points: 0
  };
}

function renderWorkoutList(workout, container) {
  if (!workout) {
    container.innerHTML = "<p>No workout generated yet.</p>";
    return;
  }

  container.innerHTML = workout.exercises
    .map(
      (ex, i) => `
      <div class="workout-item ${ex.completed ? "completed" : ""} ${i === currentExerciseIndex && workoutStartedAt ? "active" : ""}" data-index="${i}" id="exercise-${i}">
        <div>
          <strong>${ex.name}</strong>
          <span class="muted">${ex.sets} sets × ${ex.reps} reps · ${capitalize(ex.muscle)}</span>
        </div>
        <div class="workout-item-right">
          <a href="${ex.video}" target="_blank" rel="noopener" class="video-link" title="Watch demo">▶ Demo</a>
          <span>${ex.completed ? "✅" : ex.duration + " min"}</span>
        </div>
      </div>`
    )
    .join("");
}

// ---------- Live tracker ----------
function initLiveTracker() {
  const startBtn = document.getElementById("startWorkoutBtn");
  const pauseBtn = document.getElementById("pauseWorkoutBtn");
  const nextBtn = document.getElementById("nextExerciseBtn");
  const endBtn = document.getElementById("endWorkoutBtn");
  const timerEl = document.getElementById("exerciseTimer");
  const currentEl = document.getElementById("currentExercise");
  const listEl = document.getElementById("generatedWorkout");
  if (!startBtn || !nextBtn || !timerEl || !currentEl || !listEl) return;

  startBtn.addEventListener("click", () => {
    if (!currentWorkout) {
      showToast("Generate a workout plan first.", "error");
      return;
    }
    workoutStartedAt = new Date();
    elapsedSeconds = 0;
    isPaused = false;
    currentExerciseIndex = 0;
    updateCurrentExerciseDisplay(currentEl);
    startExerciseTimer(timerEl);
    renderWorkoutList(currentWorkout, listEl);
    scrollToActive();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    nextBtn.disabled = false;
    endBtn.disabled = false;
  });

  pauseBtn.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶ Resume" : "⏸ Pause";
  });

  nextBtn.addEventListener("click", () => {
    if (!currentWorkout || !workoutStartedAt) return;
    markCurrentExerciseCompleted();
    currentExerciseIndex++;
    if (currentExerciseIndex >= currentWorkout.exercises.length) {
      finishWorkout(currentEl, timerEl);
    } else {
      updateCurrentExerciseDisplay(currentEl);
      renderWorkoutList(currentWorkout, listEl);
      scrollToActive();
    }
  });

  endBtn.addEventListener("click", () => {
    if (!currentWorkout || !workoutStartedAt) return;
    markCurrentExerciseCompleted();
    finishWorkout(currentEl, timerEl);
  });
}

function finishWorkout(currentEl, timerEl) {
  const listEl = document.getElementById("generatedWorkout");
  stopExerciseTimer();
  timerEl.textContent = "00:00";
  currentEl.innerHTML = "🎉 <strong>Workout complete!</strong> Great job.";
  endWorkout();
  if (listEl && currentWorkout === null) listEl.innerHTML = "";
  resetTrackerButtons();
}

function resetTrackerButtons() {
  document.getElementById("startWorkoutBtn").disabled = false;
  const pauseBtn = document.getElementById("pauseWorkoutBtn");
  pauseBtn.disabled = true;
  pauseBtn.textContent = "⏸ Pause";
  document.getElementById("nextExerciseBtn").disabled = true;
  document.getElementById("endWorkoutBtn").disabled = true;
}

function scrollToActive() {
  const el = document.querySelector(".workout-item.active");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function updateCurrentExerciseDisplay(el) {
  if (!currentWorkout || currentExerciseIndex >= currentWorkout.exercises.length) {
    el.textContent = "No active exercise.";
    return;
  }
  const ex = currentWorkout.exercises[currentExerciseIndex];
  el.innerHTML = `<strong>${ex.name}</strong> - ${ex.sets} sets × ${ex.reps} reps <a href="${ex.video}" target="_blank" rel="noopener" class="video-link">▶ Demo</a>`;
}

function startExerciseTimer(displayEl) {
  stopExerciseTimer();
  exerciseTimerInterval = setInterval(() => {
    if (isPaused) return;
    elapsedSeconds++;
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
    const s = String(elapsedSeconds % 60).padStart(2, "0");
    displayEl.textContent = `${m}:${s}`;
  }, 1000);
}

function stopExerciseTimer() {
  if (exerciseTimerInterval) {
    clearInterval(exerciseTimerInterval);
    exerciseTimerInterval = null;
  }
}

function markCurrentExerciseCompleted() {
  if (!currentWorkout) return;
  const ex = currentWorkout.exercises[currentExerciseIndex];
  if (ex) ex.completed = true;
}

function endWorkout() {
  const user = getSessionUser();
  if (!user || !currentWorkout) return;

  const durationMin = Math.max(1, Math.round(elapsedSeconds / 60));
  currentWorkout.totalDuration = durationMin;
  currentWorkout.caloriesBurned = estimateWorkoutCalories(user, currentWorkout);
  currentWorkout.points = calculateWorkoutPoints(user, currentWorkout);
  const dateKey = todayKey();
  const savedWorkout = currentWorkout;

  const updated = updateCurrentUser(u => {
    const next = { ...u };
    next.workouts = [...u.workouts, savedWorkout];
    next.workoutStreak = calculateWorkoutStreak(next, dateKey);
    next.totalPoints = (u.totalPoints || 0) + savedWorkout.points;
    return next;
  });

  showToast(`💪 Workout saved! +${savedWorkout.points} points, ~${savedWorkout.caloriesBurned} kcal burned.`);
  currentWorkout = null;
  workoutStartedAt = null;

  if (updated) {
    renderFitnessStats(updated);
    renderAchievements(updated);
    renderWorkoutHistory(updated);
  }
}

function estimateWorkoutCalories(user, workout) {
  const weight = user.weight || 70;
  const met = workout.level === "advanced" ? 8 : workout.level === "intermediate" ? 6.5 : 5;
  return Math.round((met * 3.5 * weight * workout.totalDuration) / 200);
}

function calculateWorkoutPoints(user, workout) {
  const completedCount = workout.exercises.filter(e => e.completed).length;
  const base = completedCount * 10;
  const difficultyMult =
    workout.level === "advanced" ? 2 : workout.level === "intermediate" ? 1.5 : 1;

  let streakBonus = 0;
  const streak = calculateWorkoutStreak(user, todayKey());
  if (streak >= 1) streakBonus = Math.min(25, streak * 5);

  return Math.round(base * difficultyMult + streakBonus);
}

function calculateWorkoutStreak(user, fromKey) {
  const workoutDays = new Set(user.workouts.map(w => w.date.slice(0, 10)));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(fromKey);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (workoutDays.has(key)) streak++;
    else if (i === 0) continue; // today may not have a workout yet
    else break;
  }
  return streak;
}

// ---------- Stats, achievements, history ----------
function renderFitnessStats(user) {
  const pointsEl = document.getElementById("totalPointsFit");
  const weekEl = document.getElementById("workoutsThisWeek");
  const calEl = document.getElementById("caloriesBurned7");

  if (pointsEl) pointsEl.textContent = user.totalPoints || 0;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const recent = user.workouts.filter(w => new Date(w.date) >= new Date(weekAgo.toISOString().slice(0, 10)));
  if (weekEl) weekEl.textContent = recent.length;
  if (calEl) calEl.textContent = recent.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
}

function renderAchievements(user) {
  const streakEl = document.getElementById("workoutStreak");
  const badgesEl = document.getElementById("achievementBadges");
  if (!streakEl || !badgesEl) return;

  const streak = calculateWorkoutStreak(user, todayKey());
  streakEl.textContent = streak;

  const totalPoints = user.totalPoints || 0;
  const totalWorkouts = user.workouts.length;
  const badges = [];
  if (totalWorkouts >= 1) badges.push("🥇 First Workout");
  if (streak >= 3) badges.push("🔥 3-Day Streak");
  if (streak >= 7) badges.push("⚔️ 7-Day Warrior");
  if (totalWorkouts >= 10) badges.push("💪 10 Workouts");
  if (totalWorkouts >= 25) badges.push("🦾 25 Workouts");
  if (totalPoints >= 500) badges.push("⭐ 500+ Points");
  if (totalPoints >= 1000) badges.push("🏆 Champion");

  badgesEl.innerHTML =
    badges.length === 0
      ? "<p class='muted'>No achievements yet. Complete your first workout to earn a badge!</p>"
      : badges.map(b => `<span class="badge badge-lg">${b}</span>`).join(" ");
}

function renderWorkoutHistory(user) {
  const container = document.getElementById("workoutHistory");
  if (!container) return;
  const workouts = [...user.workouts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  container.innerHTML =
    workouts.length === 0
      ? "<p class='muted'>No workouts yet - generate a plan above and get moving!</p>"
      : workouts
          .map(
            w => `
        <div class="list-item">
          <div>
            <strong>${capitalize(w.category)} · ${capitalize(w.level || "")}</strong>
            <small>${new Date(w.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${w.exercises.length} exercises</small>
          </div>
          <div class="list-item-right">
            <span>${w.totalDuration} min</span>
            <span class="badge">🔥 ${w.caloriesBurned} kcal</span>
            <span class="badge">+${w.points} pts</span>
          </div>
        </div>`
          )
          .join("");
}
