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
      centerX: 400,
      centerY: 400,
      loaded: false,
      lottieDatas: {},
      animationMap: {},
      currentAnimation: null,

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
    this.$canvas = this.$refs.canvas
    this.$ctx = this.$canvas.getContext('2d')
    let animation = null

    await this.loadLottieDatas()
    await this.initAnimalese()
    this.loaded = true

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

    this.$bus.$on('canvas-update', (data) => {
      console.log('onupdate', data)
      this.convState.playnext = data.playnext
      this.convState.nextcha = data.nexcha
      // this.sing = data.sing
      this.convState.msg = data.init
      this.convState.flag = data.show
      this.convState.output = data.output
      // flag 為是否顯示 "角色" 的台詞的判斷依據
      if (this.convState.flag) {
        this.showWord(data.output)
        this.playAudio(data.output)
      }
      this.showInput(data.input)
      this.convState.user = data.input

      this.convState.key = data.key
      this.play(data.cha)
    })

    this.$bus.$emit('page-ready')
    setTimeout(async () => {
      this.ready = true
      // manager.add('fps-chart', new FPSChart())
      let actions = this.createSingleAnimations()
      actions.throw = this.createThrowAnimation()
      let mainRole = new Role({
        width: 400,
        height: 400,
        defaultAction: 'original',
        actions
      }).on('update', (opts, role) => {
        var state = opts.state
      }).on('complete-action', (action, role) => {
        console.log('complete-action')
      })
      manager.add('main-role', mainRole)
      this.addMenu(manager)
      manager.add('mouse', new CustomMouse())
      manager.on('start', () => {
        // 當開始播放時，自動偵測並重置視窗大小
        manager.resize(window.innerWidth, window.innerHeight)
      })
      manager.on('after-setup', () => {
        console.log('draw objects')
        console.log(manager._drawList)
      })
      manager.start()
      this.addGarbage()
    }, 500)
  },
  beforeDestroy () {
    this.$bus.$off('canvas-update')
    window.removeEventListener('resize', this.resetSize)
    this.$canvasManager.destory()
  },
  methods: {
    roleMoveTo (target) {
      let manager = this.$manager
      let role = manager.get('main-role')
      role.target = target
      role.moving = true
      role.doAction('original')
      if (!role.$up) {
        let $up = () => {
          if (role.moving && role.target) {
            let t = role.target
            let cx = role.x + role.width / 2
            let cy = role.y + role.height / 2
            let dx = t.x - cx
            let dy = t.y - cy
            let distance = utils.distance(cx, cy, t.x, t.y)
            let move = Math.min(distance, 10)
            let mx = move * dx / distance
            let my = move * dy / distance
            role.x += mx
            role.y += my
            if (distance < 5) {
              role.x = t.x - role.width / 2
              role.y = t.y - role.height / 2
              t._remove = true
              role.moving = false
              role.emit('found', t, role)
            }
          }
        }
        role.$up = $up
        role.on('update', $up)
      }
    },
    findRandomGarbage () {
      let manager = this.$manager
      let role = manager.get('main-role')
      let list = this.garbageList.filter((item) => !item._remove)
      let g = list[Math.floor(Math.random() * list.length)]
      this.roleMoveTo(g)
    },
    findGarbage (title) {
      if (!title) {
        return this.findRandomGarbage()
      } else {
        let manager = this.$manager
        let role = manager.get('main-role')
        let list = this.garbageList.filter((item) => !item._remove && item.title === title)
        let g = list[Math.floor(Math.random() * list.length)]
        this.roleMoveTo(g)
      }
    },
    showInput (text) {
      const Input = require('./Input')
      let manager = this.$manager
      if (!manager.get('input')) {
        let input = new Input()
        manager.add('input', input)
        let role = manager.get('main-role')
        role.on('update', (opts) => {
          input.x = opts.canvas.width - 200
          input.y = role.y + 400
        })
      }
      manager.get('input').setInput(text)
    },
    showWord (text) {
      const Word = require('./Word')
      let manager = this.$manager
      if (!manager.get('word')) {
        let word = new Word()
        manager.add('word', word)
        let role = manager.get('main-role')
        role.on('update', () => {
          word.x = role.x + 40
          word.y = role.y
        })
      }
      manager.get('word').setText(text)
    },
    async addGarbage (type) {
      let Garbage = require('./Garbage')
      for (let i = 0; i < 5; i++) {
        let g = new Garbage({
          src: require('@/assets/bubble.png')
        })
        await g.load()
        this.garbageList.push(g)
        this.$manager.add(null, g)
      }
    },
    gotoRandomPos () {
      let mainRole = this.$manager.get('main-role')
      var canvas = this.$manager.canvas
      let e = {
        speed: 500,
        to: {
          x: Math.random() * (canvas.width - mainRole.width),
          y: Math.random() * (canvas.height - mainRole.height)
        }
      }
      console.log(e.to)
      mainRole.emit('move', e)
    },
    loadLottieDatas () {
      this.lottieDatas = {
        ball: require('@/assets/ball.json'),
        dancing: require('@/assets/dancing.json'),
        jumping: require('@/assets/jumping.json'),
        throw: require('@/assets/new_throwing.json'),
        nobg: require('@/assets/nobg.json'),
        nod_1: require('@/assets/nod_1.json'),
        original: require('@/assets/original.json'),
        rotate: require('@/assets/rotate.json'),
        shakeHead_1: require('@/assets/shakeHead_1.json'),
        talk_1: require('@/assets/talk_1.json'),
        talk_2: require('@/assets/talk_2.json'),
        talk_3: require('@/assets/talk_3.json'),
        talk_natural: require('@/assets/talk_natural.json')
      }
    },
    async restartAnimation () {
      if (this.currentAnimation) {
        this.currentAnimation.reset().play()
      }
    },
    resetSize () {
      let canvas = this.$canvas
      this.centerX = window.innerWidth / 2
      this.centerY = window.innerHeight / 2
      if (this.$manager._running) {
        this.$manager.resize(window.innerWidth, window.innerHeight)
      }
    },

    addAnimation (manager, name, animation) {
      manager.add(name, animation)
      this.animationMap[name] = animation
    },

    addMenu (manager) {
      let vue = this
      let bx = 10
      let diff = 0
      let btns = [
        new Button({
          font: '16px',
          ctx: manager.ctx,
          text: 'sim input'
        }).on('click', () => {
          this.$bus.$emit('canvas-update', {
            playnext: false,
            show: true,
            input: 'hahaha',
            output: 'Look! This is my ball! ',
            cha: 'throw',
            state: 'ANI',
            runnng: false
          })
        }),
        new Button({
          font: '16px',
          ctx: manager.ctx,
          text: 'find garbage'
        }).on('click', function () {
          console.log(this)
          vue.findGarbage()
        }),
        new Button({
          font: '16px',
          ctx: manager.ctx,
          text: 'generate garbage'
        }).on('click', () => {
          this.addGarbage()
        })
      ]
      // for (let actionName in manager.get('main-role').actions) {
      //   btns.push(new Button({
      //     font: '16px',
      //     x: 0,
      //     y: 0,
      //     ctx: manager.ctx,
      //     text: `Play "${actionName}"`
      //   }).on('click', () => {
      //     this.play(actionName)
      //   }))
      // }

      for (let item of btns) {
        item.x = bx + diff
        item.measure()
        diff += item.width + 10
        item.y = manager.height - item.height - 10
        manager.add(null, item)
      }
      manager.on('resize', () => {
        diff = 0
        for (let item of btns) {
          item.x = bx + diff
          item.measure()
          diff += item.width + 10
          item.y = manager.height - item.height - 10
        }
      })
    },
    createSingleAnimations () {
      let list = ['talk_1', 'talk_2', 'talk_3', 'original', 'rotate']
      let map = {}
      for (let name of list) {
        console.log(!!this.lottieDatas[name], name)
        map[name] = this.createByScript(
          {
            name,
            list: [
              {
                loop: true,
                type: 'LottieWrapper',
                params: {
                  data: this.lottieDatas[name],
                  width: 400,
                  height: 400,
                  autoplay: true
                },
                startByTime: 0,
                endByTime: 3300
              }
            ]
          }
        )
      }
      return map
    },
    createAnimation5 () {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/talk_2.json'),
                width: 400,
                height: 400,
                autoplay: true
              },
              startByTime: 0,
              endByTime: 10000
            }
          ]
        }
      )
    },
    createAnimation4 () {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/talk_1.json'),
                width: 400,
                height: 400,
                autoplay: true
              },
              startByTime: 0,
              endByTime: 10000
            }
          ]
        }
      )
    },
    createAnimation3 () {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/rotate.json'),
                width: 400,
                height: 400,
                autoplay: true
              },
              startByTime: 0,
              endByTime: 10000
            }
          ]
        }
      )
    },
    createThrowAnimation () {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/original.json'),
                width: 400,
                height: 400,
                autoplay: true
              },
              startByTime: 4700,
              endByTime: 10000
            },
            {
              type: 'SnowBall',
              params: {
                x: 266,
                y: 236,
                vx: 300,
                vy: -500,
                g: 2000
              },
              startByTime: 3500,
              endByTime: 10000
            },
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/new_throwing.json'),
                width: 400,
                height: 400,
                autoplay: true
              },
              onComplete: [
                'pause'
              ],
              startByTime: 0,
              endByTime: 4900
            }
          ]
        }
      )
    },
    createAnimation1 () {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/original.json'),
                width: 400,
                height: 400,
                autoplay: true
              },
              startByTime: 4700
            },
            {
              type: 'SnowBall',
              params: {
                x: 266,
                y: 236,
                vx: 50,
                vy: -100,
                g: 100
              },
              startByTime: 3500
            },
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/new_throwing.json'),
                width: 400,
                height: 400,
                autoplay: true
              },
              onComplete: [
                'pause'
              ],
              startByTime: 0,
              endByTime: 4900
            }
          ]
        }
      )
    },
    createByScript (script, types = {}) {
      return AnimationManager.createByScript(script, {
        LottieWrapper,
        SnowBall
      }).on('all-complete', (item) => {
        console.log(`item ${item.name} completed`)
      })
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
      console.log(this.$manager.get('main-role'))
      this.$manager.get('main-role').doAction(name)
    },

    initAnimalese () {
      return tools.getAnimalese()
    },

    generateWav (str) {
      return tools.generateVoice(str)
    },

    playAudio (str) {
      var audio = new Audio()
      audio.src = this.generateWav(str)
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
  canvas#canvas{
    cursor: none;
  }
  canvas:focus{
    outline: none;
  }
</style>
