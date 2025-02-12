import {on, clamp} from "./prelude.js"

function hslToCol(h, s, l) {
  let c = s * (1 - Math.abs(2 * l - 1))
  let hueO60 = h / 60
  let x = c * (1 - Math.abs(hueO60 % 2 - 1))
  let m = l - c / 2

  c += m
  x += m

  const index = Math.floor(hueO60) % 6;
  const red   = [c, x, m, m, x, c][index] * 255 | 0
  const green = [x, c, c, x, m, m][index] * 255 | 0
  const blue  = [m, m, x, c, c, x][index] * 255 | 0

  return `rgb(${red}, ${green}, ${blue})`
}

let down = false
let SETTER = null


on(picker_hue, "input", () =>
  picker_square.style.color = hslToCol(picker_hue.value, 1, 0.5)
)

on(picker_square, "mousedown", e => {
  down = true
  moveMarker(e.clientX, e.clientY)
})

on(window, "mouseup", () => down = false)

function moveMarker(mx, my){
  let rect = picker_square.getBoundingClientRect()

  let x = clamp(0, rect.width,  mx - rect.x)
  let y = clamp(0, rect.height, my - rect.y)

  picker_marker.style.left = `${x}px`
  picker_marker.style.top  = `${y}px`

  if (SETTER) {
    SETTER(hslToCol(picker_hue.value, x / rect.width, (x + y) / (rect.width + rect.height)))
  }
}

picker.tabIndex = -1

on(picker_square, "mousemove", e => {
  if (!down) return
  e.preventDefault()
  moveMarker(e.clientX, e.clientY)
})

on(picker, "focusout", ({relatedTarget}) => {
  if (picker.contains(relatedTarget)) return
  picker.style.visibility = "hidden"
})

export function pickColor(target, setter) {
  SETTER = setter
  picker.style.visibility = "visible"
  picker.focus()
  picker.style.left = `${target.offsetLeft}px`
  picker.style.top  = `${target.offsetTop + target.offsetHeight}px`
}
