import {$, stitchTable, debounce} from "./prelude.js"
import Yarn from "./yarn.js"

const MIN_SCALE = 0.5
const AUTOSAVE  = 500 // autosave delay, in ms

export class Design {
  constructor(data) {
    const width  = this.width   = data.width
    const height = this.height  = data.height
    this._scale  = 1.0
    this.offset  = {x: 0.0, y: 0.0}
    this.elem    = null
    this._dirty  = false

    this.currentYarn = 0

    if (data.stitchGrid && data.yarnGrid) {
      this.stitchGrid = data.stitchGrid
      this.yarnGrid   = data.yarnGrid
    }
    else {
      this.stitchGrid = new Uint8Array(width * height)
      this.yarnGrid   = new Uint8Array(width * height)
    }

    this.yarns = Array.isArray(data.yarns) ? data.yarns : []
    this.initDOM()

    // debounce save function
    this.save = debounce(AUTOSAVE, this.save.bind(this))

    // ensure there is at least one yarn available
    if (this.yarns.length == 0) this.addYarn()
    this.selectYarn(0)
  }

  addYarn() { this.yarns.push(new Yarn(this.yarns.length)) }
  selectYarn(id) {
    if (id != this.currentYarn)
      this.yarns[this.currentYarn].selected = false
    this.yarns[id].selected = true
    this.currentYarn = id
  }

  translate(dx, dy) {
    this.offset.x += dx
    this.offset.y += dy

    let ox = this.offset.x * this._scale | 0
    let oy = this.offset.y * this._scale | 0

    this.elem.style.translate = `${ox}px ${oy}px`
  }

  draw(i, stitch = 0) {
    let yarn = this.currentYarn
    this.stitchGrid[i] = stitch
    this.yarnGrid[i]   = yarn

    let cell = this.cells[i]

    // update dom
    cell.dataset.stitch   = stitchTable[stitch]
    cell.style.background = `var(--yarn-color${yarn})`

    // save
    this.save()
  }

  // scale the viewport by some value
  // return the effective scaling ratio
  scale(s) {
    let newScale = Math.max(0.5, this._scale * s)
    let r = newScale / this._scale
    this._scale = newScale
    this.elem.style.scale = this._scale
    return r
  }

  initDOM() {
    if (this.elem) return

    // table.design > tr (row) > td (cell) > div
    const container = this.elem = $("table")
    const body = $("tbody")

    container.classList.add("design")
    container.appendChild(body)

    const row    = $("tr")
    const cell   = $("td")
    const stitch = $("div")

    stitch.classList.add("stitch")
    cell.appendChild(stitch)

    // create cells for a single row
    for (let i = 0; i < this.width; i++)
      row.appendChild(cell.cloneNode(true))

    // insert rows in container
    for (let j = 0; j < this.height; j++)
      body.appendChild(row.cloneNode(true))

    this.cells = Array.from(container.querySelectorAll("td"))

    this.cells.forEach((cell, i) => {
      cell.dataset.stitch   = stitchTable[this.stitchGrid[i]]
      cell.dataset.index    = i
      cell.style.background = `var(--yarn-color${this.yarnGrid[i]})`
    })
  }

  // compute index from 2d coordinates
  index(x, y) { return y * this.width + x }

  // save current design to local storage
  save() {
    let data = {
      width:      this.width,
      height:     this.height,
      yarns:      this.yarns,
      stitchGrid: Array.from(this.stitchGrid),
      yarnGrid:   Array.from(this.yarnGrid),
    }

    localStorage.setItem("design", JSON.stringify(data))
  }

  // attempt restoring design from local storage
  static restore() {
    try {
      let {width, height, stitchGrid, yarnGrid, yarns} = JSON.parse(localStorage.getItem("design"))
      let size = width * height

      if (!Array.isArray(yarns)) throw "Expected array for `yarns` field."

      yarns = yarns.map(Yarn.fromJSON)

      if (stitchGrid.length != size || yarnGrid.length != size) {
        throw "Inconsitent grid size!"
      }

      return new Design({
        width,
        height,
        yarns,
        stitchGrid: new Uint8Array(stitchGrid),
        yarnGrid:   new Uint8Array(yarnGrid),
      })
    }
    catch(e) {
      console.warn(`Could not load design from local storage: ${e}`)
      return null
    }
  }
}
