const DrawObj = require('@/lib/animation/draw/DrawObj')
const AnimationManager = require('@/lib/animation/draw/AnimationManager')
/**
 * @typedef {import('@/lib/animation/CanvasManager').UpdateOptions} UpdateOptions
 */
/**
 * @typedef {Object} RoleOptions
 * @property {Object.<string, AnimationManager>} actions
 * @property {string} defaultAction
 */
class Role extends DrawObj {
  /**
   * @param {RoleOptions} opts
   */
  constructor (opts = {}) {
    super(opts)
    let defaultAction = opts.defaultAction || 'default'
    this.defaultActionName = opts.defaultAction
    /**
     * @type {Object.<string, AnimationManager>}
     */
    this.actions = opts.actions || {}
    if (!opts.actions[defaultAction]) {
      throw new Error('無法取得必要參數')
    }
    /**
     * @type {AnimationManager}
     */
    this.currentAction = opts.actions[defaultAction]
    for (let actionName in this.actions) {
      let action = this.actions[actionName]
      action.on('all-complete', () => {
        if (actionName !== this.defaultActionName) {
          this.doAction(this.defaultActionName)
          // this.emit('complete-action', action, this)
        }
      })
    }
  }

  getDefaultAction () {
    return this.actions[this.defaultActionName]
  }

  doAction (name) {
    if (this.actions[name]) {
      console.log(`role(${this.name}) do: ${name}`)
      let prev = this.currentAction
      let next = this.actions[name]
      console.log('%cprev,next', 'color:red')
      console.log(prev, next)
      if (prev === next) {
        next.reset().play()
      } else {
        prev.play()
        next.reset().play()
        this.currentAction = next
        this.once('update', (opts) => {
          prev.pause().hide()
        })
      }
      // console.log('this.currentAction', this.currentAction)
      // this.emit('start-action', {
      //   name
      // })
    } else {
      console.warn('not found action', `%c${name}`, 'color:red')
    }
  }

  /**
   * @param {UpdateOptions} opts
   */
  setup (opts) {
    super.setup(opts)
    for (let key in this.actions) {
      let action = this.actions[key]
      action.setup(opts)
    }
    this.manager = opts.manager
  }

  /**
   * @param {UpdateOptions} opts
   */
  update (opts) {
    super.update(opts)
    this.currentAction.update(opts)
    this.emit('update', opts, this)
  }

  /**
   * @param {UpdateOptions} opts
   */
  draw (opts) {
    var ctx = opts.ctx
    ctx.translate(this.x, this.y)
    this.currentAction.draw(opts)
  }
}
module.exports = Role
