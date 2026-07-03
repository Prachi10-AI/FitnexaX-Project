// auth.js - FitnexaX authentication + route protection + shared shell

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.toLowerCase();

  if (path.endsWith("signup.html")) {
    redirectIfLoggedIn();
    initSignup();
  } else if (path.endsWith("login.html")) {
    redirectIfLoggedIn();
    initLogin();
  } else if (path.endsWith("index.html") || path.endsWith("/") || path === "") {
    initLanding();
  } else {
    protectRoute();
    attachLogout();
    highlightActiveNav();
    initSidebarToggle();
  }
});

function initLanding() {
  // If already logged in, offer to jump straight to the dashboard
  const user = typeof getSessionUser === "function" ? getSessionUser() : null;
  const cta = document.getElementById("heroCta");
  const navAuth = document.getElementById("navAuth");
  if (user && cta) {
    cta.textContent = `Continue as ${user.name.split(" ")[0]} →`;
    cta.href = "dashboard.html";
  }
  if (user && navAuth) {
    navAuth.innerHTML = `<a href="dashboard.html" class="btn-primary">Open Dashboard</a>`;
  }
}

function redirectIfLoggedIn() {
  if (getSessionUser()) window.location.href = "dashboard.html";
}

function protectRoute() {
  if (!getSessionUser()) window.location.href = "login.html";
}

function attachLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    clearSession();
    window.location.href = "login.html";
  });
}

function highlightActiveNav() {
  const page = window.location.pathname.split("/").pop().toLowerCase();
  document.querySelectorAll(".sidebar-nav a").forEach(a => {
    if (a.getAttribute("href").toLowerCase() === page) a.classList.add("active");
  });
}

function initSidebarToggle() {
  const toggle = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".sidebar");
  if (!toggle || !sidebar) return;
  toggle.addEventListener("click", () => sidebar.classList.toggle("open"));
  document.querySelectorAll(".sidebar-nav a").forEach(a =>
    a.addEventListener("click", () => sidebar.classList.remove("open"))
  );
}

// ---------- Signup ----------
function initSignup() {
  const form = document.getElementById("signupForm");
  const errorEl = document.getElementById("signupError");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    errorEl.textContent = "";

    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim().toLowerCase(),
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
      age: Number(document.getElementById("age").value),
      gender: document.getElementById("gender").value,
      height: Number(document.getElementById("height").value),
      weight: Number(document.getElementById("weight").value),
      fitnessLevel: document.getElementById("fitnessLevel").value,
      dietPreference: document.getElementById("dietPreference").value,
      calorieGoal: Number(document.getElementById("calorieGoal").value),
      sleepGoal: Number(document.getElementById("sleepGoal").value)
    };

    if (data.password.length < 6) {
      errorEl.textContent = "Password must be at least 6 characters.";
      return;
    }
    if (data.password !== data.confirmPassword) {
      errorEl.textContent = "Passwords do not match.";
      return;
    }
    if (data.height < 80 || data.height > 250) {
      errorEl.textContent = "Please enter a valid height in cm (80–250).";
      return;
    }
    if (data.weight < 20 || data.weight > 300) {
      errorEl.textContent = "Please enter a valid weight in kg (20–300).";
      return;
    }

    const users = getUsers();
    if (users.some(u => u.email === data.email)) {
      errorEl.textContent = "Email already registered. Try logging in.";
      return;
    }

    const newUser = createUserObject(data);
    users.push(newUser);
    saveUsers(users);
    setSession(newUser.id);
    window.location.href = "dashboard.html";
  });
}

// ---------- Login ----------
function initLogin() {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    errorEl.textContent = "";

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const user = getUsers().find(u => u.email === email && u.password === password);

    if (!user) {
      errorEl.textContent = "Invalid email or password.";
      return;
    }

    setSession(user.id);
    window.location.href = "dashboard.html";
  });
}
