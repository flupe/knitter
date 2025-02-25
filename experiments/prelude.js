export const on = (t, e, f) => t.addEventListener(e, f)

export const lerp = (a, b, x) => a + (b - a) * x

// uses the browser confirm window for now
// but we may want our own dialog system later on
export function confirm(msg) {
  return new Promise
    (resolve => resolve(window.confirm(msg)))
}
