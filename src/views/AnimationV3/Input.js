const DrawObj = require('@/lib/animation/draw/DrawObj')
/**
   * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
   */
/**
   *
   */
class Input extends DrawObj {
  constructor (opts = {}) {
    super(opts)
    this.op = 0
    this.text = opts.text || 'input~'
    this.vy = opts.vy == null ? 2.5 : opts.vy
    this.my = 0
  }

  /**
     * @param {UpdateOptions} opts
     */
  setup (opts) {
    let input = {
    //   y: 150,
    //   x: 100,
      cx: 0,
      cy: 0,
      //   text: '',¸
      // font: '30px Arial',
      // counter: 0,
      //   op: 0,
      clock: null,
      fadeOut: false
    }
    Object.assign(this, input)
  }

  /**
     * @param {UpdateOptions} opts
     */
  update (opts) {
    if (this.fadeOut && this.op > 0) {
      this.my -= this.vy
      this.op -= 0.02
    }
    var canvas = opts.canvas
    this.cy = canvas.height / 2
    this.cx = canvas.width / 2
  }

  /**
     * @param {UpdateOptions} opts
     */
  setPos (x, y) {
    this.x = x
    this.y = y
  }

  setInput (text, time = 100) {
    clearTimeout(this.clock)
    this.fadeOut = false
    this.text = text
    this.op = 1
    this.my = 0
    this.clock = setTimeout(() => {
      this.fadeOut = true
    }, time)
  }

  /**
     *
     *
     * @param {UpdateOptions} opts
     */
  draw (opts) {
    // let x = this.x
    // let y = this.y
    // ctx.clearRect(20, 20, 295, 130)
    var ctx = opts.ctx
    ctx.save()
    ctx.fillStyle = `rgba(50, 50, 160,${this.op})`
    ctx.strokeStyle = `rgb(50, 50, 160,${this.op})`
    ctx.translate(this.x, this.my + this.y)
    // ctx.beginPath()
    // ctx.moveTo(75, 25)
    // ctx.quadraticCurveTo(25, 25, 25, 62.5)
    // ctx.quadraticCurveTo(25, 100, 50, 100)
    // ctx.quadraticCurveTo(50, 120, 80, 125)
    // ctx.quadraticCurveTo(60, 120, 65, 100)
    // ctx.quadraticCurveTo(93, 100, 250, 100)
    // ctx.quadraticCurveTo(295, 100, 295, 62.5)
    // ctx.quadraticCurveTo(295, 25, 250, 25)
    // ctx.quadraticCurveTo(93, 25, 75, 25)
    // ctx.stroke()
    ctx.font = '1.3rem Orbitron'
    ctx.fillText(this.text, 50, 62.5, 210)
    ctx.restore()
  }
}

module.exports = Input
