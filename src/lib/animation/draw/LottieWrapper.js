const AnimationItem = require('AnimationItem')
const DrawObj = require('./DrawObj')
/**
 * @typedef {import('lottie-web').AnimationItem} AnimationItem
 */
/**
 * @typedef {import('../CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 * @typedef {Object} LottieWrapperOptions
 * @property {AnimationItem} anim
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {boolean} autoplay 畫布開始渲染時候是否同步開始播放
 * @property {boolean} autoreplay
 * @property {boolean} debug 設為 true 時會在物件附近顯示一些額外資訊
 * @property {boolean} border 是否繪製邊框
 */
class LottieWrapper extends DrawObj {
  /**
   * @param {LottieWrapperOptions} opts
   */
  constructor (opts = {}) {
    super(opts)
    this.data = {}
    /**
     * @type {AnimationItem}
     */
    this.anim = null
    if (opts.anim) {
      this.anim = opts.anim
      this.setupAnimation = true
    } else if (opts.data) {
      this.data = opts.data
      console.log('%cdebug:', 'color:red;')
      console.log(opts.data)
      this.anim = new AnimationItem()
      this.setupAnimation = false
      console.log('setup by data', this.anim)
    } else {
      throw new Error('未指定 animationItem')
    }
    this.startAt = opts.startAt || 0
    this.debug = opts.debug || false
    this.border = opts.border || false
    this.autoplay = opts.autoplay || false
    this.autoreplay = opts.autoreplay == null ? true : opts.autoreplay
    this.frameTrigger = {}
    this.setupEvent()
  }

  getAnimItemOptions (ctx) {
    return {
      name: this.name,
      renderer: 'canvas',
      autoplay: false,
      animationData: this.data,
      rendererSettings: {
        context: ctx,
        clearCanvas: false
      }
    }
  }

  get loaded () {
    return this.anim.isLoaded
  }

  onFrame (f) {
    if (Number.isNaN(f)) {
      throw new Error('收到錯誤的參數')
    }
    this.frameTrigger[f] = f
    return new Promise((resolve) => {
      this.once(`onFrame:${f}`, resolve)
    })
  }

  onComplete () {
    return new Promise((resolve) => {
      this.once('complete', resolve)
    })
  }

  setupEvent () {
    let anim = this.anim
    let loopComplete = () => {
      if (this._remove) {
        anim.removeEventListener('loopComplete', loopComplete)
      } else {
        this.emit('complete')
      }
    }
    anim.addEventListener('loopComplete', loopComplete)
    this.on('reset', () => {
      this.goto(this.startAt)
    })
  }

  goto (frame) {
    var anim = this.anim
    var totalFrames = anim.totalFrames
    if (frame < totalFrames) {
      if (this.isPaused()) {
        this.anim.setCurrentRawFrameValue(frame)
      } else {
        this.anim.currentRawFrame = frame
      }
    }
  }

  isPaused () {
    return this.anim.isPaused && this.anim._idle
  }

  play () {
    this._hide = false
    this.anim.isPaused = false
    this.anim._idle = false
    return this
  }

  hide () {
    this._hide = true
    return this
  }

  pause () {
    this.anim.isPaused = true
    this.anim._idle = true
    return this
  }

  stop () {
    this.anim.stop()
    return this
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    let anim = this.anim
    if (!this.setupAnimation) {
      anim.setParams(this.getAnimItemOptions(opts.ctx))
    }
    this.data = anim.animationData
    if (this.autoplay) {
      this.play()
    } else {
      this.pause()
    }
    this._elapsed = opts.elapsed
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    this.xScale = this.width / this.data.w
    this.yScale = this.height / this.data.h
    if (!this.isPaused()) {
      for (var k in this.frameTrigger) {
        var f = this.frameTrigger[k]
        if (this.anim.currentRawFrame >= f - 1) {
          this.emit(`onFrame:${f}`)
          delete this.frameTrigger[k]
        }
      }
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    ctx.globalAlpha = this.alpha
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.scale(this.xScale, this.yScale)
    if (this.isPaused()) {
      this.anim.renderFrame()
    } else {
      this.anim.advanceTime(opts.elapsed)
    }
    ctx.restore()
    // 這段是測試用 (會在 lottie 的物件底下顯示當前的 frame)
    if (this.debug) {
      ctx.fillText(Math.round(this.anim.currentFrame), this.x + this.width / 2, this.y + this.height)
    }
    if (this.border) {
      ctx.strokeRect(this.x, this.y, this.width, this.height)
    }
    ctx.globalAlpha = 1
    // ctx.fillText(Math.round(this.anim.currentRawFrame), this.x, this.y + this.height + 50)
    // ctx.fillText(Math.round(this.anim.playCount), this.x, this.y + this.height + 100)
  }

  destory () {
    this.anim = null
  }
}
module.exports = LottieWrapper
