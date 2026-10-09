// uiHelpers.js — shared UI utilities: escaping, loading states, modal.
export function escapeHTML(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function showLoading(container) {
  container.innerHTML = '<p class="status">Loading…</p>';
}

export function showError(container, message) {
  container.innerHTML = `<p class="status status--error">${escapeHTML(message)}</p>`;
}

// Fills the Surprise Me dialog and opens it. Pass movie = null for a "nothing found" message.
export function openSurpriseModal(dialog, movie, onAnother) {
  const body = dialog.querySelector(".dialog-body");

  if (!movie) {
    body.innerHTML = '<h2 id="surprise-title">No luck</h2><p>Could not find a movie. Try again or change your genres.</p>';
  } else {
    const overview = movie.overview.length > 280 ? `${movie.overview.slice(0, 280)}…` : movie.overview;
    body.innerHTML = `
      ${movie.posterUrl ? `<img class="modal__poster" src="${movie.posterUrl}" alt="Poster for ${escapeHTML(movie.title)}">` : ""}
      <div>
        <h2 id="surprise-title">${escapeHTML(movie.title)}</h2>
        <p class="movie-card__meta"><span class="rating">★ ${movie.rating}</span> ${movie.year}</p>
        <p>${escapeHTML(overview)}</p>
        <a class="btn btn--search" href="movie-detail.html?id=${movie.id}">View details</a>
      </div>`;
  }

  dialog.querySelector("[data-again]").onclick = onAnother;
  if (!dialog.open) dialog.showModal();
}