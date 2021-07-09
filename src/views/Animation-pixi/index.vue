<template>
  <div>
    <div style="display: inline-block; height: 300px;"></div>
    <div>
      <canvas
        height="800"
        width="800"
        style="position:fixed; top:0px; left:0px; "
        tabindex="0"
        ref="canvas"
      ></canvas>
    </div>
  </div>
</template>

<script>
const PIXI = require('@/lib/pixi')
export default {
  data () {
    return {

    }
  },
  mounted () {
    let app = new PIXI.Application({
      view: this.$refs.canvas
    })
    /**
     * @type {PIXI.Application}
     */
    this.$pixi = app
    window.pixi = app
  }
}
</script>

<style>

</style>
