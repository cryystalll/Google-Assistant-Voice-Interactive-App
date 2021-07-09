const DrawObj = require('./DrawObj')
const Queue = require('../tools/Queue')
/**
 * @typedef {import('./DrawObj').UpdateOptions} UpdateOptions
 */
/**
 * @implements {DrawObj}
 */
class FPSChart extends DrawObj {
  constructor (opts = {}) {
    opts.height = opts.height == null ? 200 : opts.height
    opts.width = opts.width == null ? 600 : opts.width
    super(opts)
    this.font = '40px Arial'
    this.list = new Queue(256, 0)
    this.hLimit = 200
    this.pad = 50
    /** 當前更新數值的位置 */
    this.p = 0
    this.avg = -1
  }

  add (num) {
    let v = Math.min(num, this.height)
    this.list.push(v)
  }

  get (i) {
    return this.list.rget(i)
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    this.add(opts.manager.fps)
    var sum = 0
    this.min = 999
    this.max = 0
    for (let i = 0; i < this.list.size; i++) {
      var v = this.get(i)
      if (v > 0) {
        sum += v
        if (this.min > v) {
          this.min = v
        }
        if (this.max < v) {
          this.max = v
        }
      }
    }
    this.max = Math.round(this.max)
    this.min = Math.round(this.min)
    this.avg = sum / this.list.size
    this.avgline = Math.round(this.avg / 10) * 10
  }

  hLine (ctx, text, y, style) {
    ctx.strokeStyle = style
    ctx.beginPath()
    ctx.moveTo(this.pad, y)
    ctx.lineTo(this.width - this.pad, y)
    ctx.stroke()
    ctx.font = '16px'
    ctx.fillStyle = style
    ctx.fillText(text, this.pad - 20, y + 4)
  }

  yMapping (v) {
    return (this.height - this.pad * 2) * v / this.hLimit
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    ctx.save()
    ctx.translate(this.x, this.y)
    var x, y
    var w = this.width
    var gap = (this.width - this.pad - this.pad) / this.list.size
    // 畫框線
    ctx.strokeStyle = 'black'
    ctx.beginPath()
    ctx.moveTo(this.pad, this.pad)
    ctx.lineTo(this.pad, this.height - this.pad)
    ctx.lineTo(w - this.pad, this.height - this.pad)
    ctx.stroke()
    // 畫平均線
    if (this.avg > -1) {
      this.hLine(ctx, this.max, this.height - this.pad - this.yMapping(this.max), 'rgb(40,40,200,0.7)')
      this.hLine(ctx, this.avgline, this.height - this.pad - this.yMapping(this.avgline), 'rgb(40,200,40,0.7)')
      this.hLine(ctx, this.min, this.height - this.pad - this.yMapping(this.min), 'rgb(200,40,40,0.7)')
    }
    ctx.strokeStyle = 'rgb(0,0,0)'
    ctx.beginPath()
    var v = this.get(0)
    var px = this.pad
    var py = this.height - this.pad - this.yMapping(v)
    ctx.moveTo(px, py)
    for (let i = 1; i < this.list.size; i++) {
      v = this.get(i)
      x = this.pad + (i + 1) * gap
      y = this.height - this.pad - this.yMapping(v)
      ctx.lineTo(x, y)
      px = x
      py = y
    }
    ctx.stroke()
    ctx.restore()
  }
}
module.exports = FPSChart
