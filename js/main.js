// main.js — page entry point.
import { getTrending, getPopular } from "./api.js";
import { normalizeList } from "./movieService.js";
import { renderMovies } from "./renderMovies.js";
import { showLoading, showError } from "./uiHelpers.js";

async function loadSection(containerId, fetcher) {
  const container = document.getElementById(containerId);
  if (!container) return;
  showLoading(container);
  try {
    const movies = normalizeList(await fetcher());
    renderMovies(container, movies);
  } catch (error) {
    console.error(error);
    showError(container, "Could not load movies. Check your API key and connection.");
  }
}

loadSection("trending", getTrending);
loadSection("popular", getPopular);
