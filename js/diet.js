// diet.js - FitnexaX intelligent diet manager

// ---------- Ingredient database (per typical serving) ----------
const INGREDIENT_DB = {
  chapati: { calories: 120, protein: 3, carbs: 18, fats: 3 },
  roti: { calories: 120, protein: 3, carbs: 18, fats: 3 },
  paratha: { calories: 210, protein: 4, carbs: 26, fats: 10 },
  naan: { calories: 260, protein: 7, carbs: 45, fats: 5 },
  dal: { calories: 150, protein: 9, carbs: 20, fats: 4 },
  rajma: { calories: 210, protein: 13, carbs: 35, fats: 1 },
  chole: { calories: 230, protein: 12, carbs: 35, fats: 5 },
  rice: { calories: 130, protein: 3, carbs: 28, fats: 1 },
  "brown rice": { calories: 110, protein: 3, carbs: 23, fats: 1 },
  biryani: { calories: 400, protein: 15, carbs: 50, fats: 15 },
  pulao: { calories: 250, protein: 6, carbs: 42, fats: 7 },
  salad: { calories: 40, protein: 2, carbs: 8, fats: 1 },
  curd: { calories: 100, protein: 6, carbs: 8, fats: 5 },
  yogurt: { calories: 100, protein: 6, carbs: 8, fats: 5 },
  paneer: { calories: 265, protein: 18, carbs: 4, fats: 20 },
  tofu: { calories: 90, protein: 10, carbs: 2, fats: 5 },
  egg: { calories: 78, protein: 6, carbs: 1, fats: 5 },
  omelette: { calories: 160, protein: 12, carbs: 2, fats: 12 },
  chicken: { calories: 220, protein: 30, carbs: 0, fats: 10 },
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fats: 4 },
  fish: { calories: 180, protein: 25, carbs: 0, fats: 8 },
  mutton: { calories: 290, protein: 25, carbs: 0, fats: 21 },
  milk: { calories: 120, protein: 6, carbs: 12, fats: 5 },
  bread: { calories: 80, protein: 3, carbs: 15, fats: 1 },
  toast: { calories: 80, protein: 3, carbs: 15, fats: 1 },
  butter: { calories: 72, protein: 0, carbs: 0, fats: 8 },
  ghee: { calories: 112, protein: 0, carbs: 0, fats: 13 },
  cheese: { calories: 110, protein: 7, carbs: 1, fats: 9 },
  oats: { calories: 150, protein: 5, carbs: 27, fats: 3 },
  poha: { calories: 180, protein: 4, carbs: 35, fats: 3 },
  upma: { calories: 200, protein: 5, carbs: 32, fats: 6 },
  idli: { calories: 60, protein: 2, carbs: 12, fats: 0 },
  dosa: { calories: 170, protein: 4, carbs: 28, fats: 5 },
  sambar: { calories: 130, protein: 6, carbs: 18, fats: 4 },
  banana: { calories: 105, protein: 1, carbs: 27, fats: 0 },
  apple: { calories: 95, protein: 0, carbs: 25, fats: 0 },
  mango: { calories: 150, protein: 1, carbs: 38, fats: 1 },
  almonds: { calories: 80, protein: 3, carbs: 3, fats: 7 },
  peanuts: { calories: 90, protein: 4, carbs: 3, fats: 7 },
  "peanut butter": { calories: 95, protein: 4, carbs: 3, fats: 8 },
  sprouts: { calories: 60, protein: 5, carbs: 10, fats: 0 },
  smoothie: { calories: 200, protein: 5, carbs: 40, fats: 3 },
  juice: { calories: 110, protein: 1, carbs: 26, fats: 0 },
  pasta: { calories: 220, protein: 8, carbs: 43, fats: 2 },
  noodles: { calories: 250, protein: 6, carbs: 45, fats: 6 },
  pizza: { calories: 285, protein: 12, carbs: 36, fats: 10 },
  burger: { calories: 350, protein: 15, carbs: 35, fats: 17 },
  samosa: { calories: 260, protein: 4, carbs: 30, fats: 14 },
  potato: { calories: 130, protein: 3, carbs: 30, fats: 0 },
  soup: { calories: 90, protein: 4, carbs: 12, fats: 3 },
  khichdi: { calories: 210, protein: 8, carbs: 38, fats: 4 }
};

// ---------- Recipe database ----------
const RECIPE_DB = [
  // ===== BREAKFAST =====
  { id: "b1", title: "Paneer Bhurji Toast", type: "breakfast", diet: "vegetarian", goal: "high-protein", emoji: "🍞", calories: 350, protein: 25, carbs: 35, fats: 12,
    ingredients: ["100g paneer, crumbled", "2 whole-wheat toasts", "Onion, tomato, spices"],
    steps: ["Sauté onion & tomato with spices", "Add crumbled paneer, cook 3 min", "Serve hot on toasted bread"] },
  { id: "b2", title: "Masala Oats Bowl", type: "breakfast", diet: "vegetarian", goal: "balanced", emoji: "🥣", calories: 280, protein: 10, carbs: 45, fats: 6,
    ingredients: ["1/2 cup oats", "Mixed vegetables", "Curry leaves & spices"],
    steps: ["Sauté veggies with spices", "Add oats + 1.5 cups water", "Simmer 5 min, garnish with coriander"] },
  { id: "b3", title: "Greek Yogurt Parfait", type: "breakfast", diet: "vegetarian", goal: "low-carb", emoji: "🍓", calories: 220, protein: 18, carbs: 15, fats: 9,
    ingredients: ["150g Greek yogurt", "Handful of berries", "10 almonds, chopped"],
    steps: ["Layer yogurt in a glass", "Add berries and nuts", "Chill and serve"] },
  { id: "b4", title: "Tofu Scramble Wrap", type: "breakfast", diet: "vegan", goal: "high-protein", emoji: "🌯", calories: 320, protein: 22, carbs: 30, fats: 12,
    ingredients: ["150g tofu", "1 whole-wheat wrap", "Turmeric, peppers, onion"],
    steps: ["Crumble tofu, sauté with turmeric & veggies", "Warm the wrap", "Fill, roll and serve"] },
  { id: "b5", title: "Banana Peanut Oatmeal", type: "breakfast", diet: "vegan", goal: "balanced", emoji: "🍌", calories: 340, protein: 12, carbs: 55, fats: 10,
    ingredients: ["1/2 cup oats", "1 banana", "1 tbsp peanut butter"],
    steps: ["Cook oats in water or plant milk", "Stir in peanut butter", "Top with sliced banana"] },
  { id: "b6", title: "Avocado Chia Bowl", type: "breakfast", diet: "vegan", goal: "low-carb", emoji: "🥑", calories: 260, protein: 8, carbs: 14, fats: 20,
    ingredients: ["1/2 avocado", "2 tbsp chia seeds", "Coconut milk, lemon"],
    steps: ["Soak chia in coconut milk 15 min", "Top with diced avocado", "Squeeze lemon, season lightly"] },
  { id: "b7", title: "Egg White Veggie Omelette", type: "breakfast", diet: "non-veg", goal: "high-protein", emoji: "🍳", calories: 240, protein: 26, carbs: 8, fats: 11,
    ingredients: ["4 egg whites + 1 whole egg", "Spinach, onion, capsicum", "1 tsp olive oil"],
    steps: ["Whisk eggs with salt & pepper", "Sauté veggies, pour eggs over", "Fold and cook until set"] },
  { id: "b8", title: "Eggs & Multigrain Toast", type: "breakfast", diet: "non-veg", goal: "balanced", emoji: "🥚", calories: 330, protein: 20, carbs: 32, fats: 13,
    ingredients: ["2 boiled eggs", "2 multigrain toasts", "1 fruit on the side"],
    steps: ["Boil eggs 8 min", "Toast the bread", "Season eggs and serve"] },
  { id: "b9", title: "Chicken Sausage Skillet", type: "breakfast", diet: "non-veg", goal: "low-carb", emoji: "🍗", calories: 290, protein: 24, carbs: 9, fats: 18,
    ingredients: ["2 chicken sausages", "Bell peppers & zucchini", "1 tsp olive oil"],
    steps: ["Slice sausages and veggies", "Sauté together 6–8 min", "Season with herbs and serve"] },

  // ===== LUNCH =====
  { id: "l1", title: "Brown Rice Khichdi", type: "lunch", diet: "vegetarian", goal: "balanced", emoji: "🍲", calories: 420, protein: 14, carbs: 60, fats: 10,
    ingredients: ["1/2 cup brown rice + moong dal", "Vegetables of choice", "Ghee & cumin tempering"],
    steps: ["Pressure-cook rice, dal & veggies", "Temper with ghee, cumin, turmeric", "Serve hot with curd"] },
  { id: "l2", title: "Paneer Tikka Salad Bowl", type: "lunch", diet: "vegetarian", goal: "high-protein", emoji: "🥗", calories: 380, protein: 28, carbs: 18, fats: 20,
    ingredients: ["150g paneer, cubed", "Mixed salad greens", "Yogurt-spice marinade"],
    steps: ["Marinate & grill paneer cubes", "Toss greens with lemon dressing", "Top salad with hot paneer tikka"] },
  { id: "l3", title: "Palak Paneer (No Rice)", type: "lunch", diet: "vegetarian", goal: "low-carb", emoji: "🥬", calories: 320, protein: 20, carbs: 12, fats: 22,
    ingredients: ["120g paneer", "2 cups spinach purée", "Garlic, cream, spices"],
    steps: ["Blanch & blend spinach", "Simmer with garlic and spices", "Add paneer cubes, finish with cream"] },
  { id: "l4", title: "Chickpea Buddha Bowl", type: "lunch", diet: "vegan", goal: "balanced", emoji: "🧆", calories: 450, protein: 18, carbs: 62, fats: 14,
    ingredients: ["1 cup boiled chickpeas", "Quinoa or brown rice", "Roasted veggies + tahini"],
    steps: ["Roast veggies at 200°C for 20 min", "Assemble grains, chickpeas, veggies", "Drizzle tahini-lemon dressing"] },
  { id: "l5", title: "Tofu Stir-Fry with Quinoa", type: "lunch", diet: "vegan", goal: "high-protein", emoji: "🍛", calories: 410, protein: 26, carbs: 40, fats: 15,
    ingredients: ["200g tofu", "1/2 cup quinoa", "Broccoli, soy-ginger sauce"],
    steps: ["Cook quinoa", "Stir-fry tofu until golden", "Add veggies & sauce, serve over quinoa"] },
  { id: "l6", title: "Zucchini Noodle Peanut Bowl", type: "lunch", diet: "vegan", goal: "low-carb", emoji: "🥒", calories: 300, protein: 14, carbs: 16, fats: 21,
    ingredients: ["2 zucchinis, spiralized", "100g tofu", "Peanut-lime sauce"],
    steps: ["Spiralize zucchini", "Pan-sear tofu cubes", "Toss with peanut sauce, top with peanuts"] },
  { id: "l7", title: "Grilled Chicken & Rice Bowl", type: "lunch", diet: "non-veg", goal: "balanced", emoji: "🍗", calories: 480, protein: 35, carbs: 50, fats: 12,
    ingredients: ["150g chicken breast", "3/4 cup rice", "Steamed vegetables"],
    steps: ["Marinate & grill chicken", "Cook rice, steam veggies", "Assemble bowl and season"] },
  { id: "l8", title: "Chicken Tikka Protein Plate", type: "lunch", diet: "non-veg", goal: "high-protein", emoji: "🔥", calories: 420, protein: 42, carbs: 15, fats: 20,
    ingredients: ["200g chicken tikka", "Mint chutney", "Onion-cucumber salad"],
    steps: ["Marinate chicken in yogurt & spices", "Grill or air-fry 15 min", "Serve with salad and chutney"] },
  { id: "l9", title: "Lemon Butter Fish & Greens", type: "lunch", diet: "non-veg", goal: "low-carb", emoji: "🐟", calories: 350, protein: 32, carbs: 8, fats: 21,
    ingredients: ["180g white fish fillet", "Sautéed greens", "Lemon-butter sauce"],
    steps: ["Pan-sear fish 3–4 min per side", "Sauté spinach & beans in garlic", "Finish with lemon butter"] },

  // ===== DINNER =====
  { id: "d1", title: "Dal Tadka with Jeera Rice", type: "dinner", diet: "vegetarian", goal: "balanced", emoji: "🍛", calories: 430, protein: 16, carbs: 65, fats: 11,
    ingredients: ["1 cup dal", "3/4 cup jeera rice", "Ghee tempering"],
    steps: ["Cook dal with turmeric", "Temper with ghee, cumin, garlic", "Serve with jeera rice"] },
  { id: "d2", title: "Grilled Paneer Steak & Veggies", type: "dinner", diet: "vegetarian", goal: "high-protein", emoji: "🧀", calories: 390, protein: 27, carbs: 14, fats: 25,
    ingredients: ["180g paneer slab", "Grilled peppers & broccoli", "Herb marinade"],
    steps: ["Marinate paneer in herbs 20 min", "Grill 3 min per side", "Serve with charred veggies"] },
  { id: "d3", title: "Veg Cauliflower Fried 'Rice'", type: "dinner", diet: "vegetarian", goal: "low-carb", emoji: "🥦", calories: 260, protein: 12, carbs: 18, fats: 15,
    ingredients: ["2 cups grated cauliflower", "1 egg-free scramble or paneer", "Soy sauce, spring onion"],
    steps: ["Grate cauliflower into rice", "Stir-fry with veggies on high heat", "Season and garnish"] },
  { id: "d4", title: "Lentil & Veggie Curry", type: "dinner", diet: "vegan", goal: "balanced", emoji: "🍜", calories: 400, protein: 17, carbs: 58, fats: 11,
    ingredients: ["1 cup lentils", "Coconut milk & tomato base", "Rice or millet"],
    steps: ["Simmer lentils with spices", "Add coconut milk, cook 10 min", "Serve over grains"] },
  { id: "d5", title: "Spiced Tempeh & Greens", type: "dinner", diet: "vegan", goal: "high-protein", emoji: "🌱", calories: 380, protein: 28, carbs: 22, fats: 20,
    ingredients: ["200g tempeh or extra-firm tofu", "Kale/spinach", "Garlic-chilli glaze"],
    steps: ["Sear tempeh slices", "Wilt greens with garlic", "Glaze and serve together"] },
  { id: "d6", title: "Mushroom & Spinach Sauté", type: "dinner", diet: "vegan", goal: "low-carb", emoji: "🍄", calories: 240, protein: 11, carbs: 14, fats: 16,
    ingredients: ["250g mushrooms", "2 cups spinach", "Olive oil, garlic, walnuts"],
    steps: ["Sauté mushrooms until golden", "Add spinach & garlic", "Top with crushed walnuts"] },
  { id: "d7", title: "Chicken Curry with Roti", type: "dinner", diet: "non-veg", goal: "balanced", emoji: "🍛", calories: 470, protein: 33, carbs: 42, fats: 18,
    ingredients: ["150g chicken", "2 rotis", "Onion-tomato gravy"],
    steps: ["Brown onions, add tomato & spices", "Add chicken, simmer 20 min", "Serve with fresh rotis"] },
  { id: "d8", title: "Baked Fish with Quinoa", type: "dinner", diet: "non-veg", goal: "high-protein", emoji: "🐠", calories: 430, protein: 38, carbs: 30, fats: 16,
    ingredients: ["200g fish fillet", "1/2 cup quinoa", "Lemon, herbs, olive oil"],
    steps: ["Bake fish at 190°C for 15 min", "Cook quinoa with stock", "Plate with lemon wedges"] },
  { id: "d9", title: "Egg Curry (No Rice)", type: "dinner", diet: "non-veg", goal: "low-carb", emoji: "🥚", calories: 310, protein: 20, carbs: 10, fats: 22,
    ingredients: ["3 boiled eggs", "Spiced tomato-coconut gravy", "Coriander garnish"],
    steps: ["Boil and halve eggs", "Simmer gravy 10 min", "Add eggs, garnish and serve"] },

  // ===== SNACKS =====
  { id: "s1", title: "Fruit & Nut Yogurt Cup", type: "snack", diet: "vegetarian", goal: "balanced", emoji: "🍨", calories: 180, protein: 8, carbs: 22, fats: 7,
    ingredients: ["Curd/yogurt", "Seasonal fruit", "Mixed nuts"],
    steps: ["Chop fruit", "Mix into yogurt", "Top with nuts"] },
  { id: "s2", title: "Roasted Chana Protein Mix", type: "snack", diet: "vegetarian", goal: "high-protein", emoji: "🥜", calories: 160, protein: 10, carbs: 18, fats: 5,
    ingredients: ["Roasted chickpeas", "Peanuts", "Chaat masala"],
    steps: ["Mix chana and peanuts", "Sprinkle chaat masala", "Store airtight"] },
  { id: "s3", title: "Cucumber Peanut Chaat", type: "snack", diet: "vegan", goal: "low-carb", emoji: "🥗", calories: 120, protein: 5, carbs: 10, fats: 7,
    ingredients: ["1 cucumber, diced", "2 tbsp peanuts", "Lemon + chilli"],
    steps: ["Dice cucumber", "Toss with peanuts & seasoning", "Serve chilled"] },
  { id: "s4", title: "Banana Almond Smoothie", type: "snack", diet: "vegan", goal: "balanced", emoji: "🥤", calories: 210, protein: 6, carbs: 35, fats: 6,
    ingredients: ["1 banana", "Almond milk", "5 almonds + cinnamon"],
    steps: ["Blend everything with ice", "Pour and dust cinnamon", "Drink fresh"] },
  { id: "s5", title: "Boiled Egg & Pepper Bites", type: "snack", diet: "non-veg", goal: "high-protein", emoji: "🍳", calories: 170, protein: 13, carbs: 3, fats: 12,
    ingredients: ["2 boiled eggs", "Black pepper & rock salt", "Cherry tomatoes"],
    steps: ["Slice boiled eggs", "Season generously", "Serve with tomatoes"] },
  { id: "s6", title: "Chicken Lettuce Cups", type: "snack", diet: "non-veg", goal: "low-carb", emoji: "🥬", calories: 190, protein: 18, carbs: 6, fats: 11,
    ingredients: ["100g minced chicken", "Lettuce leaves", "Soy-ginger seasoning"],
    steps: ["Cook mince with seasoning", "Spoon into lettuce cups", "Top with spring onion"] }
];

document.addEventListener("DOMContentLoaded", () => {
  const user = getSessionUser();
  if (!user) return;

  const prefLabel = document.getElementById("dietPrefLabel");
  if (prefLabel) prefLabel.textContent = capitalize(user.profile.dietPreference || "any");

  initRecipeGenerator(user);
  initMealAnalyzer();
  initQuickMealLogger(user);
  renderTodayNutrition(user);
  renderTodayMeals(user);
});

// ---------- Recipe generator ----------
function initRecipeGenerator(user) {
  const form = document.getElementById("recipeForm");
  const results = document.getElementById("recipeResults");
  if (!form || !results) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const type = document.getElementById("mealType").value;
    const goal = document.getElementById("goalType").value;
    const diet = (getSessionUser() || user).profile.dietPreference;

    // Vegetarians can eat vegan food too
    const dietOk = r =>
      diet === "non-veg" ? true :
      diet === "vegetarian" ? (r.diet === "vegetarian" || r.diet === "vegan") :
      r.diet === diet;

    let recipes = RECIPE_DB.filter(r => r.type === type && r.goal === goal && dietOk(r));
    if (recipes.length === 0) {
      recipes = RECIPE_DB.filter(r => r.type === type && dietOk(r));
    }

    results.innerHTML =
      recipes.length === 0
        ? "<p class='muted'>No recipes found for this combination yet.</p>"
        : recipes
            .map(
              r => `
          <article class="recipe-card">
            <div class="recipe-head"><span class="recipe-emoji">${r.emoji}</span><h4>${r.title}</h4></div>
            <p class="recipe-tags"><span class="badge">${capitalize(r.diet)}</span> <span class="badge">${capitalize(r.goal)}</span></p>
            <p class="recipe-macros">${r.calories} kcal · ${r.protein}g P · ${r.carbs}g C · ${r.fats}g F</p>
            <details>
              <summary>Ingredients & steps</summary>
              <ul>${r.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
              <ol>${r.steps.map(s => `<li>${s}</li>`).join("")}</ol>
            </details>
            <button class="btn-ghost" data-recipe-id="${r.id}">+ Log this meal</button>
          </article>`
            )
            .join("");

    results.querySelectorAll("button[data-recipe-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const recipe = RECIPE_DB.find(r => r.id === btn.dataset.recipeId);
        if (recipe) logRecipeMeal(recipe);
      });
    });
  });
}

function logRecipeMeal(recipe) {
  const updated = updateCurrentUser(u => {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      name: recipe.title,
      type: "recipe",
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fats: recipe.fats
    };
    return { ...u, meals: [...u.meals, entry] };
  });
  showToast(`🍽️ "${recipe.title}" logged to today's meals.`);
  if (updated) {
    renderTodayNutrition(updated);
    renderTodayMeals(updated);
  }
}

// ---------- Meal analyzer ----------
function initMealAnalyzer() {
  const btn = document.getElementById("analyzeMealBtn");
  const textarea = document.getElementById("mealDescription");
  const resultEl = document.getElementById("mealAnalysisResult");
  if (!btn || !textarea || !resultEl) return;

  btn.addEventListener("click", () => {
    const text = textarea.value.trim();
    if (!text) {
      showToast("Describe your meal first.", "error");
      return;
    }

    const analysis = analyzeMealText(text);
    const confidence = analysis.totalItems
      ? Math.round((analysis.knownCount / analysis.totalItems) * 100)
      : 0;

    resultEl.innerHTML = `
      <p>Estimated: <strong>${analysis.calories} kcal</strong></p>
      <p>🥩 ${analysis.protein}g protein · 🍞 ${analysis.carbs}g carbs · 🥑 ${analysis.fats}g fats</p>
      <p class="muted">Recognized ${analysis.knownCount}/${analysis.totalItems} items (${confidence}% confidence)</p>
      <button id="logAnalyzedMeal" class="btn-primary">+ Log this meal</button>
    `;

    document.getElementById("logAnalyzedMeal").addEventListener("click", () => {
      const updated = updateCurrentUser(u => {
        const entry = {
          id: Date.now(),
          date: new Date().toISOString(),
          name: text.length > 40 ? text.slice(0, 40) + "…" : text,
          type: "analyzed",
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fats: analysis.fats
        };
        return { ...u, meals: [...u.meals, entry] };
      });
      showToast("🔍 Analyzed meal logged.");
      textarea.value = "";
      resultEl.innerHTML = "";
      if (updated) {
        renderTodayNutrition(updated);
        renderTodayMeals(updated);
      }
    });
  });
}

function analyzeMealText(text) {
  const parts = text.split(/[,+\n]| and /i).map(p => p.trim().toLowerCase()).filter(Boolean);
  const total = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  let knownCount = 0;

  // longest keys first so "brown rice" matches before "rice"
  const keys = Object.keys(INGREDIENT_DB).sort((a, b) => b.length - a.length);

  for (const part of parts) {
    // leading quantity e.g. "2 chapati"
    const qtyMatch = part.match(/^(\d+(?:\.\d+)?)\s*x?\s*/);
    const qty = qtyMatch ? Math.min(10, parseFloat(qtyMatch[1])) : 1;

    const matchKey = keys.find(k => part.includes(k));
    if (matchKey) {
      const info = INGREDIENT_DB[matchKey];
      total.calories += info.calories * qty;
      total.protein += info.protein * qty;
      total.carbs += info.carbs * qty;
      total.fats += info.fats * qty;
      knownCount++;
    } else {
      // fallback: assume ~75 kcal for an unknown item
      total.calories += 75 * qty;
      total.protein += 2 * qty;
      total.carbs += 10 * qty;
      total.fats += 3 * qty;
    }
  }

  return {
    calories: Math.round(total.calories),
    protein: Math.round(total.protein),
    carbs: Math.round(total.carbs),
    fats: Math.round(total.fats),
    knownCount,
    totalItems: parts.length
  };
}

// ---------- Quick logger ----------
function initQuickMealLogger(user) {
  const form = document.getElementById("quickMealForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      name: document.getElementById("mealName").value.trim(),
      type: "quick",
      calories: Number(document.getElementById("mealCalories").value),
      protein: Number(document.getElementById("mealProtein").value),
      carbs: Number(document.getElementById("mealCarbs").value),
      fats: Number(document.getElementById("mealFats").value)
    };

    const updated = updateCurrentUser(u => ({ ...u, meals: [...u.meals, entry] }));
    form.reset();
    showToast(`✅ "${entry.name}" added.`);
    if (updated) {
      renderTodayNutrition(updated);
      renderTodayMeals(updated);
    }
  });
}

function deleteMeal(mealId) {
  const updated = updateCurrentUser(u => ({
    ...u,
    meals: u.meals.filter(m => m.id !== mealId)
  }));
  showToast("Meal removed.");
  if (updated) {
    renderTodayNutrition(updated);
    renderTodayMeals(updated);
  }
}

function renderTodayMeals(user) {
  const container = document.getElementById("todayMeals");
  if (!container) return;
  const today = todayKey();
  const meals = user.meals.filter(m => m.date.startsWith(today));

  container.innerHTML =
    meals.length === 0
      ? "<p class='muted'>No meals logged today.</p>"
      : meals
          .map(
            m => `
        <div class="list-item">
          <div>
            <strong>${m.name}</strong>
            <small>${new Date(m.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${m.type}</small>
          </div>
          <div class="list-item-right">
            <span>${m.calories} kcal</span>
            <button class="btn-icon" data-del="${m.id}" title="Remove">🗑</button>
          </div>
        </div>`
          )
          .join("");

  container.querySelectorAll("button[data-del]").forEach(btn =>
    btn.addEventListener("click", () => deleteMeal(Number(btn.dataset.del)))
  );
}

function renderTodayNutrition(user) {
  const today = todayKey();
  const meals = user.meals.filter(m => m.date.startsWith(today));

  const sums = meals.reduce(
    (acc, m) => {
      acc.calories += m.calories || 0;
      acc.protein += m.protein || 0;
      acc.carbs += m.carbs || 0;
      acc.fats += m.fats || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  };
  set("dietCaloriesToday", sums.calories);
  set("dietCalorieGoal", user.profile.calorieGoal || 0);
  set("proteinToday", sums.protein);
  set("carbsToday", sums.carbs);
  set("fatsToday", sums.fats);

  const barEl = document.getElementById("dietCalorieProgress");
  if (barEl) {
    const pct = user.profile.calorieGoal
      ? Math.min(100, (sums.calories / user.profile.calorieGoal) * 100)
      : 0;
    barEl.style.width = `${pct}%`;
    barEl.classList.toggle("over", sums.calories > (user.profile.calorieGoal || Infinity));
  }
}
