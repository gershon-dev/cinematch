// movieService.js — turns raw TMDB data into objects the UI can use.
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function normalizeMovie(raw) {
  return {
    id: raw.id,
    title: raw.title,
    year: raw.release_date ? raw.release_date.slice(0, 4) : "—",
    rating: raw.vote_average ? raw.vote_average.toFixed(1) : "N/A",
    overview: raw.overview || "",
    genreIds: raw.genre_ids || [],
    posterUrl: raw.poster_path ? `${IMAGE_BASE}/w342${raw.poster_path}` : null,
    backdropUrl: raw.backdrop_path ? `${IMAGE_BASE}/w780${raw.backdrop_path}` : null,
  };
}

export function normalizeList(results) {
  return results.map(normalizeMovie);
}

// Local copy of TMDB's genre IDs (json/genres.json).
export async function loadGenres() {
  const response = await fetch("json/genres.json");
  if (!response.ok) throw new Error("Could not load genres.json");
  return response.json();
}

export function formatRuntime(minutes) {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

// Turns the /movie/{id} response (with credits and similar) into one view-ready object.
export function normalizeDetails(raw) {
  const genres = raw.genres || [];
  const base = normalizeMovie({ ...raw, genre_ids: genres.map((g) => g.id) });
  return {
    ...base,
    tagline: raw.tagline || "",
    runtime: raw.runtime || 0,
    releaseDate: raw.release_date || "",
    genres,
    cast: (raw.credits?.cast || []).slice(0, 15).map((p) => ({
      id: p.id,
      name: p.name,
      character: p.character || "",
      photoUrl: p.profile_path ? `${IMAGE_BASE}/w185${p.profile_path}` : null,
    })),
    similar: normalizeList(raw.similar?.results || []).slice(0, 12),
  };
}