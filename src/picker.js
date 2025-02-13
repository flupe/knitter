import {on, clamp, lerp, HSLToHex, HexToRGB, HexToHSL} from "./prelude.js"

let down       = false
let SETTER     = null
let RESOLVER   = null
let saturation = 0
let lightness  = 0

picker.tabIndex = -1

on(picker_hue, "input", () => {
  picker_square.style.color = HexToRGB(HSLToHex(picker_hue.value, 1, 0.5))
  update()
})

on(picker_square, "mousedown", e => {
  down = true
  moveMarker(e.clientX, e.clientY)
})

on(window, "mouseup", () => down = false)

function update() {
  if (SETTER) {
    SETTER(HSLToHex(
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
  if (RESOLVER) RESOLVER()
})

export function pickColor(target, col = 0x000000, setter) {
  let [h, s, l] = HexToHSL(col)

  picker_hue.value = h
  saturation = s
  lightness  = l
  picker_square.style.color = HexToRGB(HSLToHex(h, 1.0, 0.5))
  let rect = picker_square.getBoundingClientRect()
  picker_marker.style.left = `${s * rect.width | 0}px`
  let v = 2 * l / (2 - s)
  picker_marker.style.top  = `${rect.height * (1 - v) | 0}px`
  

  SETTER = setter
  picker.style.visibility = "visible"
  picker.focus()
  picker.style.left = `${target.offsetLeft}px`
  picker.style.top  = `${target.offsetTop + target.offsetHeight}px`

  return new Promise(resolve => RESOLVER = resolve)
}
