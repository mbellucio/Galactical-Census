"use strict";

// API ENDPOINTS
const PLANETS = "https://swapi.dev/api/planets/";

// SELECTORS
const planetsDiv = document.querySelector(".planets");
const planetDetailsDiv = document.querySelector(".planets-details");
const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-input");
let allPlanetButtons = [];
let backBtn;

// event listeners
searchBtn.addEventListener("click", handleSearchPlanet);

// HTML
const planetButton = (planet) => {
  return `
  <button class="btn p-btn shadow btn-primary m-1" data-url="${planet.url}">${planet.name}</button>
`;
};
const planetDetails = (planet) => {
  return `
  <div
  class="container shadow bg-primary p-4 my-4 w-75 rounded text-center planet-details text-light"
  >
    <div class="border border-light">
      <p class="text-uppercase fs-1 m-1">${planet.name}</p>
    </div>
    <div>
      <p class="fs-5 m-1">Climate: ${planet.climate}</p>
    </div>
    <div>
      <p class="m-1">${formatter.format(planet.population)} habitants</p>
    </div>
    <div>
      <p class="m-1">Biome: ${planet.terrain}</p>
    </div>
    <button class="btn btn-outline-light w-25 mt-3 back-btn">Back</button>
  </div>`;
};

const foundNoPlanet = (name) =>
  `<p>Cannot find any planets named "${name}"</p>`;

// HELPERS
const formatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
});

// FUNCTIONS
const AJAX = async function (endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Problem fetching content");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const toggleView = function (parent, action) {
  const actions = {
    HIDE: () => parent.classList.add("hidden"),
    SHOW: () => parent.classList.remove("hidden"),
  };
  actions[action]();
};

const renderPlanets = async function () {
  const data = await AJAX(PLANETS);
  const planets = data.results;
  planets.map((planet) => {
    planetsDiv.insertAdjacentHTML("afterbegin", planetButton(planet));
  });
  allPlanetButtons = [...document.querySelectorAll(".p-btn")];
  allPlanetButtons.forEach((btn) =>
    btn.addEventListener("click", showPlanetDetails)
  );
};

const showPlanetDetails = async function (event, search = false) {
  const endpoint = search ? event : event.target.dataset.url;
  const planetData = await AJAX(endpoint);

  toggleView(planetsDiv, "HIDE");
  toggleView(planetDetailsDiv, "SHOW");
  planetDetailsDiv.insertAdjacentHTML("afterbegin", planetDetails(planetData));

  backBtn = document.querySelector(".back-btn");
  backBtn.addEventListener("click", () => {
    toggleView(planetsDiv, "SHOW");
    toggleView(planetDetailsDiv, "HIDE");

    const prevPlanet = document.querySelector(".planet-details");
    planetDetailsDiv.removeChild(prevPlanet);
  });
};

async function handleSearchPlanet(event) {
  event.preventDefault();
  const planet = allPlanetButtons.find(
    (btn) => btn.textContent.toLowerCase() === searchInput.value.toLowerCase()
  );

  if (!planet) return alert(`Can't find any planets named "${searchInput.value}"`);

  showPlanetDetails(planet.dataset.url, true);
  searchInput.value = "";
}

renderPlanets();
