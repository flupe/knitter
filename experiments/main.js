import {on, confirm, lerp} from "./prelude.js"
const raf = window.requestAnimationFrame

const cvs = document.createElement("canvas")
const ctx = cvs.getContext('2d')
const BEZCOUNT = 10

const RATIO = devicePixelRatio
const SCALE = 4
let width = 0
let height = 0

document.body.appendChild(cvs)

function resize() {
  width  = window.innerWidth
  height = window.innerHeight

  cvs.width  = width  * RATIO
  cvs.height = height * RATIO
}

class Op {
  constructor() {
    this.length = 0
  }
  get cmd() { return "" }

  // given the input position
  // must return the position at the end of the operation
  // should recompute the "length" of the op
  update(pos) {}
  draw(pos, ctx, l) {}
}

class Move extends Op {
  constructor(x, y) {
    super()
    this.x = x
    this.y = y
    this.length = 0
  }

  update(pos) {
    pos.x = this.x
    pos.y = this.y
  }

  draw(pos, ctx, l) {
    ctx.moveTo(this.x, this.y)
    pos.x = this.x
    pos.y = this.y
  }

  get cmd() { return `M ${this.x} ${this.y}` }
}

class Line extends Op {
  constructor(x, y) {
    super()
    this.x = x
    this.y = y
  }

  update(pos) {
    let dx = this.x - pos.x
    let dy = this.y - pos.y

    this.length = Math.sqrt(dx * dx + dy * dy)

    pos.x = this.x
    pos.y = this.y
  }

  draw(pos, ctx, l) {
    let r = Math.min(l, this.length) / this.length
    let dx = this.x - pos.x
    let dy = this.y - pos.y
    pos.x += r * dx
    pos.y += r * dy
    ctx.lineTo(pos.x, pos.y)
  }

  get cmd() { return `L ${this.x} ${this.y}` }
}

class Curve extends Op {
  constructor(x1, y1, x2, y2, x, y) {
    super()
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.x  = x
    this.y  = y

    this.offsets = []
  }

  compute(pos, s) {
    let xx1 = lerp(pos.x,   this.x1, s)
    let yy1 = lerp(pos.y,   this.y1, s)

    let xx2 = lerp(this.x1, this.x2, s)
    let yy2 = lerp(this.y1, this.y2, s)

    let xx3 = lerp(this.x2, this.x, s)
    let yy3 = lerp(this.y2, this.y, s)

    let xxx1 = lerp(xx1, xx2, s)
    let yyy1 = lerp(yy1, yy2, s)

    let xxx2 = lerp(xx2, xx3, s)
    let yyy2 = lerp(yy2, yy3, s)

    return [ lerp(xxx1, xxx2, s)
           , lerp(yyy1, yyy2, s)
           ]
  }

  update(pos) {

    const offsets = new Array(BEZCOUNT + 1)

    let lastx = pos.x
    let lasty = pos.y
    let len  = 0

    for (let i = 0; i <= BEZCOUNT; i++) {
      let [cx, cy] = this.compute(pos, i / BEZCOUNT)
      let dx = cx - lastx
      let dy = cy - lasty
      lastx = cx
      lasty = cy
      len += Math.sqrt(dx * dx + dy * dy)
      offsets[i] = len
    }

    this.length = len
    this.offsets = offsets

    pos.x = this.x
    pos.y = this.y
  }

  draw(pos, ctx, l) {
    if (l > this.length) {
      ctx.bezierCurveTo(this.x1, this.y1, this.x2, this.y2, this.x, this.y)
      pos.x = this.x
      pos.y = this.y
      return
    }

    // step 1: figure out arc-length parametrization

    let i = this.offsets.findIndex(p => p >= l)
    let d = (l - this.offsets[i - 1])
              / (this.offsets[i] - this.offsets[i - 1])
    let s = lerp(i - 1, i, d) / BEZCOUNT

    // let s = Math.min(l, this.length) / this.length

    let xx1 = lerp(pos.x,   this.x1, s)
    let yy1 = lerp(pos.y,   this.y1, s)

    let xx2 = lerp(this.x1, this.x2, s)
    let yy2 = lerp(this.y1, this.y2, s)

    let xx3 = lerp(this.x2, this.x, s)
    let yy3 = lerp(this.y2, this.y, s)

    let xxx1 = lerp(xx1, xx2, s)
    let yyy1 = lerp(yy1, yy2, s)

    let xxx2 = lerp(xx2, xx3, s)
    let yyy2 = lerp(yy2, yy3, s)

    let xxxx = lerp(xxx1, xxx2, s)
    let yyyy = lerp(yyy1, yyy2, s)

    ctx.bezierCurveTo(xx1, yy1, xxx1, yyy1, xxxx, yyyy)

    pos.x = xxxx
    pos.y = yyyy
  }

  get cmd() {
    return `C ${this.x1} ${this.y1}, ${this.x2} ${this.y2}, ${this.x} ${this.y}`
  }
}

const ops = [
  new Move(20, 0),
  new Line(20, 20),
  new Line(-20, 20),
  new Curve(-50, 20, -50, -20, -20, -20),
  new Line(0, -20),
  new Curve(20, -20, 20, -40, 50, -40),
  new Curve(80, -40, -50, 40, 80, 60)
]

let len = 0
let pos = {x: 0, y: 0}
ops.forEach(op => {
  op.update(pos)
  len += op.length
})

function draw() {
  raf(draw)
  ctx.clearRect(0, 0, cvs.width, cvs.height)
  ctx.save()

  let ratio = Math.abs((performance.now() / 2000 % 2) - 1)
  ctx.scale(RATIO, RATIO)

  ctx.translate(width / 2, height / 2)
  ctx.scale(SCALE, -SCALE)

  let dist = ratio * len
  let pos = {x: 0, y: 0}

  ctx.lineWidth = 4
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.beginPath()

  for (const op of ops) {
    op.draw(pos, ctx, dist)
    dist -= op.length
    if (dist < 0) break
  }

  ctx.stroke()
  ctx.restore()
}

resize()

on(window, "resize", () => {
  resize()
  draw()
})

raf(draw)
