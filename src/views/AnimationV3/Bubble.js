const DrawObj = require('@/lib/animation/draw/DrawObj')
/**
 * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 *
 */
class Bubble extends DrawObj {
  constructor (opts = {}) {
    super(opts)
    this.vx = opts.vx || 50
    this.vy = opts.vy || -50
    this.r = opts.r == null ? 5 : opts.r
    this.color = opts.color || 'grey'
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    if (!this.hRange) {
      this.hRange = opts.canvas.height
    }
    this.x = opts.canvas.width * Math.random()
    this.y = opts.canvas.height + this.hRange * Math.random()

    this.type = Math.floor(Math.random() * 2)
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    var { ctx, rate } = opts
    this.x += this.vx * rate
    this.y += this.vy * rate
    var x = this.x
    var y = this.y
    var r = this.r
    if (Math.random() < 0.005) {
      this.vx *= -1
    }
    this.gard = ctx.createRadialGradient(x, y, 1, x, y, r)
    var gard = this.gard
    if (this.type === 1) {
      gard.addColorStop(0, 'aliceblue')
      gard.addColorStop(0.3, 'aliceblue')
      gard.addColorStop(0.95, 'steelblue')
    } else {
      gard.addColorStop(0, 'aliceblue')
      gard.addColorStop(0.3, 'aliceblue')
      gard.addColorStop(0.95, 'powderblue')
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var { ctx, canvas } = opts
    var x = this.x
    var y = this.y
    var r = this.r
    ctx.globalAlpha = 0.5
    ctx.beginPath()

    ctx.lineTo(Math.cos((18 + 0 * 72) / 180 * Math.PI) * 2 * r + x, -Math.sin((18 + 0 * 72) / 180 * Math.PI) * 2 * r + y)
    ctx.lineTo(Math.cos((54 + 0 * 72) / 180 * Math.PI) * r + x, -Math.sin((54 + 0 * 72) / 180 * Math.PI) * r + y)
    ctx.lineTo(Math.cos((18 + 1 * 72) / 180 * Math.PI) * 2 * r + x, -Math.sin((18 + 1 * 72) / 180 * Math.PI) * 2 * r + y)
    ctx.lineTo(Math.cos((54 + 1 * 72) / 180 * Math.PI) * r + x, -Math.sin((54 + 1 * 72) / 180 * Math.PI) * r + y)
    ctx.lineTo(Math.cos((18 + 2 * 72) / 180 * Math.PI) * 2 * r + x, -Math.sin((18 + 2 * 72) / 180 * Math.PI) * 2 * r + y)
    ctx.lineTo(Math.cos((54 + 2 * 72) / 180 * Math.PI) * r + x, -Math.sin((54 + 2 * 72) / 180 * Math.PI) * r + y)
    ctx.lineTo(Math.cos((18 + 3 * 72) / 180 * Math.PI) * 2 * r + x, -Math.sin((18 + 3 * 72) / 180 * Math.PI) * 2 * r + y)
    ctx.lineTo(Math.cos((54 + 3 * 72) / 180 * Math.PI) * r + x, -Math.sin((54 + 3 * 72) / 180 * Math.PI) * r + y)
    ctx.lineTo(Math.cos((18 + 4 * 72) / 180 * Math.PI) * 2 * r + x, -Math.sin((18 + 4 * 72) / 180 * Math.PI) * 2 * r + y)
    ctx.lineTo(Math.cos((54 + 4 * 72) / 180 * Math.PI) * r + x, -Math.sin((54 + 4 * 72) / 180 * Math.PI) * r + y)
    // Math.cos((18+1*72)/180*Math.PI)*2*r+x , -Math.sin((18+1*72)/180 * Math.PI ) *2*r+y
    // ctx.lineTo(100, 100)
    // Math.cos((54 + 1 * 72) / 180 * Math.PI) * r + x, -Math.sin((54 + 1 * 72) / 180 * Math.PI) * r + y
    ctx.closePath()
    ctx.strokeStyle = this.color
    ctx.stroke()
    // var gard = ctx.createLinearGradient(0, canvas.height / 2, canvas.width, canvas.height / 2)

    ctx.fillStyle = this.gard
    ctx.fill()
    ctx.globalAlpha = 1
  }
}
module.exports = Bubble
