const DrawObj = require('./DrawObj')
/**
 * @typedef {Object} TextOptions
 * @property {string} font
 * @property {string} text
 * @property {string} style
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */
/**
 * @typedef {import('./DrawObj').UpdateOptions} UpdateOptions
 */

class Text extends DrawObj {
  /**
   *
   * @param {TextOptions} opts
   */
  constructor (opts = {}) {
    super(opts)
    this.setText(opts.text)
    this.setRef(opts.ref)
    /**
     * 文字的高度
     */
    this.theight = 0
    /**
     * 文字的寬度
     */
    this.twidth = 0
    this.font = opts.font
    this.style = opts.style || 'black'
    this.padding = opts.padding != null ? opts.padding : 8
    this.state = 'normal'
  }

  fadeOut () {
    this.state = 'fadeout'
  }

  /**
   *
   * @param {string} text
   */
  setText (text) {
    this.text = text
    this.measure()
  }

  /**
   *
   * @param {string} font
   */
  setFont (font) {
    this.font = font
    this.measure()
  }

  setRef (ref, opts) {
    this.ref = ref
    console.log('ref', ref)
    this.updateRef()
  }

  updateRef () {
    if (this.ref) {
      this.baseX = this.ref.x
      this.baseY = this.ref.y
    } else {
      this.baseX = 0
      this.baseY = 0
    }
  }

  measure (ctx = this.ctx) {
    if (ctx) {
      ctx.save()
      ctx.font = this.font
      let metrics = ctx.measureText(this.text)
      this.twidth = metrics.width
      this.theight = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent
      this.width = this.twidth + this.padding * 2
      this.height = this.theight + this.padding * 2
      ctx.restore()
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    var { ctx, canvas } = opts
    this.canvas = canvas
    this.ctx = ctx
    this.measure()
    this.update(opts)
    super.setup(opts)
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    super.update(opts)
    var ctx = opts.ctx
    ctx.fillStyle = this.style
    this.updateRef(this.ref)
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    super.draw(opts)
    var ctx = opts.ctx
    var p = this.padding
    ctx.globalAlpha = this.alpha
    ctx.save()
    ctx.translate(this.x + this.baseX, this.y + this.baseY)
    ctx.font = this.font
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'start'
    ctx.fillText(this.text, p, this.theight / 2 + p)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, this.height)
    ctx.lineTo(this.width, this.height)
    ctx.lineTo(this.width, 0)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
    ctx.globalAlpha = 1
  }
}

module.exports = Text
