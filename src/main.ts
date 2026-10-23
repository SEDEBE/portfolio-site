import './style.css'

// Keep the copyright year current without rebuilding the site every January.
for (const element of document.querySelectorAll('[data-year]')) {
  element.textContent = String(new Date().getFullYear())
}
