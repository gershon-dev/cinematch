// renderMovies.js — builds poster cards and injects them into the page.
function createCard(movie) {
  const card = document.createElement("article");
  card.className = "movie-card";
  card.dataset.id = movie.id;

  const poster = movie.posterUrl
    ? `<img src="${movie.posterUrl}" alt="Poster for ${movie.title}" loading="lazy">`
    : `<div class="movie-card__noposter">No poster</div>`;

  card.innerHTML = `
    ${poster}
    <div class="movie-card__info">
      <h3 class="movie-card__title">${movie.title}</h3>
      <p class="movie-card__meta"><span class="rating">★ ${movie.rating}</span> ${movie.year}</p>
    </div>`;
  return card;
}

export function renderMovies(container, movies) {
  container.replaceChildren(...movies.map(createCard));
}
