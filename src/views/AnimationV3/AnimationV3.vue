<template>
  <div id="role">
    <div style="display: inline-block; height: 300px;"></div>
    <div ref="container">
      <canvas
        v-show="ready && loaded"
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
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable prefer-const */
import lottie from 'lottie-web'

const FPSChart = require('@/lib/animation/draw/FPSChart')
const Text = require('@/lib/animation/draw/Text')
const Button = require('@/lib/animation/draw/Button')
const Point = require('@/lib/animation/draw/Point')
const LottieWrapper = require('@/lib/animation/draw/LottieWrapper')
const CustomMouse = require('@/lib/animation/draw/CustomMouse')

function delay (t) {
  return new Promise((resolve) => {
    setTimeout(resolve, t)
  })
}
/**
 * @typedef {import('@/lib/CanvasManager')} CanvasManager
 */
/**
 * @typedef {import('@/lib/CanvasManager').UpdateOptions} UpdateOptions
 */
export default {
  data () {
    return {
      ready: false,
      lottieMap: {},
      drawMap: {},
      drawList: [],
      centerX: 400,
      centerY: 400,
      loaded: false,
      animations: []
    }
  },
  computed: {
  },
  async mounted () {
    window.app = this
    this.$canvas = this.$refs.canvas
    this.$ctx = this.$canvas.getContext('2d')
    let animation = null

    await this.loadLottieAnimation()
    this.loaded = true
    this.$synth = new window.Animalese('/animalese.wav', () => {
      console.log('setup animalese voice')
    })
    console.log(this.$synth)

    const CanvasManager = require('@/lib/animation/CanvasManager')
    let manager = this.$canvasManager = new CanvasManager({
      canvas: this.$canvas
    })
    this.$manager = this.$canvasManager
    window._drawMap = this.$manager._drawMap

    this.resetSize()
    window.addEventListener('resize', this.resetSize)

    setTimeout(() => {
      this.ready = true
      manager.add('mouse', new CustomMouse())
      let addBtn = new Button({
        font: '16px',
        x: 100,
        y: 100,
        text: 'ADD'
      }).on('click', (e) => {
        addBtn.num = addBtn.num || 0
        addBtn.text = 'ADD-' + addBtn.num
        addBtn.num += 1
        this.runScript()
      })
      manager.on('click', (e) => {
        this.runScript()
        // let p = new Point({
        //   x: e.pos.x,
        //   y: e.pos.y,
        //   _hide: false
        // })
        // let text = new Text({
        //   ref: p,
        //   y: 50,
        //   text: `(${p.x},${p.y})`
        // })
        // text.on('setup', () => {
        //   text.x = -text.width / 2
        // })
        // manager.add(null, p)
        // manager.add(null, text)
      })
      manager.add(null, addBtn)
      manager.add('fps-chart', new FPSChart({
        x: 0,
        y: 0,
        _hide: false,
        style: 'red'
      }))
      const SnowFlake = require('./Snowflake')
      manager.add(null, new SnowFlake())
      manager.on('resize', () => {
        let fpsChart = manager.get('fps-chart')
        fpsChart.y = manager.canvas.height - fpsChart.height
        console.log('resize', fpsChart)
      })
      manager.add('lottie1', new LottieWrapper({
        anim: this.lottieMap['original'],
        width: 400,
        height: 400,
        autoplay: false
      }))
      manager.add('lottie2', new LottieWrapper({
        anim: this.lottieMap['throw'],
        width: 400,
        height: 400,
        autoplay: false
      }))
      manager.on('start', () => {
        manager.resize(window.innerWidth, window.innerHeight)
      })
      manager.on('after-setup', () => {
        console.log('draw objects')
        console.log(manager._drawList)
      })
      manager.start()
    }, 500)
  },
  beforeDestroy () {
    this.$bus.$off('canvas-update')
    window.removeEventListener('resize', this.resetSize)
    this.$canvasManager.destory()
  },
  methods: {
    async runScript () {
      var m = this.$manager
      let anim1 = m.get('lottie1')
      let anim2 = m.get('lottie2')
      // anim1.stop()
      await anim2.play().onFrame(100)
      this.addSnowBall(anim2.x + 269, anim2.y + 250, anim2.y + anim2.height / 2 + 70)
      await anim2.play().onFrame(148)
      anim2.stop()
      anim2._hide = true
      await anim1.play().onComplete()
      anim1.stop()
    },
    resetSize () {
      let canvas = this.$canvas
      this.centerX = window.innerWidth / 2
      this.centerY = window.innerHeight / 2
      if (this.$manager._running) {
        this.$manager.resize(window.innerWidth, window.innerHeight)
      }
    },
    async loadLottieAnimation () {
      this.addAnimation('new-1', await import('@/assets/lottie/dig.json'))
      this.addAnimation('car', await import('@/assets/lottie/car.json'))
      this.addAnimation('natural', await import('@/assets/talk_natural.json'))
      // this.addAnimation('onion', await import('@/assets/data.json'))
      this.addAnimation('t1', await import('@/assets/talk_1.json'))
      this.addAnimation('t2', await import('@/assets/talk_2.json'))
      this.addAnimation('t3', await import('@/assets/talk_3.json'))
      this.addAnimation('rotate', await import('@/assets/rotate.json'))
      this.addAnimation('dance', await import('@/assets/dancing.json'))
      this.addAnimation('yes1', await import('@/assets/nod_1.json'))
      this.addAnimation('no1', await import('@/assets/shakeHead_1.json'))
      this.addAnimation('jump', await import('@/assets/jumping.json'))
      this.addAnimation('original', await import('@/assets/original.json'))
      this.addAnimation('octopus', await import('@/assets/nobg.json'))
      this.addAnimation('throw', await import('@/assets/new_throwing.json'))
    },
    async addAnimation (name, data) {
      let animation = lottie.loadAnimation({
        name,
        renderer: 'canvas',
        autoplay: false,
        animationData: data,
        rendererSettings: {
          context: this.$ctx,
          clearCanvas: false
        }
      })
      if (name) {
        this.lottieMap[name] = animation
      }
      return animation
    },
    addSnowBall (x = 100, y = 100, floor = 400) {
      const SnowBall = require('./SnowBall')
      this.$manager.add('snow_ball', new SnowBall({
        x,
        y,
        vy: -100,
        floor
      }))
    },

    play (name) {
      lottie.stop(this.current)
      lottie.play(name)
      this.current = name
    },

    dataURItoBlob (dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString
      if (dataURI.split(',')[0].indexOf('base64') >= 0) {
        byteString = atob(dataURI.split(',')[1])
      } else {
        byteString = unescape(dataURI.split(',')[1])
      }

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length)
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }

      return new Blob([ia], { type: mimeString })
    },

    generateWav (str) {
      return this.$synth.Animalese(str, false, 1.0).dataURI
    },

    playAudio (str) {
      console.log(str)
      var audio = new Audio()
      audio.src = this.generateWav(str)
      console.log(audio.src)
      audio.play()
    }
  }
}
</script>
<style>
  @import url("https://fonts.googleapis.com/css?family=Caveat");
  @import url("https://fonts.googleapis.com/css?family=Orbitron");
  @import url("https://fonts.googleapis.com/css?family=Indie+Flower");
  @import url("https://fonts.googleapis.com/css?family=Economica");
  @import url("https://fonts.googleapis.com/css?family=Noto+Serif+TC");
  @import url("https://fonts.googleapis.com/css?family=Fredericka+the+Great");
  @font-face {
    font-family: "abc";
    src: url("https://fonts.googleapis.com/earlyaccess/cwtexyen.css");
  }
  body {
    margin: 0;
    padding: 0;
    /* height: 100%; */
    /*background: #000;*/
    /* overflow: hidden; */
    background-color: lightsteelblue;
  }
  canvas{
    cursor: none;
  }
  canvas:focus{
    outline: none;
  }
</style>
