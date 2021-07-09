const Text = require('./Text')

/**
 * @typedef {import('./DrawObj').UpdateOptions} UpdateOptions
 */

class Button extends Text {
  constructor (opts = {}) {
    super(opts)
    this.onClick = this.onClick.bind(this)
  }

  /**
   * @param {MouseEvent} e
   */
  onClick (e) {
    // console.log('on click', !this._remove, !this._hide, this.inRange(e.pos))
    if (!this._remove && !this._hide && this.inRange(e.pos)) {
      console.log(`btn(${this.text}) clicked`)
      this.emit('click', e)
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    super.setup(opts)
    this.manager = opts.manager
    this.manager.off('click', this.onClick)
    this.manager.on('click', this.onClick)
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    super.update(opts)
    let s = opts.state
    this.hover = this.inRange({ x: s.mouseX, y: s.mouseY })
    if (!this.motion.fadeout) {
      if (this.hover) {
        if (s.mousedown) {
          this.alpha = 0.6
        } else {
          this.alpha = 0.8
        }
      } else {
        this.alpha = 1
      }
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    super.draw(opts)
  }
}
module.exports = Button
