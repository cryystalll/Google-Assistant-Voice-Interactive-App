const DrawObj = require('@/lib/animation/draw/DrawObj')
/**
 * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 *
 */
class ExampleDraw extends DrawObj {
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
  draw (opts) {}
  /**
   * @param {Error} err
   */
  // 要 override 再解除註解
  // destory (err) {
  //   super.destory(err)
  // }
}
module.exports = ExampleDraw
