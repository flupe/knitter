// event listener util
// targets and events may be arrays
export const on = (t, e, f) =>
  Array.isArray(t)
    ? t.forEach(t => on(t, e, f))
    : Array.isArray(e)
        ? e.forEach(e => on(t, e, f))
        : t.addEventListener(e, f)

export const clamp = (a, b, x) => x < a ? a : x > b ? b : x

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

export const debounce = (delay, fn) => {
  let timeout = null
  let cb = () => {
    timeout = null
    fn()
  }
  return function() {
    if (timeout !== null) clearTimeout(timeout)
    timeout = setTimeout(cb, delay)
  }
}
