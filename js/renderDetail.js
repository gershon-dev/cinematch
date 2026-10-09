// renderDetail.js
// renderDetail.js — builds the movie detail view.
import { createActionButtons, renderMovies } from "./renderMovies.js";
import { escapeHTML } from "./uiHelpers.js";
import { formatRuntime } from "./movieService.js";

function castCard(person) {
  const photo = person.photoUrl
    ? `<img src="${person.photoUrl}" alt="${escapeHTML(person.name)}" loading="lazy">`
    : `<div class="cast-card__nophoto">No photo</div>`;
  const link = `index.html?q=${encodeURIComponent(person.name)}&type=person`;
  return `
    <a class="cast-card" href="${link}">
      ${photo}
      <p class="cast-card__name">${escapeHTML(person.name)}</p>
      <p class="cast-card__role">${escapeHTML(person.character)}</p>
    </a>`;
}

export function renderDetail(container, movie) {
  const backdrop = movie.backdropUrl ? `style="--backdrop: url('${movie.backdropUrl}')"` : "";
  const poster = movie.posterUrl
    ? `<img class="detail-poster" src="${movie.posterUrl}" alt="Poster for ${escapeHTML(movie.title)}">`
    : "";
  const facts = [`★ ${movie.rating}`, formatRuntime(movie.runtime), movie.releaseDate].filter(Boolean).join("  •  ");
  const tags = movie.genres.map((g) => `<li>${escapeHTML(g.name)}</li>`).join("");

  container.innerHTML = `
    <section class="detail-hero" ${backdrop}>
      <div class="detail-hero__inner">
        ${poster}
        <div class="detail-hero__text">
          <h1>${escapeHTML(movie.title)} <span class="detail-year">(${movie.year})</span></h1>
          ${movie.tagline ? `<p class="detail-tagline">${escapeHTML(movie.tagline)}</p>` : ""}
          <p class="detail-meta">${facts}</p>
          <ul class="genre-tags">${tags}</ul>
          <div id="detail-actions"></div>
          <h2>Overview</h2>
          <p>${escapeHTML(movie.overview) || "No overview available."}</p>
        </div>
      </div>
    </section>
    <section>
      <h2>Cast</h2>
      <div class="cast-row">${movie.cast.map(castCard).join("") || '<p class="status">No cast information.</p>'}</div>
    </section>
    <section>
      <h2>More Like This</h2>
      <div id="similar-row" class="carousel"></div>
    </section>`;

  container.querySelector("#detail-actions").append(createActionButtons(movie));
  renderMovies(container.querySelector("#similar-row"), movie.similar, { emptyMessage: "No similar movies found." });
}