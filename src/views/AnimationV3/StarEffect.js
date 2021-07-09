const DrawObj = require('@/lib/animation/draw/DrawObj')
const Bubble = require('./Star')
/**
 * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 *
 */
class StarEffect extends DrawObj {
  constructor (opts = {}) {
    super(opts)
    this.bubbles = new Array(opts.count || 200)
    this.hRange = opts.hRange
    for (let i = 0; i < this.bubbles.length; i++) {
      this.bubbles[i] = new Bubble({
        hRange: this.hRange,
        r: 20,
        vx: Math.random() * 30 + 20,
        vy: Math.random() * 30 + 50
      })
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    for (let i = 0; i < this.bubbles.length; i++) {
      this.bubbles[i].setup(opts)
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    for (let i = 0; i < this.bubbles.length; i++) {
      var bb = this.bubbles[i]
      bb.update(opts)
      if (bb.y < 0) {
        bb.y = opts.canvas.height + 20
      }
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    for (let i = 0; i < this.bubbles.length; i++) {
      this.bubbles[i].draw(opts)
    }
  }
}
module.exports = StarEffect
