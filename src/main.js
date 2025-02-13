import {on, $, stitchTable, HexToRGB} from "./prelude.js"
import {pickColor} from "./picker.js"
import {Design} from "./design.js"

// initial design size
const WIDTH  = 32
const HEIGHT = 32

// global vars
const MOUSE = {x: 0, y: 0, down: false}
let TOOL = 0
let SPACEBAR = false
let YARN = 0 // active yarn id

// viewport params

const design = (function(){
  let restored = Design.restore()
  return restored ? restored :  new Design({width: WIDTH, height: HEIGHT})
})()

main.appendChild(design.elem)

// initialize yarns
const yarns = (function(colors) {
  const yarns = []
  colors.forEach((col, i) => {
    const yarn = {
      color: col,
      swatch: $('button'),
    }

    document.body.style.setProperty(`--yarn-color${i}`, HexToRGB(col))
    yarn.swatch.classList.toggle("active", i == 0)
    yarn.swatch.style.background = `var(--yarn-color${i})`
    yarn_swatch.appendChild(yarn.swatch)

    on(yarn.swatch, "click", async () => {
      yarns[YARN].swatch.classList.remove("active")
      yarn.swatch.classList.add("active")
      YARN = i
    })

    on(yarn.swatch, "dblclick", async () => {
      pickColor(yarn.swatch, yarn.color,  col => {
        yarn.color = col
        document.body.style.setProperty(`--yarn-color${i}`, HexToRGB(col))
      })
    })

    yarns.push(yarn)
  })

  return yarns
})([0xf0c432, 0x68942f, 0x782354])


on(main, "wheel", async e => {
  e.preventDefault()

  let dx      = MOUSE.x - main.offsetWidth  / 2
  let dy      = MOUSE.y - main.offsetHeight / 2

  let ratio = design.scale(1 -  e.deltaY / 800)

  design.translate(
    dx * (1 - ratio) / design._scale,
    dy * (1 - ratio) / design._scale
  )
})

on(main, "mousemove", async e => {
  MOUSE.x = e.clientX - main.offsetLeft
  MOUSE.y = e.clientY - main.offsetTop

  // offset design
  if (SPACEBAR && MOUSE.down) {
    design.translate(
      e.movementX / design._scale,
      e.movementY / design._scale,
    )
  }
})

on(main, "mousedown", async e => {
  MOUSE.down = true
  if (SPACEBAR) {
    e.preventDefault()
    main.classList.add("grabbing")
  }
})

on(main, "mouseup", async () => {
  MOUSE.down = false
  main.classList.remove("grabbing")
})

// if we lose focus, let's cancel ongoing actions & modifiers
on(window, "blur", async () => {
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

design.elem.querySelectorAll("td").forEach(cell => {
  on(cell, "mousedown", () => {
    if (SPACEBAR) return
    let i = parseInt(cell.dataset.index)
    design.draw(i, TOOL, YARN)
    // cell.dataset.stitch = TOOL
    // cell.dataset.yarn   = YARN
    // cell.style.background = `var(--yarn-color${YARN})`
  })

  on(cell, "mouseover", () => {
    if (SPACEBAR) return
    if (MOUSE.down) {
      let i = parseInt(cell.dataset.index)
      design.draw(i, TOOL, YARN)
      // cell.dataset.stitch = TOOL
      // cell.style.background = `var(--yarn-color${YARN})`
    }
  })
})

knit.classList.add("active")
on([knit, pull, tuck, miss, roc, loc], "click", async e => {
  window[stitchTable[TOOL]].classList.remove("active")
  e.currentTarget.classList.add("active")
  TOOL = parseInt(e.currentTarget.value)
})
