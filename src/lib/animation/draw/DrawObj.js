const EventEmitter = require('eventemitter3')
const utils = require('../tools/utils')
/**
 * @typedef {import('../CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 * @typedef {Object} DrawObjOptions
 * @property {string?} name
 * @property {number} alpha 透明度, 0 ~ 1
 */
/**
 * 加入 CanvasManager 用的物件
 * @interface
 */
class DrawObj extends EventEmitter {
  constructor (opts = {}) {
    super()
    this.name = opts.name
    this.alpha = opts.alpha == null ? 1 : opts.alpha
    this.x = opts.x == null ? 0 : opts.x
    this.y = opts.y == null ? 0 : opts.y
    this.baseX = opts.baseX == null ? 0 : opts.baseX
    this.baseY = opts.baseY == null ? 0 : opts.baseY
    this.width = opts.width == null ? 0 : opts.width
    this.height = opts.height == null ? 0 : opts.height
    this.canvas = opts.canvas
    this.ctx = opts.ctx
    this.motion = {}
    this._hide = opts._hide || false
    this._remove = false
    this.on('m-fadeout-end', () => {
      this._hide = true
    })
    this.on('move', (opts) => {
      let speed = opts.speed || 100
      let { x, y } = opts.to
      let dx = x - this.x
      let dy = y - this.y
      let r = utils.distance(this.x, this.y, x, y)
      console.log('%cmove', 'color:blue')
      this.motion['move'] = [
        {
          field: 'x',
          step: speed * dx / r,
          from: this.x,
          to: opts.to.x
        },
        {
          field: 'y',
          step: speed * dy / r,
          from: this.y,
          to: opts.to.y
        }
      ]
    })
    this.on('fadeout', () => {
      this.motion['fadeout'] = [
        {
          field: 'alpha',
          step: 1,
          to: 0
        }
      ]
    })
  }

  hide (hide = false) {
    this._hide = hide
    return this
  }

  distance (pos) {
    return Math.sqrt(Math.pow(pos.x - this.x, 2) + Math.pow(pos.y - this.y, 2))
  }

  mappingPos (ctx, pos) {
    var matrix = ctx.currentTransform
    var imatrix = matrix.invertSelf()
    var x = pos.x * imatrix.a + pos.y * imatrix.c + imatrix.e
    var y = pos.x * imatrix.b + pos.y * imatrix.d + imatrix.f
    return {
      x,
      y
    }
  }

  /**
   * 如果參數包含 ctx 則會以 currentTransform 去重新計算座標
   * @param {*} pos
   * @param {*} ctx
   */
  inRange (pos, ctx = null) {
    var rx = this.x + this.width
    var ry = this.y + this.height
    if (ctx) {
      pos = this.mappingPos(ctx, pos)
      var tpos = this.mappingPos(ctx, { x: rx, y: ry })
      rx = tpos.x
      ry = tpos.y
    }
    return pos.x > this.x && pos.y > this.y && pos.x < rx && pos.y < ry
  }

  /**
   * @abstract
   * @param {UpdateOptions} opts
   */
  onChangeState (opts) {}

  /**
   * @abstract
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    this.emit('setup', opts)
  }

  /**
   * @abstract
   * @param {UpdateOptions} opts
   */
  update (opts) {
    var rate = opts.rate
    for (let key in this.motion) {
      var actoins = this.motion[key]
      // 判斷列表中的所有action是否皆已完成
      var done = true
      for (let action of actoins) {
        var { to, step, from } = action
        action.notFirst = action.notFirst || false
        if (action.notFirst) {
          action.notFirst = true
          this[action.field] = from
        }
        var mv = step * rate
        this[action.field] += mv
        if (Math.abs(this[action.field] - to) <= Math.abs(mv * 2)) {
          this[action.field] = to
        } else {
          done = false
        }
      }
      if (done) {
        var info = { key }
        console.log('motion-end')
        this.emit(`m-${key}-end`, info)
        this.emit('motion-end', info)
        delete this.motion[key]
      }
    }
  }

  /**
   * @abstract
   * @param {UpdateOptions} opts
   */
  draw (opts) {}
  /**
   * @abstract
   * @param {Error} err
   */
  destory (err) {
    if (err) {
      console.error(err)
    }
    this.removeAllListeners()
  }
}
module.exports = DrawObj
