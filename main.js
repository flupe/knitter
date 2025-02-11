// initial design size
const WIDTH  = 32
const HEIGHT = 32

// global vars
const MOUSE = {x: 0, y: 0, down: false}
let TOOL = null
let SPACEBAR = false
let YARN = 0 // active yarn id

// viewport params
let SCALE = 1.0
let OFFSET = {x:0.0, y:0.0}

// prelude
const on = (t, e, f) =>
  Array.isArray(t)
    ? t.forEach(t => on(t, e, f))
    : Array.isArray(e)
        ? e.forEach(e => on(t, e, f))
        : t.addEventListener(e, f)
const bind = (o, f) => o[f].bind(o)
const $ = bind(document, "createElement")

const DESIGN = []

function createDesign() {
  // table.design > tr (row) > td (cell) > div
  const container = $("table")
  const body      = $("tbody")

  container.classList.add("design")
  container.appendChild(body)

  const row    = $("tr")
  const cell   = $("td")
  const stitch = $("div")

  stitch.classList.add("stitch")
  cell.appendChild(stitch)
  cell.dataset.stitch = "knit"

  // create cells for a single row
  for (let i = 0; i < WIDTH; i++)
    row.appendChild(cell.cloneNode(true))

  // insert rows in container
  for (let j = 0; j < HEIGHT; j++)
    body.appendChild(row.cloneNode(true))

  main.appendChild(container)

  return container
}


const table = createDesign()
updateDesign()

// initialize yarns
const yarns = (function(colors) {
  const yarns = []
  colors.forEach((col, i) => {
    const yarn = {
      color: col,
      swatch: $('button'),
    }

    document.body.style.setProperty(`--yarn-color${i}`, col)
    yarn.swatch.classList.toggle("active", i == 0)
    yarn.swatch.style.background = `var(--yarn-color${i})`
    yarn_swatch.appendChild(yarn.swatch)

    on(yarn.swatch, "click", async () => {
      yarns[YARN].swatch.classList.remove("active")
      yarn.swatch.classList.add("active")
      YARN = i
    })

    yarns.push(yarn)
  })

  return yarns
})(['#f0c432', '#68942f', '#782354'])

// reapply CSS transform
function updateDesign() {
  table.style.scale = SCALE
  table.style.translate = `${OFFSET.x * SCALE | 0}px ${OFFSET.y * SCALE | 0}px`
}


on(main, "wheel", async e => {
  // scroll magic
  e.preventDefault()
  let width   = main.offsetWidth
  let height  = main.offsetHeight
  let dx      = MOUSE.x - width  / 2
  let dy      = MOUSE.y - height / 2
  let rescale = Math.max(.5, SCALE - SCALE * e.deltaY / 800)
  let ds      = rescale / SCALE
  OFFSET.x += dx * (1 - ds) / rescale
  OFFSET.y += dy * (1 - ds) / rescale
  SCALE = rescale
  updateDesign()
})

on(main, "mousemove", async e => {
  MOUSE.x = e.clientX - main.offsetLeft
  MOUSE.y = e.clientY - main.offsetTop

  // offset design
  if (SPACEBAR && MOUSE.down) {
    OFFSET.x += e.movementX / SCALE
    OFFSET.y += e.movementY / SCALE
    updateDesign()
  }
})

on(main, "mousedown", async e => {
  MOUSE.down = true
  if (SPACEBAR) {
    e.preventDefault()
    main.classList.add("grabbing")
  }
})

on(main, "mouseup", async e => {
  MOUSE.down = false
  main.classList.remove("grabbing")
})

// if we lose focus, let's cancel ongoing actions & modifiers
on(window, "blur", async e => {
  SPACEBAR = false
  MOUSE.down = false
  main.classList.remove("grab")
  main.classList.remove("grabbing")
})

on(window, "keyup", async e => {
  if (e.key == " ") {
    SPACEBAR = false
    main.classList.remove("grab")
    main.classList.remove("grabbing")
  }
})

on(window, "keydown", async e => {
  if (e.key == " "){
    SPACEBAR = true
    main.classList.add("grab")
  }
})

table.querySelectorAll("td").forEach(cell => {
  on(cell, "mousedown", e => {
    if (SPACEBAR) return
    if (TOOL){
      cell.dataset.stitch = TOOL
      cell.dataset.yarn   = YARN
      cell.style.background = `var(--yarn-color${YARN})`
    }
  })

  on(cell, "mouseover", e => {
    if (SPACEBAR) return
    if (TOOL && MOUSE.down) {
      cell.dataset.stitch = TOOL
      cell.style.background = `var(--yarn-color${YARN})`
    }
  })
})

on([knit, pull, tuck], "click", async e => {
  if (TOOL) window[TOOL].classList.remove("active")
  e.currentTarget.classList.add("active")
  TOOL = e.currentTarget.value
})

// TODO(flupe):
// - state-machine system? (like space -> grab -> grabbing)
