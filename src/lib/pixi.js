let PIXI = require('pixi.js')

if (PIXI.utils.isWebGLSupported()) {
  console.log('%cWebGL is support', 'color:blue')
} else {
  console.log('%cWebGL is not support', 'color:red')
  PIXI = require('pixi.js-legacy')
}
window.PIXI = PIXI
module.exports = PIXI
