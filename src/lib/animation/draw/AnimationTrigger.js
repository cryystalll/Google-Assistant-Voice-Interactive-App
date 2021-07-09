const Animation = require('./Animation')

/**
 * @typedef {import('./AnimationManager').ExUpdateOptions} ExUpdateOptions
 */

class AnimationTrigger extends Animation {
  constructor (opts = {}) {
    // eslint-disable-next-line no-this-before-super
    opts.obj = this
    super(opts)
    this.detect = opts.detect.bind(this)
  }

  update (opts) {
    if (!this.isPaused) {
      this._elapsed += opts.elapsed
      this.detect(opts)
    }
  }

  draw (opts) {}

  toJSON () {
    let obj = { ...this }
    obj.obj = '<self>'
    return obj
  }
}
module.exports = AnimationTrigger
