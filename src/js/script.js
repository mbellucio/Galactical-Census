"use strict";

// API ENDPOINTS
const PLANETS = "https://swapi.dev/api/planets/";

// SELECTORS
const planetsDiv = document.querySelector(".planets");
const planetDetailsDiv = document.querySelector(".planets-details");
const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-input");
const errorDiv = document.querySelector(".error-msg");
let allPlanetButtons = [];
let backBtn;

let state = {
  error: false,
};

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
  <div class="planet-details">
    <div class="container shadow bg-primary p-3 w-75 rounded text-center text-light">
      <div class="border border-light">
        <p class="text-uppercase fs-1 m-1">${planet.name}</p>
      </div>
      <div>
        <p class="fs-5 m-1">Climate: ${planet.climate}</p>
      </div>
      <div>
        <p class="m-1">${
          isNaN(planet.population) ? "no" : formatter.format(planet.population)
        } habitants</p>
      </div>
      <div>
        <p class="m-1">Biome: ${planet.terrain}</p>
      </div>
      <button class="btn btn-outline-light mt-3 w-25 back-btn">Back</button>
    </div>
    <div class="container shadow bg-primary p-4 my-4 w-75 rounded residents-table text-center text-light">
      <div>
        <p class="fs-5 pb-2">Famous Residents</p>
      </div>
      <table class="table  table-primary table-hover">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Birth Year</th>
          </tr>
        </thead>
        <tbody class="resident-info">
          
        </tbody>
      </table>
    </div>
  </div>
  `;
};
const habitantsInfo = (habitant) => `
  <tr>
    <td>${habitant.name}</td>
    <td>${habitant.birth_year}</td>
  </tr>
`;

const errorMsg = (name) => `
  <p class="text-danger fs-5 e-msg">Could not find any planets named: "${name}"</p>
`;

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

const errorReducer = function (action, query = "value") {
  if (action == "REMOVE") {
    const message = document.querySelector(".e-msg");
    toggleView(errorDiv, "HIDE");
    errorDiv.removeChild(message);
    state.error = false;
  }

  if (action == "ADD") {
    errorDiv.insertAdjacentHTML("afterbegin", errorMsg(query));
    toggleView(errorDiv, "SHOW");
    state.error = true;
  }
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

  if (state.error) errorReducer("REMOVE");
  toggleView(planetsDiv, "HIDE");
  toggleView(planetDetailsDiv, "SHOW");
  planetDetailsDiv.insertAdjacentHTML("afterbegin", planetDetails(planetData));

  if (planetData.residents.length === 0) {
    const prevPlanet = document.querySelector(".planet-details");
    const table = document.querySelector(".residents-table");
    prevPlanet.removeChild(table);
  } else {
    planetData.residents.forEach((resident) => showHabitantDetail(resident));
  }

  backBtn = document.querySelector(".back-btn");
  backBtn.addEventListener("click", () => {
    toggleView(planetsDiv, "SHOW");
    toggleView(planetDetailsDiv, "HIDE");
    if (state.error) errorReducer("REMOVE");

    const prevPlanet = document.querySelector(".planet-details");
    planetDetailsDiv.removeChild(prevPlanet);
  });
};

const showHabitantDetail = async function (resident) {
  const residentData = await AJAX(resident);
  const table = document.querySelector(".resident-info");
  table.insertAdjacentHTML("afterbegin", habitantsInfo(residentData));
};

async function handleSearchPlanet(event) {
  event.preventDefault();
  const planet = allPlanetButtons.find(
    (btn) => btn.textContent.toLowerCase() === searchInput.value.toLowerCase()
  );

  if (!planet) {
    // errorDiv.insertAdjacentHTML("afterbegin", errorMsg(searchInput.value));
    // return toggleView(errorDiv, "SHOW");
    return errorReducer("ADD", searchInput.value);
  }

  const prevPlanet = document.querySelector(".planet-details");
  if (prevPlanet) {
    planetDetailsDiv.removeChild(prevPlanet);
  }

  showPlanetDetails(planet.dataset.url, true);
  searchInput.value = "";
}
renderPlanets();
