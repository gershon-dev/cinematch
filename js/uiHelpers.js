// uiHelpers.js — small shared UI utilities.
export function showLoading(container) {
  container.innerHTML = '<p class="status">Loading…</p>';
}

export function showError(container, message) {
  container.innerHTML = `<p class="status status--error">${message}</p>`;
}
