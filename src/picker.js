import {on, clamp, lerp, HSLToRGB} from "./prelude.js"

let down       = false
let SETTER     = null
let saturation = 0
let lightness  = 0

// init --------------
picker.tabIndex = -1
  // picker can be focused
picker_square.style.color = HSLToRGB(picker_hue.value, 1, 0.5)
  // set square color to current hue

// whenever the hue is changed, update the square
on(picker_hue, "input", () => {
  picker_square.style.color = HSLToRGB(picker_hue.value, 1, 0.5)
  update()
})

on(picker_square, "mousedown", e => {
  down = true
  moveMarker(e.clientX, e.clientY)
})

on(window, "mouseup", () => down = false)

function update() {
  if (SETTER) {
    SETTER(HSLToRGB(
      picker_hue.value,
      saturation,
      lightness,
    ))
  }
}

function moveMarker(mx, my){
  let rect = picker_square.getBoundingClientRect()

  let x = clamp(0, rect.width,  mx - rect.x)
  let y = clamp(0, rect.height, my - rect.y)

  let dx = x       / rect.width
  let dy = 1.0 - y / rect.height
  saturation = x / rect.width
  lightness  = lerp(lerp(0, 1.0, dy), lerp(0, 0.5, dy), dx)

  picker_marker.style.left = `${x}px`
  picker_marker.style.top  = `${y}px`

  update()
}

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
