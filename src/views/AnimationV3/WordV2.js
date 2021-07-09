
const DrawObj = require('@/lib/animation/draw/DrawObj')
/**
   * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
   */
/**
   *
   */
class Word extends DrawObj {
  constructor (opts = {}) {
    super(opts)
    this.op = 0
    this.text = opts.text || 'hello~'
    this.minWidth = opts.minWidth || 300
    this.maxWidth = opts.maxWidth || 400
    this.width = this.minWidth
    this.font = opts.font || '1.3rem Orbitron'
    this.lineSpace = 5
    this.padding = 5
    this.vy = opts.vy == null ? 5 : opts.vy
    this.my = 0
    /**
     * @type {CanvasRenderingContext2D}
     */
    this.ctx = opts.ctx || null
  }

  /**
     * @param {UpdateOptions} opts
     */
  setup (opts) {
    this.ctx = opts.ctx
    let word = {
      cx: 0,
      cy: 0,
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

  measure () {
    let ctx = this.ctx
    if (ctx && this.text) {
      let fontBackup = ctx.font
      ctx.font = this.font
      let w
      let rect = ctx.measureText(this.text)
      let th = this.theight = rect.actualBoundingBoxAscent - rect.actualBoundingBoxDescent
      let minW = this.minWidth
      let maxW = this.maxWidth
      w = rect.width + this.padding * 2
      console.log('c w', w)
      console.log('rect.width', rect.width)
      if (w <= minW) {
        w = minW
        this.height = th + this.padding * 2
        this.lines = [this.text]
      } else {
        console.log('split')
        // 暫時只支援兩行
        let splitTexts = this.text.split(/\s+/)
        let sp = Math.floor(splitTexts.length / 2)
        let first = splitTexts.slice(0, sp).join(' ')
        let second = splitTexts.slice(sp + 1, splitTexts.length).join(' ')
        this.lines = [first, second]
        this.theight = th * 2
        this.height = th * 2 + this.padding * 2
      }
      console.log('lines', this.lines)
      console.log('line height', th, this.theight)
      this.width = w
      console.log(w)
      ctx.font = fontBackup
    } else {
      this.width = 0
      this.height = 0
    }
  }

  setText (text, time = 2000) {
    if (text) {
      console.log('set text', text)
      clearTimeout(this.clock)
      this.fadeOut = false
      this.text = text
      console.log('measure')
      this.measure()
      console.log(this.width)
      this.op = 1
      this.my = 0
      if (time > 0) {
        this.clock = setTimeout(() => {
          this.fadeOut = true
        }, time)
      }
    }
  }

  /**
     *
     *
     * @param {UpdateOptions} opts
     */
  draw (opts) {
    if (!this.lines && this.lines.length === 0) return
    // let x = this.x
    // let y = this.y
    // ctx.clearRect(20, 20, 295, 130)
    var ctx = opts.ctx
    let w = this.width
    ctx.save()
    ctx.fillStyle = `rgba(50, 50, 160,${this.op})`
    ctx.strokeStyle = `rgb(50, 50, 160,${this.op})`
    ctx.translate(this.x, this.y + this.my)
    ctx.beginPath()
    ctx.moveTo(75, 25)
    let points = [
      [25, 25, 25, 62.5],
      [25, 100, 50, 100],
      [50, 120, 80, 125],
      [60, 120, 65, 100],
      [93, 100, w, 100],
      [w + 45, 100, w + 45, 62.5],
      [w + 45, 25, w, 25],
      [93, 25, 75, 25]
    ]
    for (let p of points) {
      ctx.quadraticCurveTo(p[0], p[1], p[2], p[3])
    }
    // ctx.quadraticCurveTo(25, 25, 25, 62.5)
    // ctx.quadraticCurveTo(25, 100, 50, 100)
    // ctx.quadraticCurveTo(50, 120, 80, 125)
    // ctx.quadraticCurveTo(60, 120, 65, 100)
    // ctx.quadraticCurveTo(93, 100, w, 100)
    // ctx.quadraticCurveTo(w + 45, 100, w + 45, 62.5)
    // ctx.quadraticCurveTo(w + 45, 25, w, 25)
    // ctx.quadraticCurveTo(93, 25, 75, 25)
    ctx.stroke()
    ctx.font = this.font
    // let rect = ctx.measureText(this.text)
    // rect.width
    let lineH = this.theight / this.lines.length
    for (let i = 0; i < this.lines.length; i++) {
      let line = this.lines[i] + this.theight / 3
      ctx.fillText(line, 50, 62.5 + i * lineH)
    }
    ctx.restore()
  }
}

module.exports = Word
