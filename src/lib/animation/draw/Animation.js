const DrawObj = require('./DrawObj')

/**
 * @typedef {import('./AnimationManager').ExUpdateOptions} ExUpdateOptions
 */

class Animation extends DrawObj {
  constructor (opts = {}) {
    super(opts)
    this.obj = opts.obj
    if (!this.obj) {
      throw new Error('未指定必要的參數 animation.obj')
    }
    /**
     * complete 之後是否自動重播
     */
    this.debug = opts.debug || false
    this.loop = opts.loop || false
    this.loopTimes = opts.loopTimes || 1
    // 若此 cb 成立，則將 started 設為 true
    this.when = opts.when || when
    // 若此 cb 成立，
    this.isComplete = opts.isComplete || isComplete
    this.onStart = opts.onStart || empty
    this.onReset = opts.onReset || empty
    this.onComplete = opts.onComplete || empty
    this.onPause = opts.onPause || empty
    this.reset(false)
  }

  pause () {
    this._onPause()
  }

  reset (callCB = true) {
    this._start = -1
    this._elapsed = -1
    this._frame = -1
    this.completed = false
    this.started = false
    this.isPaused = false
    if (callCB) {
      this.onReset()
      this.obj.emit('reset')
    }
  }

  start (opts) {
    this._frame = 0
    this._start = performance.now()
    this._elapsed = 0
    this.started = true
    this.isPaused = false
    this.onStart(opts)
    this.obj.emit('reset')
  }

  _when (opts) {
    return this.when(opts)
  }

  _isComplete (opts) {
    return this.isComplete(opts)
  }

  _onComplete (opts) {
    this.completed = true
    if (!this.loop) {
      this.isPaused = true
    }
    this.onComplete(opts)
  }

  _onPause () {
    this.isPaused = true
    this.onPause()
  }

  update (opts) {
    let obj = this.obj
    this.width = obj.width
    this.height = obj.height
    this._elapsed += opts.elapsed
    obj.update(opts)
  }

  draw (opts) {
    var ctx = opts.ctx
    this.obj.draw(opts)
    if (this.debug) {
      ctx.font = '16px'
      ctx.fillStyle = 'black'
      ctx.fillText(Math.round(opts._elapsed), this.obj.x, this.obj.y - 30)
    }
  }

  destory () {
    if (this.obj) {
      this.obj.destory()
      this.obj = null
    }
    super.destory()
  }
}
function empty () {}
function isComplete () {
  return false
}
function when () {
  return true
}
module.exports = Animation
