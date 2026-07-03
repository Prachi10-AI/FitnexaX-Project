// dashboard.js - FitnexaX unified dashboard

const DAILY_TIPS = [
  "Drink a glass of water right after waking up - it kick-starts your metabolism.",
  "A 10-minute walk after meals can noticeably improve digestion and blood sugar.",
  "Consistency beats intensity: a short daily workout wins over one huge weekly session.",
  "Aim for 7–9 hours of sleep - it's when your muscles actually recover and grow.",
  "Protein at every meal keeps you full longer and supports muscle repair.",
  "Screens off 30 minutes before bed can significantly improve your sleep score.",
  "Stretch for 5 minutes in the morning to reduce stiffness and boost circulation."
];

document.addEventListener("DOMContentLoaded", () => {
  const user = getSessionUser();
  if (!user) return;

  renderHeader(user);
  renderBMI(user);
  renderCalories(user);
  renderSleepSummary(user);
  renderQuickStats(user);
  renderWater(user);
  initWaterControls();
  renderDailyTip();
  initCharts(user);
});

function renderHeader(user) {
  const welcomeText = document.getElementById("welcomeText");
  const dateText = document.getElementById("dateText");
  const pointsEl = document.getElementById("totalPointsDash");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  if (welcomeText) welcomeText.textContent = `${greeting}, ${user.name.split(" ")[0]} 👋`;
  if (dateText) {
    dateText.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  }
  if (pointsEl) pointsEl.textContent = user.totalPoints || 0;
}

function renderBMI(user) {
  const bmiValueEl = document.getElementById("bmiValue");
  const bmiStatusEl = document.getElementById("bmiStatus");
  if (!bmiValueEl || !bmiStatusEl) return;

  const bmi = calcBMI(user.height, user.weight);
  bmiValueEl.textContent = bmi ? bmi.toFixed(1) : "–";
  bmiStatusEl.textContent = bmi ? getBMIStatus(bmi) : "";
}

function renderCalories(user) {
  const today = todayKey();
  const todayMeals = user.meals.filter(m => m.date.startsWith(today));
  const totalCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

  const calEl = document.getElementById("caloriesConsumed");
  const goalEl = document.getElementById("calorieGoalDash");
  const barEl = document.getElementById("calorieProgress");
  if (!calEl || !goalEl || !barEl) return;

  const goal = user.profile.calorieGoal || 0;
  calEl.textContent = totalCalories;
  goalEl.textContent = goal;
  barEl.style.width = `${goal ? Math.min(100, (totalCalories / goal) * 100) : 0}%`;
}

function renderSleepSummary(user) {
  const sleep = [...user.sleep].sort((a, b) => b.date.localeCompare(a.date));
  if (sleep.length === 0) return;

  const last = sleep[0];
  const lastEl = document.getElementById("sleepHoursLastNight");
  const badgeEl = document.getElementById("sleepScoreBadge");
  if (lastEl) lastEl.textContent = last.duration.toFixed(1);
  if (badgeEl) badgeEl.textContent = getSleepBadgeDash(last.score);
}

function getSleepBadgeDash(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

function renderQuickStats(user) {
  const totalWorkoutsEl = document.getElementById("totalWorkouts");
  const totalMealsEl = document.getElementById("totalMeals");
  const avgSleepEl = document.getElementById("avgSleepHours");

  if (totalWorkoutsEl) totalWorkoutsEl.textContent = user.workouts.length;
  if (totalMealsEl) totalMealsEl.textContent = user.meals.length;

  if (avgSleepEl && user.sleep.length > 0) {
    const last7 = [...user.sleep].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    const avg = last7.reduce((s, x) => s + (x.duration || 0), 0) / last7.length;
    avgSleepEl.textContent = avg.toFixed(1);
  }
}

// ---------- Water tracker ----------
function renderWater(user) {
  const el = document.getElementById("waterToday");
  const goalEl = document.getElementById("waterGoal");
  if (el) el.textContent = (user.water && user.water[todayKey()]) || 0;
  if (goalEl) goalEl.textContent = user.profile.waterGoal || 8;
}

function initWaterControls() {
  const plus = document.getElementById("waterPlus");
  const minus = document.getElementById("waterMinus");
  const change = delta => {
    const updated = updateCurrentUser(u => {
      const water = { ...(u.water || {}) };
      const key = todayKey();
      water[key] = Math.max(0, (water[key] || 0) + delta);
      return { ...u, water };
    });
    if (updated) renderWater(updated);
    if (delta > 0) {
      const count = updated.water[todayKey()];
      if (count === (updated.profile.waterGoal || 8)) showToast("💧 Hydration goal reached - great job!");
    }
  };
  if (plus) plus.addEventListener("click", () => change(1));
  if (minus) minus.addEventListener("click", () => change(-1));
}

function renderDailyTip() {
  const el = document.getElementById("dailyTip");
  if (!el) return;
  const dayIndex = new Date().getDate() % DAILY_TIPS.length;
  el.textContent = DAILY_TIPS[dayIndex];
}

// ---------- Charts ----------
const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { labels: { color: "#e5e7eb", font: { family: "Poppins" } } } },
  scales: {
    x: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,0.06)" } },
    y: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,0.06)" }, beginAtZero: true }
  }
};

function last7Labels() {
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" }));
  }
  return labels;
}

function sumLast7(user, listName, field) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const items = user[listName].filter(x => x.date.startsWith(key));
    days.push(items.reduce((s, x) => s + (x[field] || 0), 0));
  }
  return days;
}

function initCharts(user) {
  if (typeof Chart === "undefined") return;
  const fitnessCtx = document.getElementById("fitnessChart");
  const nutritionCtx = document.getElementById("nutritionChart");
  const sleepCtx = document.getElementById("sleepChart");
  const labels = last7Labels();

  if (fitnessCtx) {
    new Chart(fitnessCtx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Workout Minutes",
          data: sumLast7(user, "workouts", "totalDuration"),
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.15)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#22c55e"
        }]
      },
      options: CHART_OPTS
    });
  }

  if (nutritionCtx) {
    new Chart(nutritionCtx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Calories",
          data: sumLast7(user, "meals", "calories"),
          backgroundColor: "rgba(56,189,248,0.65)",
          borderRadius: 8
        }]
      },
      options: CHART_OPTS
    });
  }

  if (sleepCtx) {
    new Chart(sleepCtx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Sleep Hours",
          data: sumLast7(user, "sleep", "duration"),
          backgroundColor: "rgba(129,140,248,0.75)",
          borderRadius: 8
        }]
      },
      options: CHART_OPTS
    });
  }
}
