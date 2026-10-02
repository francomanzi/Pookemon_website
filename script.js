const typeColors = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  electric: "#f8d030",
  grass: "#78c850",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac"
};

const totalPokemon = 30;
let allPokemon = [];

const grid = document.getElementById("grid");
const statusText = document.getElementById("status");
const searchBox = document.getElementById("search");

function cleanName(name) {
  return name.replace("-", " ");
}

function getAbilityNames(pokemon) {
  return pokemon.abilities.map(function (item) {
    return cleanName(item.ability.name);
  });
}

async function loadPokemon() {
  statusText.textContent = "Loading Pokémon...";
  statusText.className = "status loading";
  grid.innerHTML = "";

  try {
    const listUrl = "https://pokeapi.co/api/v2/pokemon?limit=" + totalPokemon + "&offset=0";
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    const requests = listData.results.map(function (item) {
      return fetch(item.url).then(function (response) {
        return response.json();
      });
    });

    allPokemon = await Promise.all(requests);

    statusText.textContent = "";
    statusText.className = "status";
    showPokemon();
  } catch (error) {
    statusText.textContent = "Something went wrong. Please check your internet and try again.";
    statusText.className = "status error";
  }
}

function showPokemon() {
  const searchText = searchBox.value.trim().toLowerCase();

  const filtered = allPokemon.filter(function (pokemon) {
    return pokemon.name.includes(searchText);
  });

  grid.innerHTML = "";

  for (const pokemon of filtered) {
    const image = pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;

    let typeBadges = "";
    for (const item of pokemon.types) {
      const typeColor = typeColors[item.type.name] || "#777";
      typeBadges += '<span class="type" style="background-color: ' + typeColor + '">' + item.type.name + "</span>";
    }

    grid.innerHTML +=
      '<article class="card">' +
        '<span class="number">#' + pokemon.id + "</span>" +
        '<img src="' + image + '" alt="' + pokemon.name + '" loading="lazy">' +
        '<h2 class="name">' + cleanName(pokemon.name) + "</h2>" +
        '<div class="types">' + typeBadges + "</div>" +
        '<p class="stats">' + pokemon.height / 10 + " m · " + pokemon.weight / 10 + " kg</p>" +
        '<button class="card-btn" data-name="' + pokemon.name + '">Say Hello</button>' +
        '<p class="message"></p>' +
      "</article>";
  }

  if (filtered.length === 0) {
    statusText.textContent = "No Pokémon found.";
  } else {
    statusText.textContent = "";
  }
}

grid.addEventListener("click", function (event) {
  const button = event.target.closest(".card-btn");
  if (!button) {
    return;
  }

  const pokemon = allPokemon.find(function (item) {
    return item.name === button.dataset.name;
  });

  const message = button.nextElementSibling;
  const abilities = getAbilityNames(pokemon).join(" and ");

  message.textContent = "I am " + cleanName(pokemon.name) + " and I have " + abilities + ".";
  message.classList.toggle("show");

  if (message.classList.contains("show")) {
    button.textContent = "Hide";
  } else {
    button.textContent = "Say Hello";
  }
});

searchBox.addEventListener("input", showPokemon);

loadPokemon();
