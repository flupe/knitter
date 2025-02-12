// event listener util
// targets and events may be arrays
export const on = (t, e, f) =>
  Array.isArray(t)
    ? t.forEach(t => on(t, e, f))
    : Array.isArray(e)
        ? e.forEach(e => on(t, e, f))
        : t.addEventListener(e, f)

export const clamp = (a, b, x) => x < a ? a : x > b ? b : x
export const lerp  = (a, b, x) => a + x * (b - a)

// return a copy of a function bound to its parent object
export const bind = (o, f) => o[f].bind(o)

// shorthand for creating HTML elements
export const $ = bind(document, "createElement")

export const stitchTable =
  [ "knit"
  , "pull"
  , "tuck"
  , "miss"
  , "roc"
  , "loc"
  ]

export function debounce(delay, fn) {
  let timeout = null
  function cb() {
    timeout = null
    fn()
  }
  return function() {
    if (timeout !== null) clearTimeout(timeout)
    timeout = setTimeout(cb, delay)
  }
}

// 0 ≤ h ≤ 360
// 0 ≤ s ≤ 1
// 0 ≤ l ≤ 1
export function HSLToRGB(h, s, l) {
  h = h / 60
  let c = s * (1 - Math.abs(2 * l - 1))
  let x = c * (1 - Math.abs(h % 2 - 1))
  let m = l - c / 2

  c += m
  x += m
  h = h % 6 | 0

  const r = [c, x, m, m, x, c][h] * 255 | 0
  const g = [x, c, c, x, m, m][h] * 255 | 0
  const b = [m, m, x, c, c, x][h] * 255 | 0

  return `rgb(${r}, ${g}, ${b})`
}
