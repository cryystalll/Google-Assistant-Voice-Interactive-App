/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const EventEmitter = require('eventemitter3')
const {
  distance,
  distanceSquare
} = require('./tools/utils')
/**
 * @typedef {import('./draw/DrawObj')} DrawObj
 */
/**
 * @typedef {Object} CanvasManagerOptions
 * @property {HTMLCanvasElement} canvas
 * @property {number} fps
 */
/**
 * @typedef {Object} CanvasState
 * @property {number} mouseX
 * @property {number} mouseY
 * @property {number} mousedownX
 * @property {number} mousedownY
 * @property {boolean} mouseenter
 * @property {boolean} mousedown
 */
/**
 * callback function，加入後會在每個元件 update & draw 結束後被呼叫
 * @callback Ticker
 * @param {UpdateOptions} opts
 */
/**
 * @typedef {Object} UpdateOptions
 * @property {CanvasManager} manager
 * @property {HTMLCanvasElement} canvas 綁定顯示用的 canvas
 * @property {CanvasRenderingContext2D} ctx context
 * @property {number} now 當前時間戳
 * @property {number} elapsed 跟前一幀的時間差
 * @property {number} rate elapsed / 1000
 * @property {CanvasState} state 整體的狀態，包含滑鼠位置等等
 */
/**
 * CanvasManager
 * 管理 canvas 狀態 & 渲染動畫
 * @class
 * @constructor
 * @member {HTMLCanvasElement} canvas
 */
class CanvasManager extends EventEmitter {
  /**
   * @param {CanvasManagerOptions} opts
   */
  constructor (opts = {}) {
    super()
    if (!opts.canvas) {
      throw new Error('未指定 canvas')
    }
    /**
     * 設定要綁定的 canvas
     */
    this.setupCanvas(opts.canvas)
    // 預設限制為 30 fps
    this.setFPS(opts.fps == null ? 30 : opts.fps)
    this.animate = this.animate.bind(this)
    this.state = {
      mouseX: 0,
      mouseY: 0,
      mousedownX: 0,
      mousedownY: 0,
      mouseenter: false,
      mousedown: false,
      touch: false,
      touchX: 0,
      touchY: 0,
      // mouse 和 touch 都會修改 cursor 的對應屬性
      cursorPressed: false,
      cursorX: 0,
      cursorY: 0
    }
    this.tickers = {}
    /**
     * 即時的FPS數值
     * @type {number}
     */
    this.fps = 0
    /**
     * 表示繪圖迴圈是否為啟動中
     */
    this._running = false
    /**
     * 表示是否要暫停繪圖
     */
    this._pause = true
    /**
     * 若該 flag 為 true 則下次更新完畫面後將會執行clear
     */
    this.clearFlag = false
    /**
     * 保存所有的 drawObj
     */
    this._drawList = []
    /**
     * 保存 drawObj 並以 name 作為 key
     */
    this._drawMap = {}
    /**
     * 自動產生 name 時使用
     */
    this.generator = 0
    /**
     * 綁定當前滑鼠樣式
     */
    this.setCursor('none')
    /**
     * 顯示FPS數值
     */
    this.showFPS(true)
    this.setupEventListeners()
  }

  get height () {
    return this.canvas.height
  }

  get width () {
    return this.canvas.width
  }

  /**
   * @param {string} cursor
   */
  setCursor (cursor) {
    this.cursor = cursor
    this.canvas.style.cursor = cursor
  }

  /**
   * @param {HTMLCanvasElement} canvas
   */
  setupCanvas (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  clearListeners () {
    for (let key in this._listeners) {
      this.canvas.removeEventListener(key, this._listeners[key])
    }
  }

  resize (w, h) {
    this.canvas.width = w
    this.canvas.height = h
    log(`resize:(${w}, ${h})`)
    this.emit('resize', {
      width: w,
      height: h
    })
  }

  setupEventListeners () {
    if (this._listeners) {
      this.clearListeners()
    }
    this._listeners = {
      /**
       * @param {MouseEvent} e
       */
      contextmenu: (e) => {
        var pos = getMousePos(this.canvas, e)
        e.pos = pos
        e.preventDefault()
        this.emit('contextmenu', e)
      },
      /**
       * @param {MouseEvent} e
       */
      mouseleave: (e) => {
        var pos = getMousePos(this.canvas, e)
        e.pos = pos
        this.state.mouseenter = false
        this.emit('mouseleave', e)
      },
      /**
       * @param {MouseEvent} e
       */
      mouseenter: (e) => {
        var pos = getMousePos(this.canvas, e)
        e.pos = pos
        this.state.mouseX = pos.x
        this.state.mouseY = pos.y
        this.state.mouseenter = true
        this.emit('mouseenter', e)
      },
      /**
       * @param {MouseEvent} e
       */
      mousemove: (e) => {
        var pos = getMousePos(this.canvas, e)
        e.pos = postMessage
        this.state.mouseX = pos.x
        this.state.mouseY = pos.y
        this.state.cursorX = pos.x
        this.state.cursorY = pos.y
        this.emit('mousemove', e)
      },
      /**
       * @param {MouseEvent} e
       */
      mousedown: (e) => {
        var pos = getMousePos(this.canvas, e)
        var state = this.state
        e.pos = pos
        state.leftMouse = e.button === 0
        state.mousedownX = pos.x
        state.mousedownY = pos.y
        state.mouseX = pos.x
        state.mouseY = pos.y
        state.mousedown = true
        state.cursorX = pos.x
        state.cursorY = pos.y
        state.cursorPressed = true
        this.emit('mousedown', e)
      },
      /**
       * @param {MouseEvent} e
       */
      mouseup: (e) => {
        var pos = getMousePos(this.canvas, e)
        var state = this.state
        e.pos = pos
        state.mouseX = pos.x
        state.mouseY = pos.y
        state.mousedown = false
        state.cursorX = pos.x
        state.cursorY = pos.y
        state.cursorPressed = false
        this.emit('mouseup', e)
        if (distanceSquare(pos.x, pos.y, state.mousedownX, state.mousedownY) < 100) {
          e.pos = {
            x: state.mousedownX,
            y: state.mousedownY
          }
          log('click', e.pos.x, e.pos.y)
          this.emit('click', e)
        }
      },
      touchmove: (e) => {
        var pos = getMousePos(this.canvas, e)
        var state = this.state
        state.touchX = pos.x
        state.touchY = pos.y
        state.cursorX = pos.x
        state.cursorY = pos.y
        this.emit('touchmove', e)
      },
      touchstart: (e) => {
        var pos = getMousePos(this.canvas, e)
        var state = this.state
        state.touchX = pos.x
        state.touchY = pos.y
        state.touch = true
        state.cursorX = pos.x
        state.cursorY = pos.y
        state.cursorPressed = true
        this.emit('touchstart', e)
      },
      touchend: (e) => {
        var pos = getMousePos(this.canvas, e)
        var state = this.state
        state.touchX = pos.x
        state.touchY = pos.y
        state.touch = false
        state.cursorX = pos.x
        state.cursorY = pos.y
        state.cursorPressed = false
        this.emit('touchend', e)
      },
      touchcancel: (e) => {
        var pos = getMousePos(this.canvas, e)
        var state = this.state
        state.touchX = pos.x
        state.touchY = pos.y
        state.touch = false
        state.cursorX = pos.x
        state.cursorY = pos.y
        state.cursorPressed = false
        this.emit('touchcancel', e)
      },
      /**
       * @param {KeyboardEvent} e
       */
      keydown: (e) => {
        this.emit('keydown', e)
      },
      /**
       * @param {KeyboardEvent} e
       */
      keyup: (e) => {
        this.emit('keyup', e)
      }
    }
    // this.canvas.addEventListener('mouseenter', () => {})
    // this.canvas.addEventListener('mouse', () => {})
    for (let key in this._listeners) {
      this.canvas.addEventListener(key, this._listeners[key])
    }
  }

  /**
   * SPA 通常應在切換畫面前手動執行該 function
   */
  destory () {
    this.stop()
    for (let obj of this._drawList) {
      if (obj) {
        obj._remove = true
      }
    }
    this.clear()
    this.clearListeners()
  }

  /**
   * @param {boolean} show true => 會即時在畫面右上角顯示 FPS, false => 關閉該功能
   */
  showFPS (show) {
    let fpsView = this.get('FPS_VIEW')
    if (show !== false) {
      if (!fpsView) {
        const FPS = require('./draw/FPS')
        this.add('FPS_VIEW', new FPS())
      }
    } else {
      this.remove('FPS_VIEW')
    }
  }

  /**
   * 設定 FPS 上限(還沒實裝)
   * @param {*} fps
   */
  setFPS (fps) {
    if (fps) {
      this._fpsLimit = fps
      this._fpsInterval = 1000 / fps
    } else {
      this._fpsLimit = 300
      this._fpsInterval = 0
    }
  }

  /**
   * 移除對應名稱的DrawObj
   * @param {string} name
   */
  remove (name) {
    if (this._drawMap[name]) {
      let obj = this._drawMap[name]
      obj._remove = true
      delete this._drawMap[name]
    }
  }

  /**
   * 移除指定的DrawObj
   * @param {number} index
   */
  removeByIndex (index) {
    if (this._drawList[index]) {
      let obj = this._drawList[index]
      obj._remove = true
      if (obj.name && obj.name in this._drawMap) {
        delete this._drawMap[name]
      }
    }
  }

  /**
   * 若有 tickerId 重複，會拋出 error
   * @param {Ticker} fn
   * @param {string} tickerId 可手動指定 tickerId 若未指定則會自動產生
   */
  addTicker (fn, tickerId) {
    tickerId = tickerId || fn.tickerId || ('t-' + this.generator++)
    if (this.tickers[tickerId]) {
      throw new Error(`ticker id (${tickerId}) dupplicate`)
    }
    fn.tickerId = tickerId
    return this.replaceTicker(fn)
  }

  /**
   * 若有 tickerId 重複，會拋出 error
   * @param {Ticker} fn
   * @param {string} tickerId 可手動指定 tickerId 若未指定則會自動產生
   */
  replaceTicker (fn, tickerId) {
    tickerId = tickerId || fn.tickerId || ('t-' + this.generator++)
    fn.tickerId = tickerId
    this.tickers[tickerId] = fn
    return tickerId
  }

  /**
   * 刪除對應的 ticker
   * @param {string|Function} fn 傳入 ticker 的 function 或是 id
   */
  removeTicker (fn) {
    if (typeof fn === 'function') {
      delete this.tickers[fn.tickerId]
    } else if (typeof fn === 'string') {
      delete this.tickers[fn]
    } else {
      throw new Error('參數必須為 function 或是 string')
    }
  }

  /**
   * 加入物件
   * @param {string} name 若未設置將自動生成
   * @param {DrawOb} drawObj
   */
  add (name, drawObj, opts = {}) {
    if (name) {
      if (typeof name === 'object') {
        drawObj = name
        name = drawObj.name
      } else if (typeof name === 'function') {
        name = name(drawObj)
      } else {
        name = name.toString()
      }
      drawObj.name = name
    } else if (drawObj) {
      if (drawObj.name) {
        name = drawObj.name
      }
    } else {
      throw new Error('未包含必要的參數')
    }
    if (!name) {
      name = 'auto-' + this.generator++
    }
    drawObj.name = name
    drawObj.setup = drawObj.setup || empty
    drawObj.draw = drawObj.draw || empty
    drawObj.update = drawObj.update || empty
    drawObj.destory = drawObj.destory || empty
    log('add obj', drawObj.name)
    if (this._drawMap[name]) {
      this.remove(name)
    }
    this._drawMap[name] = drawObj
    if (this._running && !opts.noSetup) {
      drawObj.setup({
        manager: this,
        state: this.state,
        canvas: this.canvas,
        ctx: this.ctx,
        start: this._startTime,
        now: this._then,
        elapsed: 0,
        rate: 1
      })
    }
    this._drawList.push(drawObj)
    return this
  }

  /**
   * 取得對應的 DrawObj
   * @param {string}} name
   * @returns {DrawObj}
   */
  get (name) {
    return this._drawMap[name]
  }

  /**
   * 開始渲染畫布
   */
  startAnimation () {
    if (!this._running) {
      this.setup()
      log('setup done')
      this._pre = performance.now()
      setTimeout(() => {
        this.emit('start', this)
      }, 1)
      requestAnimationFrame(this.animate)
    }
    return this
  }

  /**
   * 切換開始或關閉
   */
  toggle () {
    if (this._running) {
      this.stop()
    } else {
      this.start()
    }
  }

  /**
   * 開始渲染畫布
   */
  start () {
    return this.startAnimation()
  }

  /**
   * 停止渲染畫布的迴圈
   */
  stop () {
    this._pause = true
  }

  /**
   * 計算並清理無用的物件
   * 較慢，不應經常使用
   */
  clear () {
    let count = 0
    for (let i = 0; i < this._drawList.length; i += 1) {
      let item = this._drawList[i]
      if (item && !item._remove) {
      } else {
        count += 1
      }
    }
    return this._clear(count)
  }

  /**
   * 執行 start 後會自動執行
   * @private
   */
  setup () {
    log('init manager state')
    this._pause = false
    this._running = true
    this._then = performance.now()
    this._pre = this._then
    this._startTime = this._then
    // _frames & _fpsAccumulate 為計算FPS用
    this.fps = this._fpsLimit
    // frame 數 (每一段時間後會清除)
    this._frames = 0
    this._fpsAccumulate = 0
    // 累積渲染 frame 數
    this._t = 0
    log('setup draw object')
    var count = this._drawList.length
    var opts = {
      manager: this,
      state: this.state,
      canvas: this.canvas,
      ctx: this.ctx,
      start: this._startTime,
      now: this._then,
      elapsed: 0,
      rate: 1
    }
    this.emit('before-setup', opts)
    let rmCount = 0
    for (let i = 0; i < count; i++) {
      let drawObj = this._drawList[i]
      if (drawObj && !drawObj._remove) {
        try {
          drawObj.setup(opts)
        } catch (e) {
          rmCount += 1
          drawObj._remove = true
          console.error('obj setup error:', drawObj)
          console.error(e)
        }
      }
    }
    if (rmCount > 0) {
      this._clear(rmCount)
    }
    log('start drawing')
    this.emit('after-setup', opts)
  }

  render (opts, list) {
    var rmCount = 0
    var count = list.length
    for (let i = 0; i < count; i++) {
      let drawObj = list[i]
      if (drawObj && !drawObj._remove) {
        this.ctx.save()
        try {
          drawObj.update(opts)
          if (!drawObj._hide) {
            drawObj.draw(opts)
          }
        } catch (e) {
          drawObj._remove = true
          console.error('obj update error:', drawObj)
          console.error(e)
        }
        this.ctx.restore()
      } else {
        rmCount += 1
      }
    }
    return rmCount
  }

  /**
   * 渲染的迴圈
   * @param {number} now
   * @private
   */
  animate (now) {
    // 跟上次執行的時間差
    var elapsed = now - this._pre
    // 每次執行 += 上次的時間差，並在計算FPS時清除為0
    this._fpsAccumulate += elapsed
    if (true || this._fpsAccumulate > this._fpsInterval) {
      // 每算一個畫面該數值 + 1 , 每次計算FPS清除為0
      this._frames += 1
      // 目前為止總共計算出的畫面
      this._t += 1
      // 每三個畫面計算一次FPS
      if (this._t % 3 === 0) {
        var fps = Math.ceil(this._frames / (this._fpsAccumulate / 1000))
        if (fps < 260) {
          this.fps = fps
        }
        this._frames = 0
        this._fpsAccumulate = 0
      }
      var canvas = this.canvas
      var ctx = this.ctx
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      var opts = {
        manager: this,
        canvas,
        state: this.state,
        ctx,
        start: this._startTime,
        now,
        elapsed,
        rate: elapsed / 1000
      }
      var rmCount = this.render(opts, this._drawList)
      for (let id in this.tickers) {
        try {
          this.tickers[id](opts)
        } catch (e) {
          console.error(e)
          this.removeTicker(id)
        }
      }
      this._pre = now
      if (this.clearFlag || rmCount > 5) {
        this._clear(rmCount)
      }
    }
    if (this._pause) {
      this._running = false
      this.emit('stop', this)
    } else {
      requestAnimationFrame(this.animate)
    }
  }

  /**
   * 清理無用的物件 DrawObj
   * @param {number} rmCount
   * @private
   */
  _clear (rmCount) {
    log(`clear draw list (${rmCount})`)
    this.clearFlag = false
    let arr = new Array(this._drawList.length - rmCount)
    let t = 0
    for (let i = 0; i < this._drawList.length; i += 1) {
      let item = this._drawList[i]
      if (item && !item._remove) {
        arr[t] = item
        t += 1
      }
    }
    this._drawList = arr
    this.emit('clear')
  }
}
function getMousePos (canvas, e) {
  var rect = canvas.getBoundingClientRect() // abs. size of element
  var scaleX = canvas.width / rect.width // relationship bitmap vs. element for X
  var scaleY = canvas.height / rect.height // relationship bitmap vs. element for Y

  return {
    x: (e.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (e.clientY - rect.top) * scaleY // been adjusted to be relative to element
  }
}
function empty () {}
function log () {
  console.log.apply(this, ['%ccanvas-manager', 'color:blue', ...arguments])
}
module.exports = CanvasManager
