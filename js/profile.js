// profile.js - FitnexaX profile management

document.addEventListener("DOMContentLoaded", () => {
  const user = getSessionUser();
  if (!user) return;

  populateProfileView(user);
  initProfileForm(user);
  initAvatarUpload();
  initDataControls();
});

function populateProfileView(user) {
  setText("profileNameBig", user.name);
  setText("profileEmail", user.email);
  setText("profileAge", user.age);
  setText("profileGender", user.gender);
  setText("profileHeight", user.height);
  setText("profileWeight", user.weight);
  setText("profilePoints", user.totalPoints || 0);
  setText(
    "profileJoined",
    user.joined ? new Date(user.joined).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "–"
  );

  const bmi = calcBMI(user.height, user.weight);
  setText("profileBMI", bmi ? bmi.toFixed(1) : "–");
  setText("profileBMIStatus", bmi ? getBMIStatus(bmi) : "–");
  setText("profileFitnessLevel", capitalize(user.profile.fitnessLevel));
  setText("profileDietPreference", capitalize(user.profile.dietPreference));
  setText("profileCalorieGoal", user.profile.calorieGoal);
  setText("profileSleepGoal", user.profile.sleepGoal);

  const avatarImg = document.getElementById("avatarPreview");
  if (avatarImg) {
    avatarImg.src = user.profile.photo || defaultAvatar(user.name);
  }

  // prefill edit form
  setValue("editName", user.name);
  setValue("editAge", user.age);
  setValue("editGender", user.gender);
  setValue("editHeight", user.height);
  setValue("editWeight", user.weight);
  setValue("editFitnessLevel", user.profile.fitnessLevel);
  setValue("editDietPreference", user.profile.dietPreference);
  setValue("editCalorieGoal", user.profile.calorieGoal);
  setValue("editSleepGoal", user.profile.sleepGoal);
}

function defaultAvatar(name) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient></defs>
    <rect width="200" height="200" rx="100" fill="url(#g)"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="90" font-family="Poppins, sans-serif" fill="#0b1020" font-weight="700">${initial}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function initProfileForm(user) {
  const form = document.getElementById("profileForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const current = getSessionUser() || user;
    const updatedData = {
      name: document.getElementById("editName").value.trim() || current.name,
      age: Number(document.getElementById("editAge").value) || current.age,
      gender: document.getElementById("editGender").value || current.gender,
      height: Number(document.getElementById("editHeight").value) || current.height,
      weight: Number(document.getElementById("editWeight").value) || current.weight,
      fitnessLevel: document.getElementById("editFitnessLevel").value || current.profile.fitnessLevel,
      dietPreference: document.getElementById("editDietPreference").value || current.profile.dietPreference,
      calorieGoal: Number(document.getElementById("editCalorieGoal").value) || current.profile.calorieGoal,
      sleepGoal: Number(document.getElementById("editSleepGoal").value) || current.profile.sleepGoal
    };

    const updated = updateCurrentUser(u => ({
      ...u,
      name: updatedData.name,
      age: updatedData.age,
      gender: updatedData.gender,
      height: updatedData.height,
      weight: updatedData.weight,
      profile: {
        ...u.profile,
        fitnessLevel: updatedData.fitnessLevel,
        dietPreference: updatedData.dietPreference,
        calorieGoal: updatedData.calorieGoal,
        sleepGoal: updatedData.sleepGoal
      }
    }));

    if (updated) populateProfileView(updated);
    showToast("✅ Profile updated - all pages will reflect your changes.");
  });
}

function initAvatarUpload() {
  const input = document.getElementById("avatarInput");
  const img = document.getElementById("avatarPreview");
  if (!input || !img) return;

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image too large - please pick one under 2 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      img.src = dataUrl;
      updateCurrentUser(u => ({ ...u, profile: { ...u.profile, photo: dataUrl } }));
      showToast("📷 Profile photo updated.");
    };
    reader.readAsDataURL(file);
  });
}

// ---------- Data export / reset ----------
function initDataControls() {
  const exportBtn = document.getElementById("exportDataBtn");
  const resetBtn = document.getElementById("resetDataBtn");

  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const user = getSessionUser();
      if (!user) return;
      const blob = new Blob([JSON.stringify(user, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `fitnexax-data-${todayKey()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast("⬇ Data exported.");
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      const sure = confirm("This permanently deletes your account and all data on this device. Continue?");
      if (!sure) return;
      const user = getSessionUser();
      if (user) {
        const users = getUsers().filter(u => u.id !== user.id);
        saveUsers(users);
      }
      clearSession();
      window.location.href = "index.html";
    });
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.value = value;
}
