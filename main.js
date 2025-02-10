// initial design size
const WIDTH  = 32
const HEIGHT = 16

// global vars
const MOUSE = {x: 0, y: 0, down: false}
let TOOL = null
let SPACEBAR = false

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


function createDesign() {
  // table.design > div (row) > span (cell)
  const container = $("table")
  const body      = $("tbody")

  container.classList.add("design")
  container.appendChild(body)

  const row    = $("tr")
  const cell   = $("td")
  const stitch = $("div")

  stitch.classList.add("stitch")
  cell.appendChild(stitch)

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

// reapply CSS transform
function updateDesign() {
  table.style.scale = SCALE
  table.style.translate = `${OFFSET.x * SCALE | 0}px ${OFFSET.y * SCALE | 0}px`
}


on(main, "wheel", async e => {
  // scroll magic
  e.preventDefault()
  let width  = table.offsetWidth
  let height = table.offsetHeight

  let dx    = MOUSE.x - width  / 2
  let dy    = MOUSE.y - height / 2
  let ratio = SCALE * e.deltaY / 800
  SCALE = Math.max(1, SCALE - SCALE * e.deltaY / 800)
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

table.querySelectorAll("td div").forEach(cell => {
  on(cell, "mousedown", e => {
    if (SPACEBAR) return
    if (TOOL) cell.classList.add(TOOL)
  })

  on(cell, "mouseover", e => {
    if (SPACEBAR) return
    if (TOOL && MOUSE.down) cell.classList.add(TOOL)
  })
})

on([knit, pull, tuck], "click", async e => {
  if (TOOL) window[TOOL].classList.remove("active")
  e.currentTarget.classList.add("active")
  TOOL = e.currentTarget.value
})

// TODO(flupe):
// - state-machine system? (like space -> grab -> grabbing)
