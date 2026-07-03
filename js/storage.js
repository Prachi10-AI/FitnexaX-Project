// storage.js - FitnexaX data layer (localStorage)

const STORAGE_KEY_USERS = "fitnexax_users";
const STORAGE_KEY_SESSION = "fitnexax_session";

function getUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function createUserObject(data) {
  const id = Date.now().toString();
  const heightM = data.height / 100;
  const bmi = data.weight && data.height ? data.weight / (heightM * heightM) : null;

  return {
    id,
    name: data.name,
    email: data.email,
    password: data.password,
    age: data.age,
    gender: data.gender,
    weight: data.weight,
    height: data.height,
    joined: new Date().toISOString(),
    profile: {
      fitnessLevel: data.fitnessLevel,
      dietPreference: data.dietPreference,
      fitnessGoal: data.fitnessGoal || "balanced",
      calorieGoal: data.calorieGoal,
      sleepGoal: data.sleepGoal,
      waterGoal: 8,
      photo: null
    },
    bmi,
    workouts: [],
    meals: [],
    sleep: [],
    water: {}, // { "YYYY-MM-DD": glasses }
    totalPoints: 0,
    workoutStreak: 0
  };
}

function setSession(userId) {
  localStorage.setItem(STORAGE_KEY_SESSION, userId);
}

function getSessionUser() {
  const id = localStorage.getItem(STORAGE_KEY_SESSION);
  if (!id) return null;
  const users = getUsers();
  const user = users.find(u => u.id === id) || null;
  if (user) {
    // Migrate older accounts that may lack newer fields
    user.water = user.water || {};
    user.totalPoints = user.totalPoints || 0;
    user.profile.waterGoal = user.profile.waterGoal || 8;
  }
  return user;
}

function updateCurrentUser(updater) {
  const users = getUsers();
  const sessionId = localStorage.getItem(STORAGE_KEY_SESSION);
  if (!sessionId) return null;
  const idx = users.findIndex(u => u.id === sessionId);
  if (idx === -1) return null;
  users[idx] = updater(users[idx]);
  saveUsers(users);
  return users[idx];
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

// ---------- Shared helpers ----------
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function calcBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

function getBMIStatus(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function capitalize(s) {
  if (!s) return "";
  return s
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------- Toast notifications (replaces alert) ----------
function showToast(message, type = "success") {
  let holder = document.getElementById("toastHolder");
  if (!holder) {
    holder = document.createElement("div");
    holder.id = "toastHolder";
    holder.className = "toast-holder";
    document.body.appendChild(holder);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  holder.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}
