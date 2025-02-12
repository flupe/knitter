import {$, stitchTable, debounce} from "./prelude.js"

const MIN_SCALE = 0.5
const AUTOSAVE  = 500 // autosave delay, in ms

export class Design {
  constructor(data) {
    const width  = this.width   = data.width
    const height = this.height  = data.height
    this._scale  = 1.0
    this.offset  = {x: 0.0, y: 0.0}
    this.elem    = null

    if (data.stitchGrid && data.yarnGrid) {
      this.stitchGrid = data.stitchGrid
      this.yarnGrid   = data.yarnGrid

      console.log(data.stitchGrid)
    }
    else {
      this.stitchGrid = new Uint8Array(width * height)
      this.yarnGrid   = new Uint8Array(width * height)
    }

    this.initDOM()

    // debounce save function
    this.save = debounce(AUTOSAVE, this.save.bind(this))
  }

  translate(dx, dy) {
    this.offset.x += dx
    this.offset.y += dy

    let ox = this.offset.x * this._scale | 0
    let oy = this.offset.y * this._scale | 0

    this.elem.style.translate = `${ox}px ${oy}px`
  }

  draw(i, stitch = "knit", yarn = 0) {
    this.stitchGrid[i] = stitchTable[stitch]
    this.yarnGrid[i]   = yarn

    let cell = this.cells[i]

    // update dom
    cell.dataset.stitch = stitch
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
    cell.dataset.stitch = "knit"

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
      stitchGrid: Array.from(this.stitchGrid),
      yarnGrid:   Array.from(this.yarnGrid),
    }

    localStorage.setItem("design", JSON.stringify(data))
  }

  // attempt restoring design from local storage
  static restore() {
    try {
      let {width, height, stitchGrid, yarnGrid} = JSON.parse(localStorage.getItem("design"))
      let size = width * height

      if (stitchGrid.length != size || yarnGrid.length != size) {
        throw "Inconsitent grid size!"
      }
      return new Design({
        width,
        height,
        stitchGrid: new Uint8Array(stitchGrid),
        yarnGrid:   new Uint8Array(yarnGrid),
      })
    }
    catch {
      console.log("Could not load design from local storage.")
      return null
    }
  }
}
