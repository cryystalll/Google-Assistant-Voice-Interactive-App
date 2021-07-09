const DrawObj = require('@/lib/animation/draw/DrawObj')
/**
 * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 * 加入 CanvasManager 用的物件
 */
class SnowBall extends DrawObj {
  constructor (opts = {}) {
    super(opts)
    this.vx = opts.vx == null ? 50 : opts.vx
    this.vy = opts.vy == null ? 100 : opts.vy
    this.r = opts.r == null ? 10 : opts.r
    this.g = opts.g == null ? 200 : opts.g
    this.u = opts.u == null ? 0.8 : opts.u
    this.floor = opts.floor == null ? 500 : opts.floor
    this.color = 'rgba(255,255,255,0.7)'
    let initState = { ...this }
    this.on('reset', () => {
      Object.assign(this, initState)
    })
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {}
  /**
   * @param {UpdateOptions} opts
   */
  update ({ manager, rate, state }) {
    var floorY = this.floor
    this.x += this.vx * rate
    this.y += this.vy * rate
    // if 球碰到地板
    if (this.y + this.r >= floorY) {
      this.y = floorY - this.r
      // 反彈
      this.vy = -this.vy * 0.7
    } else {
      // apply 重力
      this.vy += this.g * rate
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    ctx.globalAlpha = this.alpha
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    ctx.fillStyle = this.color
    ctx.fill()
    ctx.globalAlpha = 1
  }

  /**
   * @param {Error} err
   */
  destory (err) {
    if (err) {
      console.error(err)
    }
  }
}
module.exports = SnowBall
