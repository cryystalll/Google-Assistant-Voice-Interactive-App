const DrawObj = require('@/lib/animation/draw/DrawObj')
const Snow = require('./Garbage')
/**
 * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 *
 */
class SnowEffect extends DrawObj {
  constructor (opts = {}) {
    super(opts)
    this.snow = new Array(opts.count || 3)
    this.hRange = opts.hRange
    for (let i = 0; i < this.snow.length; i++) {
      this.snow[i] = new Snow({
        hRange: this.hRange,
        r: 5
        // vx: Math.random() * 30 + 20,
        // vy: Math.random() * 30 - 50
      })
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    for (let i = 0; i < this.snow.length; i++) {
      this.snow[i].setup(opts)
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    for (let i = 0; i < this.snow.length; i++) {
      var ss = this.snow[i]
      ss.update(opts)
      if (ss.y < 0) {
        ss.y = opts.canvas.height + 20
      }
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    for (let i = 0; i < this.snow.length; i++) {
      this.snow[i].draw(opts)
    }
  }
}
module.exports = SnowEffect
