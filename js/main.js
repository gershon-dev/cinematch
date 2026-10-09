// main.js — page entry point. Each block only runs on the page that has its elements.
import {
  getTrending, getPopular, searchMovies, discoverMovies,
  getMovieDetails, searchPeople, getPersonMovies, getOmdbDetails,
} from "./api.js";
import { normalizeList, normalizeDetails, normalizeOmdb, loadGenres } from "./movieService.js";
import { renderMovies } from "./renderMovies.js";
import { renderDetail, renderOmdbPanel } from "./renderDetail.js";
import { getWatchlist, getFavorites } from "./storageService.js";
import { showLoading, showError, openSurpriseModal } from "./uiHelpers.js";

const params = new URLSearchParams(location.search);

/* ---------- browse page: trending, search, people, genre filters, surprise ---------- */
const state = {
  query: params.get("q")?.trim() || "",
  type: params.get("type") === "person" ? "person" : "movie",
  genres: new Set(),
};

const trendingSection = document.getElementById("trending-section");
const trendingGrid = document.getElementById("trending");
const resultsHeading = document.getElementById("results-heading");
const resultsGrid = document.getElementById("popular");
let requestId = 0; // ignores slow responses that arrive after a newer request

function applyGenres(movies) {
  const ids = [...state.genres];
  return ids.length ? movies.filter((m) => ids.every((id) => m.genreIds.includes(id))) : movies;
}

async function getBrowseResults() {
  const genreIds = [...state.genres];

  if (state.query && state.type === "person") {
    const people = await searchPeople(state.query);
    if (!people.length) return { heading: `No people found for “${state.query}”`, movies: [] };
    const movies = normalizeList(await getPersonMovies(people[0].id));
    return { heading: `Movies with ${people[0].name}`, movies: applyGenres(movies) };
  }
  if (state.query) {
    const movies = normalizeList(await searchMovies(state.query));
    return { heading: `Results for “${state.query}”`, movies: applyGenres(movies) };
  }
  if (genreIds.length) {
    return { heading: "Filtered Movies", movies: normalizeList(await discoverMovies(genreIds)) };
  }
  return { heading: "Popular Movies", movies: normalizeList(await getPopular()) };
}

async function refreshBrowse() {
  const myRequest = ++requestId;
  trendingSection.hidden = Boolean(state.query) || state.genres.size > 0;
  showLoading(resultsGrid);

  try {
    const { heading, movies } = await getBrowseResults();
    if (myRequest !== requestId) return;
    resultsHeading.textContent = heading;
    renderMovies(resultsGrid, movies, { emptyMessage: "No movies found. Try a different search or genre." });
  } catch (error) {
    if (myRequest !== requestId) return;
    console.error(error);
    showError(resultsGrid, "Could not load movies. Check your API key and connection.");
  }
}

async function setupGenreFilters() {
  const bar = document.getElementById("genre-filters");
  try {
    for (const genre of await loadGenres()) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn";
      button.textContent = genre.name;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        const active = !state.genres.has(genre.id);
        if (active) state.genres.add(genre.id);
        else state.genres.delete(genre.id);
        button.setAttribute("aria-pressed", String(active));
        refreshBrowse();
      });
      bar.append(button);
    }
  } catch (error) {
    console.error(error);
    bar.textContent = "Genre filters are unavailable.";
  }
}

// Surprise Me: random popular movie, limited to any genres selected above.
async function surpriseMe() {
  const dialog = document.getElementById("surprise-dialog");
  try {
    const page = Math.floor(Math.random() * 5) + 1;
    const genreIds = [...state.genres];
    const raw = genreIds.length ? await discoverMovies(genreIds, page) : await getPopular(page);
    const movies = normalizeList(raw).filter((m) => m.posterUrl);
    const pick = movies[Math.floor(Math.random() * movies.length)] || null;
    openSurpriseModal(dialog, pick, surpriseMe);
  } catch (error) {
    console.error(error);
    openSurpriseModal(dialog, null, surpriseMe);
  }
}

if (resultsGrid && resultsHeading) {
  document.getElementById("search-input").value = state.query;
  document.getElementById("search-type").value = state.type;
  document.getElementById("surprise-btn").addEventListener("click", surpriseMe);
  document.querySelector("#surprise-dialog [data-close]").addEventListener("click", () => {
    document.getElementById("surprise-dialog").close();
  });

  showLoading(trendingGrid);
  getTrending()
    .then((raw) => renderMovies(trendingGrid, normalizeList(raw)))
    .catch((error) => { console.error(error); showError(trendingGrid, "Could not load trending movies."); });

  setupGenreFilters();
  refreshBrowse();
}

/* ---------- detail page ---------- */
const detailEl = document.getElementById("detail");
if (detailEl) {
  const id = Number(params.get("id"));
  if (!id) {
    showError(detailEl, "No movie selected. Go back to Browse and pick one.");
  } else {
    showLoading(detailEl);
    getMovieDetails(id)
      .then((raw) => {
        const movie = normalizeDetails(raw);
        document.title = `${movie.title} | CineMatch`;
        renderDetail(detailEl, movie);

        // Second API: add IMDb / Rotten Tomatoes / Metacritic data when available.
        if (movie.imdbId) {
          getOmdbDetails(movie.imdbId)
            .then((omdb) => renderOmdbPanel(detailEl, normalizeOmdb(omdb)))
            .catch((error) => console.warn("OMDb data unavailable", error));
        }
      })
      .catch((error) => { console.error(error); showError(detailEl, "Could not load this movie."); });
  }
}

/* ---------- watchlist page ---------- */
const toWatchGrid = document.getElementById("watchlist-list");
const watchedGrid = document.getElementById("watched-list");
if (toWatchGrid && watchedGrid) {
  const drawWatchlist = () => {
    const all = getWatchlist();
    const options = { onChange: drawWatchlist, watchControls: true };
    renderMovies(toWatchGrid, all.filter((m) => !m.watched), {
      ...options,
      emptyMessage: "Nothing to watch yet. Browse movies and tap “+ Watchlist” to save one.",
    });
    renderMovies(watchedGrid, all.filter((m) => m.watched), {
      ...options,
      emptyMessage: "Movies you mark as watched appear here with your rating.",
    });
  };
  drawWatchlist();
}

/* ---------- favorites page ---------- */
const favoritesGrid = document.getElementById("favorites-list");
if (favoritesGrid) {
  const drawFavorites = () => renderMovies(favoritesGrid, getFavorites(), {
    onChange: drawFavorites,
    emptyMessage: "No favorites yet. Tap the heart on any movie to add it.",
  });
  drawFavorites();
}