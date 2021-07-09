const DrawObj = require('@/lib/animation/draw/DrawObj')
/**
 * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 *
 */
class ImageView extends DrawObj {
  /**
   *
   * @param {{ image: Image }} opts
   */
  constructor (opts = {}) {
    super(opts)
    if (opts.image) {
      this.image = opts.image
      this.loaded = opts.image.complete
    } else if (opts.src) {
      this.src = opts.src
      this.loaded = false
    }
  }

  load () {
    if (!this.loaded) {
      if (!this.image) {
        if (this.src) {
          this.image = new Image()
          this.image.src = this.src
        } else {
          throw new Error('尚未設置圖片來源')
        }
      }
      let img = this.image
      this.loaded = img.complete
      return new Promise((resolve, reject) => {
        if (!img.complete) {
          img.onload = () => {
            this.loaded = true
            resolve(this)
          }
          img.onerror = (err) => {
            this.loaded = true
            reject(err)
          }
        } else {
          this.loaded = true
          resolve(this)
        }
      })
    } else {
      return Promise.resolve(this)
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {}
  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {}
  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    if (this.loaded) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
    // ctx.beginPath()
    // ctx.rect(this.x, this.y, this.width, this.height)
    // ctx.stroke()
  }
  /**
   * @param {Error} err
   */
  // 要 override 再解除註解
  // destory (err) {
  //   super.destory(err)
  // }
}
module.exports = ImageView
