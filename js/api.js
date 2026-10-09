// api.js — all TMDB requests live here.
import * as config from "../config.js";

// Read as properties so the site still loads if config.js has no OMDb key yet.
const { TMDB_BASE_URL, TMDB_API_KEY, OMDB_API_KEY } = config;

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

export async function searchMovies(query, page = 1) {
  const data = await fetchTMDB("/search/movie", { query, page, include_adult: false });
  return data.results;
}

// genreIds are combined with AND, so each extra genre narrows the results.
export async function discoverMovies(genreIds, page = 1) {
  const data = await fetchTMDB("/discover/movie", {
    with_genres: genreIds.join(","),
    sort_by: "popularity.desc",
    include_adult: false,
    page,
  });
  return data.results;
}

export async function getMovieDetails(id) {
  return fetchTMDB(`/movie/${id}`, { append_to_response: "credits,similar" });
}

export async function searchPeople(query) {
  const data = await fetchTMDB("/search/person", { query, include_adult: false });
  return data.results;
}

// Movies an actor appeared in plus movies they directed, most popular first.
export async function getPersonMovies(personId) {
  const data = await fetchTMDB(`/person/${personId}/movie_credits`);
  const directed = data.crew.filter((m) => m.job === "Director");
  const byId = new Map();
  for (const movie of [...data.cast, ...directed]) byId.set(movie.id, movie);
  return [...byId.values()].sort((a, b) => b.popularity - a.popularity).slice(0, 40);
}

// ---------- second API: OMDb (IMDb, Rotten Tomatoes and Metacritic data) ----------
const OMDB_URL = "https://www.omdbapi.com/";

// Returns the raw OMDb record for an IMDb id, or null if there is no key or no match.
export async function getOmdbDetails(imdbId) {
  if (!OMDB_API_KEY || OMDB_API_KEY === "YOUR_OMDB_KEY_HERE") return null;

  const cacheKey = `cinematch-omdb-${imdbId}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // The cache is optional, so ignore storage problems.
  }

  const url = new URL(OMDB_URL);
  url.searchParams.set("apikey", OMDB_API_KEY);
  url.searchParams.set("i", imdbId);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`OMDb request failed (${response.status})`);
  const data = await response.json();
  if (data.Response === "False") return null;

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
  } catch {
    // Ignore storage problems.
  }
  return data;
}