const DrawObj = require('./DrawObj')
/**
 * @typedef {import('./DrawObj').UpdateOptions} UpdateOptions
 */
/**
 * 作為參考點用
 */
class Point extends DrawObj {
  constructor (opts) {
    // eslint-disable-next-line eqeqeq
    opts._hide = opts._hide == null ? true : opts._hide
    opts.width = 0
    opts.height = 0
    super(opts)
    this.r = opts.r || 3
    this.style = opts.style || 'red'
  }

  setup (opts) {
    this.emit('setup', opts)
  }

  update (opts) {
    this.emit('update', opts)
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    ctx.fill()
  }
}
module.exports = Point
