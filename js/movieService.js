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
