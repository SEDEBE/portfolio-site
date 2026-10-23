import './style.css'

// Content is visible without JavaScript; entrances only switch on once this script runs.
document.documentElement.classList.add('js')

for (const element of document.querySelectorAll('[data-year]')) {
  element.textContent = String(new Date().getFullYear())
}

// ---- Entrances: the heading, then the text, then the picture of each section ----
const reveal = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-in')
      reveal.unobserve(entry.target)
    }
  },
  { rootMargin: '0px 0px -10% 0px' },
)
for (const section of document.querySelectorAll('section, header')) {
  section.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element, index) => {
    element.style.setProperty('--delay', `${Math.min(index, 5) * 80}ms`)
    reveal.observe(element)
  })
}

// ---- The stage follows the section being read, and previews a project on hover ----
const stage = document.querySelector<HTMLElement>('#stage')
let sectionState = 'console'
const video = document.querySelector<HTMLVideoElement>('.stage-video')
const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
// Below this width the stage is only the console (see style.css): no recording to play.
const wide = window.matchMedia('(min-width: 1024px)')
const show = (state: string) => {
  if (!stage) return
  stage.dataset.state = state
  // The recording plays only while it is on stage, and never when the visitor asks for less motion.
  if (!video) return
  if (state === 'dashboard' && wide.matches && !calm.matches) void video.play().catch(() => {})
  else video.pause()
}

// The section whose heading has passed 45% of the screen takes the stage. Headings, not section boxes:
// a section's top padding would claim the stage while its title is still far down the screen.
const staged = [...document.querySelectorAll<HTMLElement>('[data-stage]')]
let ticking = false
const pickStage = () => {
  ticking = false
  let state = 'console'
  for (const section of staged) {
    const marker = section.querySelector('h1, h2') ?? section
    if (marker.getBoundingClientRect().top <= window.innerHeight * 0.45) state = section.dataset.stage ?? state
  }
  if (state !== sectionState) {
    sectionState = state
    show(state)
  }
}
window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(pickStage)
    }
  },
  { passive: true },
)
// The page opens on the console (the HTML's state); scrolling, including a restored scroll position,
// moves the stage on. Measuring on load is unreliable while fonts and styles are still settling.

for (const row of document.querySelectorAll<HTMLElement>('[data-preview]')) {
  const preview = () => show(row.dataset.preview ?? sectionState)
  row.addEventListener('mouseenter', preview)
  row.addEventListener('focus', preview)
  row.addEventListener('mouseleave', () => show(sectionState))
  row.addEventListener('blur', () => show(sectionState))
}

// ---- The live thing: ask the project's real API for this month's summary ----
const api = document.body.dataset.api ?? ''
const runButton = document.querySelector<HTMLButtonElement>('#console-run')
const json = document.querySelector<HTMLElement>('#console-json code')
const status1 = document.querySelector<HTMLElement>('#console-status-1')
const status2 = document.querySelector<HTMLElement>('#console-status-2')
const note = document.querySelector<HTMLElement>('#console-note')
// The sample answer is written one category per line, which is too wide for a phone: there it gets the
// usual indented layout, the same one the live answer uses.
if (json && !wide.matches) {
  try {
    json.textContent = JSON.stringify(JSON.parse(json.textContent ?? ''), null, 2)
  } catch {
    // Leave the sample as written.
  }
}

async function timed(url: string, init?: RequestInit) {
  const start = performance.now()
  const response = await fetch(url, init)
  return { response, ms: Math.round(performance.now() - start) }
}

runButton?.addEventListener('click', async () => {
  if (!json || !status1 || !status2 || !note) return
  runButton.disabled = true
  runButton.textContent = 'Pidiendo…'
  status1.textContent = status2.textContent = ''
  json.textContent = ''
  try {
    const demo = await timed(`${api}/auth/demo/`, { method: 'POST' })
    status1.textContent = `→ ${demo.response.status} · ${demo.ms} ms`
    if (demo.response.status === 429) {
      json.textContent = JSON.stringify(await demo.response.json(), null, 2)
      note.textContent = 'La API limita las cuentas de prueba a 10 por hora desde la misma conexión. Vuelve a probar en un rato.'
      return
    }
    if (!demo.response.ok) throw new Error(`La API respondió ${demo.response.status}`)
    const { access } = (await demo.response.json()) as { access: string }

    const month = new Date().toISOString().slice(0, 7)
    const summary = await timed(`${api}/expenses/summary/?month=${month}`, {
      headers: { Authorization: `Bearer ${access}`, 'Accept-Language': 'es' },
    })
    status2.textContent = `→ ${summary.response.status} · ${summary.ms} ms`
    json.textContent = JSON.stringify(await summary.response.json(), null, 2)
    note.textContent = 'Respuesta real del servidor, de una cuenta de prueba creada ahora mismo. Se borra a las 24 horas.'
  } catch {
    json.textContent = '{\n  "detail": "La API no responde ahora mismo."\n}'
    note.textContent = 'No se ha podido contactar con la API. Puedes abrir la app directamente con el enlace de arriba.'
  } finally {
    runButton.disabled = false
    runButton.textContent = 'Pedirlo otra vez'
  }
})

// ---- Contact: no backend, so the field opens the visitor's email with the message written ----
document.querySelector<HTMLFormElement>('#contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault()
  const message = new FormData(event.currentTarget as HTMLFormElement).get('mensaje')?.toString().trim()
  if (!message) return
  const subject = encodeURIComponent('Contacto desde tu portfolio')
  window.location.href = `mailto:alejandrocordoba28@gmail.com?subject=${subject}&body=${encodeURIComponent(message)}`
})
