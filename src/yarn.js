import {on, $, HexToRGB} from "./prelude.js"
import {pickColor} from "./picker.js"

export const yarnColorVar = id => `--yarn-color${id}`

export default class Yarn {
  constructor(id, color = 0xc2ac74) {
    this.id     = id
    this.color  = color

    this.swatch = $("button")
    this.swatch.style.background = this.CSSVar()

    on(this.swatch, "click", () => design.selectYarn(this.id))

    // TODO: save yarn when picker gets closed
    on(this.swatch, "dblclick", async () => {
      await pickColor(this.swatch, this.color, color => this.color = color)
      design.save()
    })

    yarn_swatch.insertBefore(this.swatch, yarn_add)
  }

  set selected(b) { this.swatch.classList.toggle("active", b) }

  CSSVar() { return `var(${yarnColorVar(this.id)})` }

  get color() { return this._color }
  set color(col) {
    this._color = col
    document.body.style.setProperty(yarnColorVar(this.id), HexToRGB(col))
  }

  toJSON() { return { color: this.color, id: this.id } }
  static fromJSON({color, id}) {
    if (typeof id !== "number" || typeof color !== "number")
      throw "Wrongly-typed yarn fields."

    return new Yarn(id, color)
  }
}
