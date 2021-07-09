const DrawObj = require('./DrawObj')
const Animation = require('./Animation')
const AnimationTrigger = require('./AnimationTrigger')
/**
 * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 * @typedef {Object|UpdateOptions} ExUpdateOptions
 * @property {number} _start
 * @property {number} _elapsed
 */
class AnimationManager extends DrawObj {
  constructor (opts = {}) {
    super(opts)
    /**
     * @type {Array<Animation>}
     */
    this.list = opts.list || []
    this.isPaused = false
    this.completed = false
    this.completedCount = 0
    this.on('reset', this.reset.bind(this))
  }

  /**
   * @param {Animation} anim
   */
  add (anim) {
    if (!anim) {
      throw new Error('未指定或是參數有誤')
    }
    this.list.push(anim)
  }

  reset () {
    this._start = performance.now()
    this._elapsed = 0
    this.completedCount = 0
    this.completed = false
    for (let item of this.list) {
      item.reset()
    }
    return this
  }

  stop () {
    this.pause()
    this.reset()
    return this
  }

  play () {
    this.isPaused = false
    return this
  }

  pause () {
    this.isPaused = true
    return this
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    this.canvas = opts.canvas
    this.ctx = opts.ctx
    for (let item of this.list) {
      item.obj.setup(opts)
    }
    this._start = performance.now()
    this._elapsed = 0
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    if (this.isPaused) return
    this._elapsed += opts.elapsed
    this._opts = { ...opts }
    var nOpts = this._opts
    nOpts._start = this._start
    nOpts._elapsed = this._elapsed
    nOpts.state = { ...nOpts.state }
    for (let item of this.list) {
      if (item.isPaused || item._remove) continue
      if (item.started) {
        if (item._isComplete(nOpts)) {
          item._onComplete(nOpts)
          this.completedCount += 1
          this.emit('complete', item)
          if (this.completedCount === this.list.length) {
            this.emit('all-complete', this)
          }
        }
      } else {
        if (item._when(nOpts)) {
          item.start(nOpts)
        }
      }
      if (item.started) {
        item._frame += 1
        item.update(nOpts)
      }
    }
    this.emit('update', opts, this)
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    var nOpts = this._opts
    for (let item of this.list) {
      if (item.started && !item.isPaused && !item._remove && !item._hide) {
        item.draw(nOpts)
      }
    }
  }

  /**
   * 以資料建立一組動畫
   * @param {Object} script
   * @param {Object} types 在此傳入所有需要用到的類別
   */
  static createByScript (script, types = {}) {
    let animationManager = new AnimationManager({
      name: script.name
    })
    let hamdler = {
      pause: (anim, opts = {}) => {
        anim.pause()
      }
    }
    types['trigger'] = AnimationTrigger
    for (let i = 0; i < script.list.length; i++) {
      let item = script.list[i]
      item.onComplete = item.onComplete || []
      let Cls = types[item.type]
      if (!Cls) {
        console.warn('type no support')
        continue
      }
      if (script.name) {
        item.params.name = script.name
      }
      let drawObj = new Cls(item.params)
      let when = null
      let isComplete = null
      if (typeof item.startByTime === 'number') {
        when = whenTime(item.startByTime)
      } else if (item.when) {
        // TODO 之後要優化該部分
        let w = item.when
        when = whenEvent(w.event, w.target)
      }
      if (typeof item.endByTime === 'number') {
        isComplete = whenTime(item.endByTime)
      }
      if (item.type === 'trigger') {
        animationManager.add(drawObj)
      } else {
        animationManager.add(new Animation({
          obj: drawObj,
          loop: item.loop,
          when,
          isComplete,
          onComplete: function (opts) {
            for (let action of item.onComplete) {
              hamdler[action](this, opts)
            }
          }
        }))
      }
    }
    function whenEvent (eventName, target = null) {
      let receiveEvent = false
      if (target === 'object') {
        this.obj.once(eventName, () => {
          receiveEvent = true
        })
      } else {
        this.once(eventName, () => {
          receiveEvent = true
        })
      }
      return (opts) => {
        return receiveEvent
      }
    }
    function whenTime (time) {
      return (opts) => {
        return opts._elapsed > time
      }
    }
    return animationManager
  }

  destory () {
    for (let item of this.list) {
      item.destory()
    }
    super.destory()
  }
}
module.exports = AnimationManager
