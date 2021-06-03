const mealsEl = document.querySelector("#meals");
const favContainer = document.querySelector("#fav-meals");
console.log(favContainer);
const searchTerm = document.querySelector("#search-term");
const searchBtn = document.querySelector("#search");
const mealPopup = document.querySelector("#meal-popup");
const popupCloseBtn = document.querySelector("#close-popup");
const mealInfoEl = document.querySelector("#meal-info");

getRandomMeal();
fetchFavMeal();

async function getRandomMeal() {
	const resp = await fetch(
		"https://www.themealdb.com/api/json/v1/1/random.php"
	);

	const data = await resp.json();
	const randomMeal = data.meals[0];
	console.log(randomMeal);

	addMeal(randomMeal, true);
}
async function getMealById(id) {
	const resp = await fetch(
		"https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
	);

	const respData = await resp.json();
	const meal = respData.meals[0];
	return meal;
}

async function getMealsBySearch(term) {
	const resp = await fetch(
		"https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
	);

	const respData = await resp.json();
	const meals = respData.meals;
	return meals;
}

function addMeal(mealData, random = false) {
	const meal = document.createElement("div");
	meal.classList.add("meal");
	meal.innerHTML = `
                <div class="meal">
					<div class="meal-header">
						${random ? `<span class="random">Random Recipe</span>` : ""}
						<img
							src="${mealData.strMealThumb}"
							alt="${mealData.strMeal}"
						/>
					</div>
					<div class="meal-body">
						<h4>${mealData.strMeal}</h4>
						<button class="fav-btn">
							<i class="far fa-heart"></i>
						</button>
					</div>
				</div>`;

	const btn = meal.querySelector(".meal-body .fav-btn");
	btn.addEventListener("click", (e) => {
		if (btn.classList.contains("active")) {
			removeMealLS(mealData.idMeal);
			btn.classList.remove("active");
		} else {
			addMealToLS(mealData.idMeal);
			btn.classList.add("active");
		}

		// clean the container
		favContainer.innerHTML = "";
		fetchFavMeal();
	});

	meal.addEventListener("click", () => {
		showMealInfo(mealData);
	});
	mealsEl.appendChild(meal);
}

// add meal to local storage
function addMealToLS(mealId) {
	const mealIds = getMealLs();

	localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

// remove meal from local storage

function removeMealLS(mealId) {
	let mealIds = getMealLs();

	localStorage.setItem(
		"mealIds",
		JSON.stringify(mealIds.filter((id) => id !== mealId))
	);
}

// get meal from local storage
function getMealLs() {
	let mealIds = localStorage.getItem("mealIds")
		? JSON.parse(localStorage.getItem("mealIds"))
		: [];

	return mealIds;
}

// get Meal ids from local storage and fecth them with getMealById func
async function fetchFavMeal() {
	favContainer.innerHTML = "";

	const mealIds = getMealLs();

	for (let i = 0; i < mealIds.length; i++) {
		const mealId = mealIds[i];

		const meal = await getMealById(mealId);
		addMealFav(meal);
	}
}

// add favorit meals to screen
function addMealFav(mealData) {
	const favMeal = document.createElement("li");
	favMeal.innerHTML = `
						<img
							src="${mealData.strMealThumb}"
							alt="${mealData.strMeal}"
						/><span>${mealData.strMeal}</span>
                    <button class="clear"><i class="fas fa-window-close"></i></button>
                    `;

	const btn = favMeal.querySelector(".clear");

	btn.addEventListener("click", () => {
		removeMealLS(mealData.idMeal);
		fetchFavMeal();
	});

	favMeal.addEventListener("click", (e) => {
		showMealInfo(mealData);
	});

	favContainer.appendChild(favMeal);
}

searchTerm.addEventListener("keyup", (e) => {
	if (e.keyCode === 13) {
		e.preventDefault();
		document.getElementById("search").click();
	}
});

searchBtn.addEventListener("click", async () => {
	// clean container
	mealsEl.innerHTML = "";
	const search = searchTerm.value;
	const meals = await getMealsBySearch(search);
	if (meals) {
		meals.forEach((meal) => {
			addMeal(meal);
		});
	}

	searchTerm.value = "";
});

popupCloseBtn.addEventListener("click", () => {
	mealPopup.classList.add("hidden");
});

function showMealInfo(mealData) {
	mealInfoEl.innerHTML = "";
	// update thye meal info

	// get ingredients and measures

	const ingredients = [];
	for (let i = 1; i <= 20; i++) {
		if (mealData["strIngredient" + i]) {
			ingredients.push(
				`${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
			);
		} else {
			break;
		}
	}

	const mealEl = document.createElement("div");

	mealEl.innerHTML = `
    
						<h1>${mealData.strMeal}</h1>
					<img
						src="${mealData.strMealThumb}"
						alt="${mealData.strMeal}"
					/>
					<p>
						${mealData.strInstructions}
					</p>
					<h3>Ingredients</h3>
					
					<ul>
					${ingredients
						.map(
							(ing) => `
					
					<li>${ing}</li>`
						)
						.join("")}
					
					</ul>
					
					
    `;

	mealInfoEl.appendChild(mealEl);

	// show the popup
	mealPopup.classList.remove("hidden");
}
