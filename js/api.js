// api.js — all TMDB requests live here.
import { TMDB_BASE_URL, TMDB_API_KEY } from "../config.js";

async function fetchTMDB(path, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}) for ${path}`);
  }
  return response.json();
}

export async function getTrending() {
  const data = await fetchTMDB("/trending/movie/week");
  return data.results;
}

export async function getPopular(page = 1) {
  const data = await fetchTMDB("/movie/popular", { page });
  return data.results;
}
