
const DrawObj = require('@/lib/animation/draw/DrawObj')
/**
 * @typedef {import('./CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 *
 */
class Snow extends DrawObj {
  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    this.x = opts.canvas.width/2
    this.y = opts.canvas.height/2
    this.finalx = Math.random() * (opts.canvas.width - this.width)
    this.finaly = Math.random() * (opts.canvas.height - this.height)
    this.vx = Math.random() * 20 + 10
    this.vy = Math.random() * 20 + 10
    this.r = 5
    this.op = 1
    this.g = 200
    this.fast = 0.8
    this.slow = 0.1
    this.floor = 600
    this.water = 200
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    if (this.vx < 0.1) {
      this.vx = 0
    }
    if (this.vy < 0.1) {
      this.vy = 0
    }
    // this.op -= 0.02
    if (this.y <= this.water) {
      this.y += this.vx * this.fast
      this.x += this.vy * this.fast
      // this.op -= 0.1
      // if (this.op < 0.1) {
      //   this._remove = true
      // }
    } else if (this.y <= this.floor) {
      this.x += this.vx * this.slow
      this.y += this.vy * this.slow
    } else {
      this.y += 0
      this.x += 0
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    ctx.fillStyle = `rgba(150, 75, 75, ${this.op})`
    ctx.fill()
  }

//   /**
//    * @param {Error} err
//    */
//   destory (err) {
//     if (err) {
//       console.error(err)
//     }
//   }
// }
}
module.exports = Snow

// let obj = {
//   y: Math.random() * h,
//   x: Math.random() * (canvas.width - w),
//   vx: Math.random() * 20 + 10,
//   vy: Math.random() * 20 + 10,
//   r: 5,
//   w,
//   h,
//   op: 1
// }
// obj.update = () => {
//   if (obj.vx < 0.1) {
//     obj.vx = 0
//   }
//   if (obj.vy < 0.1) {
//     obj.vy = 0
//   }
//   obj.op -= 0.02
//   if (obj.y >= canvas.height) {
//     obj.y = canvas.height
//     obj.op -= 0.1
//     if (obj.op < 0.1) {
//       obj._remove = true
//     }
//   } else {
//     obj.x += obj.vx
//     obj.y += obj.vy
//   }
// }
// obj.draw = (ctx) => {
//   ctx.beginPath()
//   ctx.arc(obj.x, obj.y, obj.r, 0, 2 * Math.PI)
//   ctx.fillStyle = `rgba(150, 75, 75, ${obj.op})`
//   ctx.fill()
// }
