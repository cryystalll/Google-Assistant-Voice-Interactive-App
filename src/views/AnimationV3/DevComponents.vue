<template>
  <div id="role">
    <div style="display: inline-block; height: 300px;"></div>
    <div ref="container">
      <canvas
        id="canvas"
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
import _ from 'lodash'
import lottie from 'lottie-web'
import SnowBall from './SnowBall'
import * as tools from '@/lib/tools'
import * as utils from '@/lib/animation/tools/utils'
import Garbage from './Garbage'

const CanvasManager = require('@/lib/animation/CanvasManager')
const FPSChart = require('@/lib/animation/draw/FPSChart')
const Text = require('@/lib/animation/draw/Text')
const Button = require('@/lib/animation/draw/Button')
const Point = require('@/lib/animation/draw/Point')
const LottieWrapper = require('@/lib/animation/draw/LottieWrapper')
const CustomMouse = require('@/lib/animation/draw/CustomMouse')
const ImageView = require('@/lib/animation/draw/ImageView')
const Animation = require('@/lib/animation/draw/Animation')
const AnimationManager = require('@/lib/animation/draw/AnimationManager')
const Role = require('./Role')

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
      drawMap: {},
      drawList: [],
      centerX: 500,
      centerY: 500,
      loaded: false,
      lottieDatas: {},
      animationMap: {},
      currentAnimation: null,
      garbageRemain: 0,
      garbageList: [],
      backpack: [],
      convState: {
        flag: false
      }
    }
  },
  computed: {
  },
  async mounted () {
    console.log('%cpage mounted', 'color:blue')
    let canvas = this.$canvas = this.$refs.canvas
    this.$ctx = this.$canvas.getContext('2d')
    this.loaded = true

    this.resetSize()
    let manager = this.$canvasManager = new CanvasManager({
      canvas: this.$canvas
    })
    this.$manager = this.$canvasManager

    // DEBUG 用
    window.app = this
    window._drawMap = this.$manager._drawMap
    window.mm = manager
    /**
     * 一開始或視窗大小改變時，執行 resetSize，該function將會重設
     * canvas 的大小，
     */
    this.resetSize()
    window.addEventListener('resize', this.resetSize)

    this.$on('game-start', async () => {
      this.showWord('45456')
    })

    this.$bus.$emit('page-ready')
    delay(500).then(() => {
      this.ready = true
      window.addEventListener('resize', () => {
        this.resetSize()
      })
      manager.start()
      this.$emit('game-start')
    })
  },
  beforeDestroy () {
    this.$bus.$off('canvas-update')
    window.removeEventListener('resize', this.resetSize)
    this.$canvasManager.destory()
  },
  methods: {
    resetSize () {
      let canvas = this.$canvas
      this.centerX = window.innerWidth / 2
      this.centerY = window.innerHeight / 2
      if (this.$manager) {
        if (this.$manager._running) {
          this.$manager.resize(window.innerWidth, window.innerHeight)
        }
      } else {
        this.$canvas.height = window.innerHeight
        this.$canvas.width = window.innerWidth
      }
    },
    /**
     * 顯示角色的台詞(會在角色頭上)
     */
    showWord (text) {
      let manager = this.$manager
      if (!manager.get('word')) {
        const Word = require('./WordV2')
        let word = new Word()
        manager.add('word', word)
      }
      manager.get('word').setText(text, 0)
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
  canvas#canvas{
    /* cursor: none; */
  }
  canvas:focus{
    outline: none;
  }
</style>
