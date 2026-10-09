// renderMovies.js — builds poster cards and injects them into the page.
import {
  isInWatchlist, isFavorite, toggleWatchlist, toggleFavorite, setWatched, setRating,
} from "./storageService.js";
import { escapeHTML } from "./uiHelpers.js";

function setButtonState(button, active, onLabel, offLabel) {
  button.setAttribute("aria-pressed", String(active));
  button.textContent = active ? onLabel : offLabel;
}

// "+ Watchlist" and heart buttons, used on cards and on the detail page.
export function createActionButtons(movie, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "movie-card__actions";
  wrap.innerHTML = `
    <button type="button" class="btn btn--watchlist"></button>
    <button type="button" class="btn btn--favorite" aria-label="Favorite ${escapeHTML(movie.title)}"></button>`;

  const watchBtn = wrap.querySelector(".btn--watchlist");
  const favBtn = wrap.querySelector(".btn--favorite");
  setButtonState(watchBtn, isInWatchlist(movie.id), "✓ In Watchlist", "+ Watchlist");
  setButtonState(favBtn, isFavorite(movie.id), "♥", "♡");

  watchBtn.addEventListener("click", () => {
    setButtonState(watchBtn, toggleWatchlist(movie), "✓ In Watchlist", "+ Watchlist");
    if (onChange) onChange();
  });
  favBtn.addEventListener("click", () => {
    setButtonState(favBtn, toggleFavorite(movie), "♥", "♡");
    if (onChange) onChange();
  });
  return wrap;
}

// Mark as watched button, or the 1-5 star rating once watched.
function createWatchControls(movie, onChange) {
  const wrap = document.createElement("div");
  wrap.className = "watch-controls";

  const makeButton = (label, handler) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn";
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  };

  if (!movie.watched) {
    wrap.append(makeButton("✓ Mark as watched", () => { setWatched(movie.id, true); if (onChange) onChange(); }));
    return wrap;
  }

  const stars = document.createElement("div");
  stars.className = "stars";
  stars.setAttribute("role", "group");
  stars.setAttribute("aria-label", "Your rating");
  for (let n = 1; n <= 5; n++) {
    const star = document.createElement("button");
    star.type = "button";
    star.className = "star";
    star.textContent = "★";
    star.setAttribute("aria-label", `Rate ${n} out of 5`);
    star.setAttribute("aria-pressed", String(n <= (movie.userRating || 0)));
    star.addEventListener("click", () => { setRating(movie.id, n); if (onChange) onChange(); });
    stars.append(star);
  }
  wrap.append(stars, makeButton("Move back", () => { setWatched(movie.id, false); if (onChange) onChange(); }));
  return wrap;
}

function createCard(movie, { onChange, watchControls }) {
  const card = document.createElement("article");
  card.className = "movie-card";
  card.dataset.id = movie.id;

  const title = escapeHTML(movie.title);
  const detailUrl = `movie-detail.html?id=${movie.id}`;
  const poster = movie.posterUrl
    ? `<img src="${movie.posterUrl}" alt="Poster for ${title}" loading="lazy">`
    : `<div class="movie-card__noposter">No poster</div>`;

  card.innerHTML = `
    <a class="movie-card__poster" href="${detailUrl}">${poster}</a>
    <div class="movie-card__info">
      <h3 class="movie-card__title"><a href="${detailUrl}">${title}</a></h3>
      <p class="movie-card__meta"><span class="rating">★ ${movie.rating}</span> ${movie.year}</p>
    </div>`;

  const info = card.querySelector(".movie-card__info");
  info.append(createActionButtons(movie, onChange));
  if (watchControls) info.append(createWatchControls(movie, onChange));
  return card;
}

export function renderMovies(container, movies, { emptyMessage = "", onChange = null, watchControls = false } = {}) {
  if (movies.length === 0 && emptyMessage) {
    container.innerHTML = `<p class="status">${escapeHTML(emptyMessage)}</p>`;
    return;
  }
  container.replaceChildren(...movies.map((movie) => createCard(movie, { onChange, watchControls })));
}