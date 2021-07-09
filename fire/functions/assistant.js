class Assistant {
  /**
     * @param  {Phaser.Scene} scene which serves as a container of all visual
     * and audio elements.
     */
  constructor (scene) {
    this.canvas = window.interactiveCanvas
    this.gameScene = scene
    /* ADD CODE HERE to update command map: */
    const that = this
    this.commands = { // onUpdate執行command中相對應的function()
      ANS: function (data) {

      },
      ANI: function (data) {

      },
      NEW_GAME: function (data) {

      },
      DEFAULT: function () {
        // do nothing
      }
    }

    /* END */
  }

  setCallbacks () {
    const that = this
    // Declare the Interactive Canvas action callbacks.
    const callbacks = {
      onUpdate (data) {
        /* ADD CODE HERE to update callback: */
        that.commands[data.state ? data.state.toUpperCase() : 'DEFAULT'](data)
        /* END */
      }
    }
    // Called by the Interactive Canvas web app once web app has loaded to
    // register callbacks.
    this.canvas.ready(callbacks)
  }
}
