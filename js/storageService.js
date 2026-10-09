// storageService.js — saves the watchlist and favorites in localStorage.
const WATCHLIST_KEY = "cinematch-watchlist";
const FAVORITES_KEY = "cinematch-favorites";

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function write(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error("Could not save to localStorage", error);
  }
}

export const getWatchlist = () => read(WATCHLIST_KEY);
export const getFavorites = () => read(FAVORITES_KEY);

export const isInWatchlist = (id) => getWatchlist().some((m) => m.id === id);
export const isFavorite = (id) => getFavorites().some((m) => m.id === id);

// Adds the movie if it is not saved yet, removes it if it is.
// Returns true when the movie is saved after the call.
function toggle(key, movie, extraFields = {}) {
  const items = read(key);
  const exists = items.some((m) => m.id === movie.id);

  if (exists) {
    write(key, items.filter((m) => m.id !== movie.id));
    return false;
  }

  items.push({
    id: movie.id,
    title: movie.title,
    year: movie.year,
    rating: movie.rating,
    posterUrl: movie.posterUrl,
    addedDate: new Date().toISOString(),
    ...extraFields,
  });
  write(key, items);
  return true;
}

export const toggleWatchlist = (movie) =>
  toggle(WATCHLIST_KEY, movie, { watched: false, userRating: null });

export const toggleFavorite = (movie) => toggle(FAVORITES_KEY, movie);

function update(key, id, changes) {
  write(key, read(key).map((m) => (m.id === id ? { ...m, ...changes } : m)));
}

// Moving a movie back to "to watch" also clears its rating.
export const setWatched = (id, watched) =>
  update(WATCHLIST_KEY, id, watched ? { watched: true } : { watched: false, userRating: null });

export const setRating = (id, rating) => update(WATCHLIST_KEY, id, { userRating: rating });