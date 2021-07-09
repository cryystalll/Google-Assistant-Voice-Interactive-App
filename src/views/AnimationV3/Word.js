
const DrawObj = require('@/lib/animation/draw/DrawObj')
/**
   * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
   */
/**
   *
   */
class Word extends DrawObj {
  constructor (opts = {}) {
    opts.width = opts.width == null ? 210 : opts.width
    super(opts)
    this.op = 0
    this.text = opts.text || 'hello~'
    this.vy = opts.vy == null ? 5 : opts.vy
    this.my = 0
  }

  /**
     * @param {UpdateOptions} opts
     */
  setup (opts) {
    let word = {
    //   y: 0,
    //   x: 0,
      cx: 0,
      cy: 0,
      //   text: '',¸
      // font: '30px Arial',
      // counter: 0,
      //   op: 0,
      clock: null,
      fadeOut: false
    }
    Object.assign(this, word)
  }

  /**
     * @param {UpdateOptions} opts
     */
  update (opts) {
    if (this.fadeOut && this.op > 0) {
    //   this.my -= this.vy
      this.op -= 0.1
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

  setText (text, time = 2000) {
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
    let w = 335
    var str = this.text
    let linecount = ctx.measureText(str).width / w
    ctx.save()
    // ctx.fillStyle = `rgba(50, 50, 160,${this.op})`
    ctx.strokeStyle = `rgb(50, 50, 160,${this.op})`
    ctx.translate(this.x, this.y + this.my)
    ctx.beginPath()
    ctx.moveTo(75, 25)

    if (linecount <= 2) {
      ctx.quadraticCurveTo(25, 25, 25, 62.5)
      ctx.quadraticCurveTo(25, 100, 50, 100)
      ctx.quadraticCurveTo(50, 120, 80, 125)
      ctx.quadraticCurveTo(60, 120, 65, 100)
      ctx.quadraticCurveTo(93, 100, w, 100)
      ctx.quadraticCurveTo(w + 45, 100, w + 45, 62.5)
    } else {
      let k = linecount - 1
      ctx.quadraticCurveTo(25, 25, 25, (125 + k * 30) / 2)
      ctx.quadraticCurveTo(25, 100 + k * 30, 50, 100 + k * 30)
      ctx.quadraticCurveTo(50, 120 + k * 30, 80, 125 + k * 30)
      ctx.quadraticCurveTo(60, 120 + k * 30, 65, 100 + k * 30)
      ctx.quadraticCurveTo(93, 100 + k * 30, w, 100 + k * 30)
      ctx.quadraticCurveTo(w + 45, 100 + k * 30, w + 45, (125 + k * 30) / 2)
    }
    ctx.quadraticCurveTo(w + 45, 25, w, 25)
    ctx.quadraticCurveTo(93, 25, 75, 25)
    ctx.stroke()
    // ctx.font = '1.3rem Orbitron'
    // let rect = ctx.measureText(this.text)
    // ctx.lineWidth = 1

    var lineWidth = 0
    // var c = opts.canvas
    // var canvasWidth = c.width// 計算canvas的寬度
    var initHeight = -5// 繪製字型距離canvas頂部初始的高度
    var lastSubStrIndex = 0 // 每次開始擷取的字串的索引
    ctx.font = '1.3rem Roboto Mono'
    ctx.fillStyle = `rgba(0, 0, 0,${this.op})`
    ctx.textAlign = 'center'
    for (let i = 0; i < str.length; i++) {
      lineWidth += ctx.measureText(str[i]).width
      if (lineWidth > w - 50 && str[i] === ' ') {
        // ctx.save()
        // ctx.translate(this.x, this.y + this.my)

        ctx.fillText(str.substring(lastSubStrIndex, i), 200, 62.5 + initHeight)// 繪製擷取部分
        // ctx.restore()
        initHeight += 30// 20為字型的高度
        lineWidth = 0
        lastSubStrIndex = i
      }
      if (i === str.length - 1) { // 繪製剩餘部分
        // ctx.font = '1.3rem Roboto Mono'
        // ctx.fillStyle = `rgba(0, 0, 0,${this.op})`
        // ctx.textAlign = 'center'
        // ctx.save()
        // ctx.translate(this.x, this.y + this.my)
        // ctx.restore()
        ctx.fillText(str.substring(lastSubStrIndex, i + 1), 200, 62.5 + initHeight)
        // ctx.restore()
      }
      // ctx.fillText(this.text, 50, 62.5)

      // ctx.restore()
    }
    ctx.restore()
  }
}

module.exports = Word
