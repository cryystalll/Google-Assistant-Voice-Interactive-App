const ImageView = require('@/lib/animation/draw/ImageView')
const utils = require('@/lib/animation/tools/utils')
/**
 * @typedef {import('@/lib/animation/draw/DrawObj').UpdateOptions} UpdateOptions
 */
/**
 *
 */
class Garbage extends ImageView {
  constructor (opts = {}) {
    opts.height = opts.r || 20
    opts.width = opts.r || 20
    super(opts)
    this.title = opts.title || 'polybag'
    this.r = opts.r || 20
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    super.setup(opts)
    this.canvas = opts.canvas
    this.reset()
    this.op = 0.8
  }

  reset () {
    var canvas = this.canvas
    this.speed = 0.5
    this.x = canvas.width / 2
    this.y = 0
    this.finalx = Math.random() * (canvas.width - this.width)
    this.finaly = canvas.height - (Math.random() * 200) - 100
    this.maxSpeed = 5
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    super.update(opts)
    let d = utils.distance(this.finalx, this.finaly, this.x, this.y)
    let dx = this.finalx - this.x
    let dy = this.finaly - this.y
    if (d > 1) {
      this.maxSpeed -= 7 * opts.rate
      if (this.maxSpeed < 0.5) {
        this.maxSpeed = 0.5
      }
      let move = Math.min(d, this.maxSpeed)
      let mx = move * dx / d
      let my = move * dy / d
      let stepX = mx
      let stepY = my
      this.x += stepX
      this.y += stepY
    } else {
      this.x = this.finalx
      this.y = this.finaly
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    super.draw(opts)
    if (this.title) {
      ctx.font = '1rem Roboto Mono'
      let twidth = ctx.measureText(this.title).width
      ctx.fillText(this.title, this.x + this.width / 2 - twidth / 2, this.y + 50)
    }
  }
}
module.exports = Garbage
