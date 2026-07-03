// sleep.js - FitnexaX sleep cycle monitor

const SLEEP_TEMP_KEY = "fitnexax_sleep_temp";

const SLEEP_TIPS = [
  "Keep a consistent sleep schedule - even on weekends.",
  "Avoid caffeine after 3 PM; it can linger in your system for 6+ hours.",
  "Keep your bedroom cool (18–20°C) and dark for deeper sleep.",
  "Put screens away 30–60 minutes before bed - blue light delays melatonin.",
  "A short walk or light stretching in the evening improves sleep quality.",
  "Avoid heavy meals within 2 hours of bedtime.",
  "If you nap, keep it under 30 minutes and before 4 PM."
];

document.addEventListener("DOMContentLoaded", () => {
  const user = getSessionUser();
  if (!user) return;

  initLiveClock();
  initQuickSleep();
  initSleepForm();
  renderSleepOverview(user);
  renderSleepHistory(user);
  initSleepChart(user);
  renderTips();
  updateQuickStatus();

  // default the manual-entry date to today
  const dateInput = document.getElementById("sleepDate");
  if (dateInput) dateInput.value = todayKey();
});

function initLiveClock() {
  const el = document.getElementById("liveClock");
  if (!el) return;
  const tick = () =>
    (el.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  tick();
  setInterval(tick, 15000);
}

function renderTips() {
  const ul = document.getElementById("sleepTips");
  if (!ul) return;
  ul.innerHTML = SLEEP_TIPS.map(t => `<li>${t}</li>`).join("");
}

// ---------- Quick tracker ----------
function initQuickSleep() {
  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  };
  bind("startNightSleep", () => startQuick("night_start", "🌙 Sleep tracking started. Sweet dreams!"));
  bind("endNightSleep", () => finalizeQuickSleep("sleep"));
  bind("startNap", () => startQuick("nap_start", "⚡ Nap tracking started."));
  bind("endNap", () => finalizeQuickSleep("nap"));
}

function startQuick(key, msg) {
  saveTemp(key, new Date().toISOString());
  showToast(msg);
  updateQuickStatus();
}

function updateQuickStatus() {
  const el = document.getElementById("quickStatus");
  if (!el) return;
  const night = getTemp("night_start");
  const nap = getTemp("nap_start");
  if (night) {
    el.textContent = `🌙 Sleeping since ${new Date(night).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - tap "Wake Up" when you rise.`;
  } else if (nap) {
    el.textContent = `⚡ Napping since ${new Date(nap).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - tap "End Nap" when done.`;
  } else {
    el.textContent = "Not tracking. Tap a button when you go to bed or nap.";
  }
}

function saveTemp(key, value) {
  const data = JSON.parse(localStorage.getItem(SLEEP_TEMP_KEY) || "{}");
  data[key] = value;
  localStorage.setItem(SLEEP_TEMP_KEY, JSON.stringify(data));
}

function getTemp(key) {
  const data = JSON.parse(localStorage.getItem(SLEEP_TEMP_KEY) || "{}");
  return data[key];
}

function finalizeQuickSleep(type) {
  const key = type === "sleep" ? "night_start" : "nap_start";
  const startISO = getTemp(key);
  if (!startISO) {
    showToast(`No ${type === "sleep" ? "sleep" : "nap"} start recorded yet.`, "error");
    return;
  }
  const start = new Date(startISO);
  const end = new Date();
  const duration = (end - start) / 1000 / 3600;
  if (duration < 0.02) {
    showToast("That was too short to record!", "error");
    return;
  }
  const quality = "good";
  const score = computeSleepScore(duration, quality);

  const entry = {
    id: Date.now(),
    date: start.toISOString().slice(0, 10),
    type,
    bedtime: start.toTimeString().slice(0, 5),
    wakeupTime: end.toTimeString().slice(0, 5),
    duration: Number(duration.toFixed(2)),
    quality,
    score
  };

  const updated = updateCurrentUser(u => ({ ...u, sleep: [...u.sleep, entry] }));
  localStorage.removeItem(SLEEP_TEMP_KEY);
  showToast(`💤 ${type === "sleep" ? "Sleep" : "Nap"} saved: ${entry.duration.toFixed(1)} hrs.`);
  updateQuickStatus();
  refresh(updated);
}

// ---------- Manual entry ----------
function initSleepForm() {
  const form = document.getElementById("sleepForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const date = document.getElementById("sleepDate").value;
    const bt = document.getElementById("bedtime").value;
    const wt = document.getElementById("wakeupTime").value;
    const quality = document.getElementById("sleepQuality").value;

    const start = new Date(`${date}T${bt}`);
    let end = new Date(`${date}T${wt}`);
    if (end <= start) end.setDate(end.getDate() + 1); // crossed midnight

    const duration = (end - start) / 1000 / 3600;
    const score = computeSleepScore(duration, quality);

    const entry = {
      id: Date.now(),
      date,
      type: "sleep",
      bedtime: bt,
      wakeupTime: wt,
      duration: Number(duration.toFixed(2)),
      quality,
      score
    };

    const updated = updateCurrentUser(u => ({ ...u, sleep: [...u.sleep, entry] }));
    form.reset();
    document.getElementById("sleepDate").value = todayKey();
    showToast(`💾 Sleep entry saved - score ${score}/100.`);
    refresh(updated);
  });
}

function refresh(user) {
  if (!user) user = getSessionUser();
  if (!user) return;
  renderSleepOverview(user);
  renderSleepHistory(user);
  initSleepChart(user);
}

// ---------- Scoring ----------
function computeSleepScore(duration, quality) {
  let durationPoints = 0;
  if (duration >= 7 && duration <= 9) durationPoints = 40;
  else if (duration >= 6) durationPoints = 30;
  else if (duration >= 5) durationPoints = 20;
  else if (duration >= 4) durationPoints = 10;

  let qualityPoints = 15;
  if (quality === "excellent") qualityPoints = 60;
  else if (quality === "good") qualityPoints = 45;
  else if (quality === "fair") qualityPoints = 30;

  return durationPoints + qualityPoints;
}

function getSleepBadge(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

// ---------- Rendering ----------
function renderSleepOverview(user) {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };

  set("sleepGoalEl", user.profile.sleepGoal || "–");

  const entries = [...user.sleep].sort((a, b) => b.date.localeCompare(a.date));
  if (entries.length === 0) return;

  const nights = entries.filter(e => e.type === "sleep");
  const last = nights[0] || entries[0];

  set("lastNightDuration", last.duration.toFixed(1));
  set("lastNightQuality", capitalize(last.quality));

  const last7 = entries.slice(0, 7);
  const avg = last7.reduce((s, e) => s + (e.duration || 0), 0) / last7.length;
  set("avgSleep7", avg.toFixed(1));

  const goal = user.profile.sleepGoal;
  const goalEl = document.getElementById("goalStatus");
  if (goalEl && goal) {
    const met = last.duration >= goal;
    goalEl.textContent = met ? "✅ Met last night" : `${(goal - last.duration).toFixed(1)} hrs short`;
  }

  const recentScore = last.score || computeSleepScore(last.duration, last.quality);
  set("sleepScore", recentScore);
  set("sleepScoreBadge", getSleepBadge(recentScore));
}

function renderSleepHistory(user) {
  const container = document.getElementById("sleepHistory");
  if (!container) return;
  const entries = [...user.sleep].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);

  container.innerHTML =
    entries.length === 0
      ? "<p class='muted'>No sleep entries yet - log your first night above.</p>"
      : entries
          .map(
            e => `
        <div class="list-item">
          <div>
            <strong>${new Date(e.date + "T12:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${e.type === "nap" ? "⚡ Nap" : "🌙"}</strong>
            <small>${e.bedtime} – ${e.wakeupTime}</small>
          </div>
          <div class="list-item-right">
            <span>${e.duration.toFixed(1)} hrs</span>
            <span class="badge">${getSleepBadge(e.score)} · ${e.score}</span>
            <button class="btn-icon" data-del="${e.id}" title="Remove">🗑</button>
          </div>
        </div>`
          )
          .join("");

  container.querySelectorAll("button[data-del]").forEach(btn =>
    btn.addEventListener("click", () => {
      const updated = updateCurrentUser(u => ({
        ...u,
        sleep: u.sleep.filter(s => s.id !== Number(btn.dataset.del))
      }));
      showToast("Sleep entry removed.");
      refresh(updated);
    })
  );
}

let sleepChartInstance = null;

function initSleepChart(user) {
  const ctx = document.getElementById("sleepBarChart");
  if (!ctx || typeof Chart === "undefined") return;

  const labels = [];
  const values = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    labels.push(i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" }));
    const entries = user.sleep.filter(e => e.date.startsWith(key));
    values.push(entries.reduce((s, e) => s + (e.duration || 0), 0));
  }

  if (sleepChartInstance) sleepChartInstance.destroy();

  const goal = user.profile.sleepGoal || 8;
  sleepChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Hours slept",
          data: values,
          backgroundColor: values.map(v => (v >= goal ? "rgba(34,197,94,0.75)" : "rgba(129,140,248,0.75)")),
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#e5e7eb", font: { family: "Poppins" } } } },
      scales: {
        x: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,0.06)" } },
        y: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(255,255,255,0.06)" }, beginAtZero: true }
      }
    }
  });
}
