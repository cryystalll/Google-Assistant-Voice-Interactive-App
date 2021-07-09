const DrawObj = require('./DrawObj')
/**
 * @typedef {import('./CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 * 加入 CanvasManager 用的物件
 */
class CustomMouse extends DrawObj {
  constructor (opts = {}) {
    super(opts)
    this.color = 'white'
    this.r = 10
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {}

  /**
   * @param {UpdateOptions} opts
   */
  update ({ state }) {
    this.x = state.mouseX
    this.y = state.mouseY
    this._hide = !state.mouseenter
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    ctx.fill()
  }
}
module.exports = CustomMouse
