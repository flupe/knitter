export class ColorPicker extends HTMLElement {
  constructor() {
    super()
    const root = this.attachShadow({ mode: "open" })
    root.appendChild(picker_template.content.cloneNode(true))

    this.cvs = root.querySelector("canvas")
    this.ctx = this.cvs.getContext("2d")

    this.size = this.cvs.offsetWidth * window.devicePixelRatio
    this.cvs.height = this.cvs.width  = this.size

    this.ctx.fillStyle = "#fff"
    this.ctx.fillRect(0, 0, this.size, this.size)
  }
}

window.customElements.define('color-picker', ColorPicker)
