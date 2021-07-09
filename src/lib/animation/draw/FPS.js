const DrawObj = require('./DrawObj')
/**
 * @typedef {import('./DrawObj').UpdateOptions} UpdateOptions
 */
/**
 * @implements {DrawObj}
 */
class FPS extends DrawObj {
  constructor (opts = {}) {
    super(opts)
    this.style = '#000000'
    this.font = '40px Arial'
    this.counter = 0
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    var canvas = opts.canvas
    var ctx = opts.ctx
    ctx.save()
    ctx.fillStyle = this.style
    ctx.font = this.font
    var r = ctx.measureText('666')
    this.h = r.actualBoundingBoxAscent - r.actualBoundingBoxDescent
    this.w = r.width
    this.x = canvas.width - this.w - 20
    ctx.restore()
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    this.y = this.h + 20
    this.x = opts.canvas.width - this.w - 20
    this.counter = opts.manager.fps
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    ctx.save()
    ctx.fillStyle = this.style
    ctx.font = this.font
    ctx.fillText(this.counter + '', this.x, this.y)
    ctx.restore()
  }
}
module.exports = FPS
