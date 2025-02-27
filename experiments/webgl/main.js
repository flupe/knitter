import * as vec2 from "./glm/vec2.js"
import * as vec3 from "./glm/vec3.js"
import * as mat4 from "./glm/mat4.js"

const on   = (t, e, f) => t.addEventListener(e, f)
const lerp = (a, b, x) => a + (b - a) * x

const gl = cvs.getContext("webgl2")

const shader = type => (strings, ...values) => {
  const raw = String.raw({ raw: strings }, ...values)
  const shader = gl.createShader(type)

  gl.shaderSource(shader, raw)
  gl.compileShader(shader)

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    return shader

  console.error(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

const vert = shader(gl.VERTEX_SHADER)
const frag = shader(gl.FRAGMENT_SHADER)

function createProgram(vs, fs) {
  const prog = gl.createProgram()

  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)

  if (gl.getProgramParameter(prog, gl.LINK_STATUS))
    return prog

  console.error(gl.getProgramInfoLog(prog))
  gl.deleteProgram(prog)
}

const vertex = vert`
attribute vec4 position;

void main() {
  gl_Position = position;
}
`

const fragment = frag`
precision mediump float;

void main() {
  gl_FragColor = vec4(1, 0, 0.5, 1);
}
`

const prog = createProgram(vertex, fragment)
const ploc = gl.getAttribLocation(prog, "position")
const pbuf = gl.createBuffer()

gl.bindBuffer(gl.ARRAY_BUFFER, pbuf)

const points = [
  vec2.fromValues(-1.0, -1.0),
  vec2.fromValues( 1.0, -1.0),
  vec2.fromValues(-1.0,  1.0),
  vec2.fromValues( 1.0,  1.0),
]

function bezier(t) {
  let stage = points

  while (stage.length > 1) {
    let sub = []

    for (let i = 1; i < stage.length; i++) {
      let x = stage[i - 1]
      let y = stage[i]
      sub.push(vec2.lerp(vec2.create(), x, y, t))
    }

    stage = sub
  }

  return stage[0]
}

const positions = []
const POINTS    = 40

for (let i = 0; i < POINTS; i++) {
  let point = bezier(i / (POINTS - 1))
  positions.push(...point)
}

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

gl.useProgram(prog)

gl.enableVertexAttribArray(ploc)
gl.vertexAttribPointer(ploc, 2, gl.FLOAT, false, 0, 0)

//

const projection = mat4.create()
const view       = mat4.create()
const UP         = vec3.fromValues(0.0, 1.0, 0.0)
const origin     = vec3.create()
const camera     = vec3.fromValues(0.0, 0.0, 1.0)


// 

function draw() {
  resize()

  mat4.perspective(projection, 70 * Math.PI / 180, gl.canvas.width / gl.canvas.height, 0.01, 100)

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.LINE_STRIP, 0, POINTS)
}

function resize() {
  cvs.width  = cvs.offsetWidth
  cvs.height = cvs.offsetHeight
}

draw()
on(window, "resize", draw)
