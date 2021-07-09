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
      speech: {
        '一開始-0': 'Hi, so glad you came.',
        '一開始-1': 'Do you see the trash around me?',
        '一開始-2': ' Please tell the name of each trash and ...',
        '一開始-3': 'I will try to collect them first.',
        '一開始-4': 'Now what is the first trash you see?',
        '撿到第N個-0': 'What is the second trash you see?',
        '撿到第N個-1': 'What is the third trash you see?',
        '當user叫章魚撿垃圾': 'got it',
        '當user叫章魚撿垃圾-但找不到': 'i cannot find the thing',
        '撿完所有垃圾': 'Lovely!',
        '撿完所有垃圾-回到中間-0': 'I have three types of trash at hand now!',
        '撿完所有垃圾-回到中間-1': 'The ocean is still seriously polluted...',
        '撿完所有垃圾-回到中間-2': 'Now I need some energy from you to throw ...',
        '撿完所有垃圾-回到中間-3': 'the trash up above the water.',
        '撿完所有垃圾-回到中間-4': 'As story is my food and will give me energy,',
        '撿完所有垃圾-回到中間-5': 'please tell me a story that includes ',
        '撿完所有垃圾-回到中間-6': 'the names of these three types of trash.',
        '撿完所有垃圾-回到中間-7': 'Ready? Please go ahead and tell me your fascinating story!',
        'END-A-0': 'You are superb! Energy received!',
        'END-A-1': 'The trash are gone now.',
        'END-A-2': "Let's swim together in this clearest blue ocean!",
        'END-B-0': 'Oh... Looks like your story did not include the names',
        'END-B-1': 'of these three types of trash.',
        'END-B-2': 'Would you help me again?',
        'END-B-3': 'Please go ahead and tell me your fascinating story!'
      },
      ready: false,
      gameState: 'game-finish',
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
      started: false,
      convState: {
        flag: false
      },
      skipSpeech: false
    }
  },
  computed: {
  },
  async mounted () {
    console.log('%cpage mounted', 'color:blue')
    let canvas = this.$canvas = this.$refs.canvas
    this.$ctx = this.$canvas.getContext('2d')
    let animation = null
    // 載入動畫資料
    await this.loadLottieDatas()
    // 初始化聲音工具
    await this.initAnimalese()
    this.loaded = true

    let manager = this.$canvasManager = new CanvasManager({
      canvas: this.$canvas
    })
    manager.setCursor('crosshair')
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
    const BubbleEffect = require('./BubbleEffect')
    manager.add(null, new BubbleEffect())

    // this.showWord('hi I am glad to see you , do you want to play game ?hihihihihihihhjljnlibsndflknjlfjslknrf.sjnf.')

    this.$once('game-start', () => {
      manager.get('start-btn')._hide = true
      manager.get('main-role')._hide = false
      this.started = true
    })
    this.$on('role-got-one-garbage', (i) => {
      this.roleSpeech(`撿到第N個-${i}`, 1, 3000)
    })
    this.$on('role-got-all-garbage', () => {
      this.roleSpeech('撿完所有垃圾', 1, 3500)
    })
    this.$on('role-got-all-garbage-backto-center', () => {
      this.roleSpeech('撿完所有垃圾-回到中間-{i}', 8, 3500)
      this.gameState = 'wait-story'
    })
    this.$on('game-end-A', () => {
      this.roleSpeech('END-A-{i}', 3, 3500)
      this.gameState = 'game-finish'
    })
    this.$on('game-end-B', () => {
      this.roleSpeech('END-B-{i}', 4, 3500)
    })
    this.$bus.$on('canvas-update', (data) => {
      console.log(this.started)
      console.log('onupdate', data)
      if (data) {
        if (!this.started && data.input) {
          let input = data.input
          // if (input.indexOf('story') !== -1) {
          //   this.$emit('game-start')
          // }
          if (input.indexOf('start') !== -1) {
            this.play('original')
            this.$emit('game-start')
          }
        } else if (data.cha === 'story') {
          // this.$emit('game-start')
          this.gameState = 'start-story'
          this.addGarbage(3)
          this.roleSpeech('一開始-{i}', 5, 3000)
        } else if (this.gameState === 'wait-story') {
          let input = data.input
          if (input) {
            if (this.include(input, ['cup', 'polybag', 'straw'])) {
              this.$emit('game-end-A')
            } else {
              this.$emit('game-end-B')
            }
          } else {
            this.$emit('game-end-B')
          }
          // return
        } else if (data.cha === 'dance' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play(data.cha)
          let r = manager.get('main-role')
          let t = 0
          manager.removeTicker('role-speech')
          manager.replaceTicker((option) => {
            t += option.elapsed
            let cx = option.canvas.width / 2 - r.width / 2
            let cy = option.canvas.height / 2 - r.height / 2
            if (t < 500) {
              r.x = cx + 100
              r.y = cy - 50
            } else if (t < 1000) {
              r.x = cx - 100
              r.y = cy + 50
            } else if (t < 1500) {
              r.x = cx + 100
              r.y = cy - 100
            } else if (t < 2000) {
              r.x = cx
              r.y = cy
            }
          }, 'role-action')
        } else if (data.cha === 'right' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play('jumping')
          let r = manager.get('main-role')
          let t = 0
          let current = r.x
          r.target = {
            x: 100 + r.x + r.width / 2,
            y: r.y + r.height / 2
          }
          r.moving = true
          manager.removeTicker('role-speech')
          manager.removeTicker('role-action')
          // manager.replaceTicker((option) => {
          //   t += option.elapsed
          //   let cx = option.canvas.width / 2 - r.width / 2
          //   let cy = option.canvas.height / 2 - r.height / 2
          //   // r.x = current + 100
          //   r.target = {
          //     x: current + 100,
          //     y: r.y
          //   }

          // }, 'role-action')
        } else if (data.cha === 'left' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play('jumping')
          let r = manager.get('main-role')
          let t = 0
          let current = r.x
          r.target = {
            x: r.x - 100 + r.width / 2,
            y: r.y + r.height / 2
          }
          r.moving = true
          manager.removeTicker('role-speech')
          manager.removeTicker('role-action')
        } else if (data.cha === 'down' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play('jumping')
          let r = manager.get('main-role')
          let t = 0
          let current = r.y
          r.target = {
            x: r.x + r.width / 2,
            y: r.y + 100 + r.height / 2
          }
          r.moving = true
          manager.removeTicker('role-speech')
          manager.removeTicker('role-action')
        } else if (data.cha === 'up' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play('jumping')
          let r = manager.get('main-role')
          let t = 0
          let current = r.y
          r.target = {
            x: r.x + r.width / 2,
            y: r.y - 100 + r.height / 2
          }
          r.moving = true
          manager.removeTicker('role-speech')
          manager.removeTicker('role-action')
        } else if (data.cha === 'sing' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play(data.cha)
          let r = manager.get('main-role')
          let t = 0
          manager.removeTicker('role-speech')
          manager.replaceTicker((option) => {
            t += option.elapsed
            let cx = option.canvas.width / 2 - r.width / 2
            let cy = option.canvas.height / 2 - r.height / 2
            if (t < 500) {
              r.x = cx + 100
              r.y = cy - 50
              this.play(data.nextcha)
            } else if (t < 1000) {
              r.x = cx - 100
              r.y = cy + 50
              this.play(data.cha)
            } else if (t < 1500) {
              r.x = cx + 100
              r.y = cy - 100
              this.play(data.nextcha)
            } else if (t < 2000) {
              r.x = cx
              r.y = cy
              this.play(data.cha)
            } else if (t < 2500) {
              r.x = cx + 100
              r.y = cy - 50
              this.play(data.nextcha)
            } else if (t < 3000) {
              r.x = cx - 100
              r.y = cy + 50
              this.play(data.cha)
            }
          }, 'role-action')
        } else if (data.cha === 'throw' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play(data.cha)
        } else if (data.cha === 'jump' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play(data.cha)
        } else if (data.cha === 'original' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play(data.cha)
        } else if (data.cha === 'yes1' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play(data.cha)
        } else if (data.cha === 'no1' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play(data.cha)
        } else if (data.cha === 'rotate' && this.gameState !== 'start-story') {
          this.showInput(data.input)
          this.play(data.cha)
          let r = manager.get('main-role')
          let t = 0
          manager.removeTicker('role-speech')
          manager.replaceTicker((option) => {
            t += option.elapsed
            // let cx = option.canvas.width / 2 - r.width / 2
            // let cy = option.canvas.height / 2 - r.height / 2
            if (t < 3000) {
              this.play(data.cha)
            } else if (t < 6000) {
              // this.play('talk_2')
              if (data.show) {
                this.showWord(data.output)
                this.playAudio(data.output)
              }
            }
          }, 'role-action')
        } else if (data.cha === 'talk_natural' && this.gameState !== 'start-story') {
          if (data.show) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          this.play(data.cha)
        }

        if (data.v2) {
          let role = manager.get('main-role')
          let canvas = manager.canvas
          // 新流程
          // data.show 為是否顯示 "角色" 的台詞的判斷依據
          if (data.show && data.output) {
            this.showWord(data.output)
            this.playAudio(data.output)
          }
          this.showInput(data.input)
          if (data.action) {
            if (data.action === 'find-object') {
              console.log('garbage remain:', this.garbageRemain)
              let {
                garbage: g
              } = this.findGarbage(data.target)
              if (g) {
                // let txt = this.speech['當user叫章魚撿垃圾'].replace('{itemName}', g.title)
                // this.showWord(txt)
                // this.playAudio(txt)
                this.play('jumping')
                this.toFindGarbage(g)
              } else {
                if (this.garbageRemain > 0) {
                  let txt = this.speech['當user叫章魚撿垃圾-但找不到']
                  this.showWord(txt)
                  this.playAudio(txt)
                }
              }
              // END OF ( data.action === 'find-object' )
            }
          }
        }
      }
    })

    this.$bus.$emit('page-ready')

    delay(500).then(() => {
      this.ready = true
      let actions = this.createRoleActions(500)
      let mainRole = new Role({
        width: 500,
        height: 500,
        defaultAction: 'original',
        actions,
        _hide: true
      }).on('update', (opts, role) => {
        var state = opts.state
      }).on('complete-action', (action, role) => {
        console.log('complete-action')
      })
      // console.log('role:', mainRole)
      window.r = mainRole
      manager.add('main-role', mainRole)
      this.setupRoleMoveAction(mainRole)
      this.setupRoleEvent(mainRole)

      // this.addMenu(manager)

      // manager.add('mouse', new CustomMouse())
      manager.on('start', () => {
        // 當開始播放時，自動偵測並重置視窗大小
        manager.resize(window.innerWidth, window.innerHeight)
      })
      manager.on('after-setup', () => {
        console.log('draw objects')
        console.log(manager._drawList)
      })
      let startBtn = new Button({
        text: 'START',
        _hide: true,
        font: '1.3rem Roboto Mono'
      }).on('click', () => {
        this.$emit('game-start')
      })
      startBtn.measure(manager.ctx)
      manager.add('start-btn', startBtn)
      manager.once('resize', () => {
        startBtn._hide = false
        startBtn.x = (canvas.width - startBtn.width) / 2
        startBtn.y = (canvas.height - startBtn.height) / 2
        mainRole.x = (canvas.width - mainRole.width) / 2
        mainRole.y = (canvas.height - mainRole.height) / 2
      })
      manager.showFPS(false)
      manager.start()
    })
  },
  beforeDestroy () {
    this.$bus.$off('canvas-update')
    window.removeEventListener('resize', this.resetSize)
    this.$canvasManager.destory()
  },
  methods: {
    createRoleActions (size = 500) {
      let actions = this.createSingleAnimations(size)
      actions.throw = this.createThrowAnimation(size)
      actions.eat = this.createEatAnimation(size)
      actions.no1 = this.createShakeHeadAnimation(size)
      actions.yes1 = this.createNodHeadAnimation(size)
      actions.rotate = this.createRotateAnimation(size)
      // actions.no = actions.no1
      actions.jump = actions.jumping
      // actions.yes = actions.yes1
      actions.dance = this.createDanceAnimation(size)
      // actions.talk = actions.talk_natural
      return actions
    },
    roleSpeech (list = [], N = list.length, defaultDelay = 3000) {
      if (typeof list === 'string') {
        list = [[list]]
      }
      let manager = this.$manager
      manager.removeTicker('role-speech')
      let txt
      N = N || list.length
      console.log('N:', N, list, list.length)
      if (N > list.length) {
        let last = list[list.length - 1]
        for (let i = list.length; i < N; i++) {
          list.push(last)
        }
      }
      let i = 0
      console.log('N:', N, list, list.length)
      // time => 經過的時間
      let time = list[i][1] || defaultDelay
      let delay = list[i][1] || defaultDelay
      let cursorPressed = false
      manager.replaceTicker((opts) => {
        let role = manager.get('main-role')
        let canvas = manager.canvas
        let txt
        if (cursorPressed && !opts.state.cursorPressed) {
          time = delay
        } else {
          time += opts.elapsed
        }
        cursorPressed = opts.state.cursorPressed
        if (i < N) {
          if (time >= delay) {
            time = 0
            let speechId = list[i][0]
            if (speechId) {
              speechId = speechId.replace('{i}', i)
            }
            console.log('speechId', speechId)
            txt = this.speech[speechId]
            if (!txt) {
              manager.removeTicker('role-speech')
            } else {
              manager.get('main-role').doAction('talk_2')
              this.showWord(txt)
              this.playAudio(txt)
            }
            i += 1
            if (i < N) {
              delay = list[i][1] || defaultDelay
            }
          }
        } else {
          manager.removeTicker('role-speech')
        }
      }, 'role-speech')
    },
    /**
     * 設定角色相關的事件
     */
    setupRoleEvent (role) {
      let manager = this.$manager
      let canvas = manager.canvas
      /**
       * 設定主要角色在找到某個東西後要幹嘛
       */
      role.on('found', (target) => {
        if (target instanceof Garbage && this.garbageRemain > 0) {
          this.garbageRemain -= 1
          target._remove = true
          this.$emit('role-got-one-garbage', (3 - this.garbageRemain))
          if (this.garbageRemain === 0) {
            role.emit('found-all-object')
          }
        }
      })
      /**
       * 設定主要角色在找完所有東西後要幹嘛
       */
      role.on('found-all-object', () => {
        this.$emit('role-got-all-garbage')
        role
          .once('m-move-end', async () => {
            this.$emit('role-got-all-garbage-backto-center')
          })
          .emit('move', {
            to: {
              x: canvas.width / 2 - role.width / 2,
              y: canvas.height / 2 - role.height / 2
            }
          })
      })
    },
    /**
     * 設定主要角色的移動方式
     */
    setupRoleMoveAction (role) {
      let manager = this.$manager
      if (!role.$up) {
        role.target = null
        role.moving = false
        let $up = () => {
          // console.log(role.moving, role.target)
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
              role.target = null
              role.moving = false
              role.emit('found', t, role)
            }
          }
        }
        role.$up = $up
        role.on('update', $up)
      }
    },
    toFindGarbage (target) {
      let manager = this.$manager
      let canvas = manager.canvas
      let role = manager.get('main-role')
      if (!target) return
      role.target = target
      role.moving = true
    },
    /**
     * 自動尋找最接近的垃圾並回傳
     */
    findClosestGarbage (title) {
      let manager = this.$manager
      let role = manager.get('main-role')
      let list = this.garbageList.filter((item) => !item._remove)
      let remain = list.length
      if (title) {
        title = title.trim()
        list = list.filter((item) => item.title === title)
      }
      let closest = null
      if (list.length > 0) {
        remain -= 1
        closest = list[0]
        let minDistance = utils.distance(closest.x, closest.y, role.x, role.y)
        for (let g of list) {
          let dis = utils.distance(g.x, g.y, role.x, role.y)
          if (dis < minDistance) {
            minDistance = dis
            closest = g
          }
        }
      }
      return {
        garbage: closest,
        remain
      }
    },

    findGarbage (title) {
      return this.findClosestGarbage(title)
    },
    /**
     * 顯示 User 傳入的句子(在右下角)
     */
    showInput (text) {
      const Input = require('./Input')
      let manager = this.$manager
      if (!manager.get('input')) {
        let input = new Input()
        manager.add('input', input)
        let role = manager.get('main-role')
        role.on('update', (opts) => {
          input.x = opts.canvas.width - 500
          input.y = opts.canvas.height - 200
        })
      }
      manager.get('input').setInput(text)
    },
    /**
     * 顯示角色的台詞(會在角色頭上)
     */
    showWord (text) {
      const Word = require('./Word')
      let manager = this.$manager
      if (!manager.get('word')) {
        let word = new Word()
        manager.add('word', word)
        let role = manager.get('main-role')
        manager.addTicker(() => {
          word.x = role.x + 60
          word.y = role.y + 40
        })
      }
      manager.get('word').setText(text)
    },
    /**
     * 開關垃圾的自動產生功能
     */
    async toggleGarbageGenerator () {
      if (this.$garbageGenerator) {
        clearInterval(this.$garbageGenerator)
        this.$garbageGenerator = null
      } else {
        this.$garbageGenerator = setInterval(() => {
          this.addGarbage()
          this.emit('auto-generate-garbage')
        }, 1500)
      }
    },
    /**
     * 手動添加數個垃圾進入場景
     */
    async addGarbage () {
      let typeList = [
        {
          type: 'polybag',
          src: require('@/assets/bubble.png')
        },
        {
          type: 'cup',
          src: require('@/assets/cup.png')
        },
        {
          type: 'straw',
          src: require('@/assets/straw.png')
        }
      ]
      let Garbage = require('./Garbage')
      let count = typeList.length
      for (let i = 0; i < count; i++) {
        let t = typeList[i]
        let g = new Garbage({
          title: t.type,
          src: t.src,
          r: 50
        })
        await delay(Math.random() * 500 + 200)
        await g.load()
        this.garbageList.push(g)
        this.garbageRemain += 1
        this.$manager.add(null, g)
      }
    },
    /**
     * 手動添加數個垃圾進入場景
     */
    async addRandomGarbage (count = 2) {
      let typeList = [
        {
          type: 'polybag',
          src: require('@/assets/bubble.png')
        },
        {
          type: 'cup',
          src: require('@/assets/cup.png')
        },
        {
          type: 'straw',
          src: require('@/assets/straw.png')
        }
      ]
      let Garbage = require('./Garbage')
      for (let i = 0; i < count; i++) {
        let t = typeList[Math.floor(Math.random() * typeList.length)]
        let g = new Garbage({
          title: t.type,
          src: t.src,
          r: 50
        })
        await delay(Math.random() * 500 + 200)
        await g.load()
        this.garbageList.push(g)
        this.garbageRemain += 1
        this.$manager.add(null, g)
      }
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
    simFindCommand (target) {
      if (!target) {
        let garbageList = this.garbageList.filter((item) => {
          return !item._remove
        })
        target = garbageList[0].title
      }
      this.$bus.$emit('canvas-update', {
        v2: true,
        show: true,
        input: `To find ${target}`,
        action: 'find-object',
        target: target
      })
    },
    addMenu (manager) {
      let bx = 10
      let diff = 0
      let btns = [
        new Button({
          font: '16px',
          ctx: manager.ctx,
          text: 'sim input'
        }).on('click', () => {
          this.simFindCommand()
        }),
        new Button({
          font: '16px',
          ctx: manager.ctx,
          text: 'find garbage'
        }).on('click', () => {
          let {
            garbage: g,
            remain
          } = this.findGarbage()
          if (g) {
            this.toFindGarbage(g)
          } else {
            if (remain > 0) {
              let txt = 'i cannot find the thing'
              this.showWord(txt)
              this.playAudio(txt)
            } else {
              let role = manager.get('main-role')
              let canvas = manager.canvas
              let txt = 'i am got it'
              role
                .once('m-move-end', () => {
                  console.log('m-move-end')
                })
                .emit('move', {
                  to: {
                    x: canvas.width / 2 - role.width / 2,
                    y: canvas.height / 2 - role.height / 2
                  }
                })
              this.showWord(txt)
              this.playAudio(txt)
            }
          }
        }),
        new Button({
          font: '16px',
          ctx: manager.ctx,
          text: 'generate garbage'
        }).on('click', () => {
          this.addGarbage(1)
        }),
        new Button({
          font: '16px',
          ctx: manager.ctx,
          text: 'auto generate'
        }).on('click', () => {
          this.toggleGarbageGenerator()
        })
      ]
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
    createSingleAnimations (size = 500) {
      let list = ['talk_1', 'talk_2', 'talk_3', 'original', 'rotate', 'jumping', 'talk_natural']
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
                  width: size,
                  height: size,
                  autoplay: true,
                  startBy: 2
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
    createThrowAnimation (size = 500) {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/original.json'),
                width: size,
                height: size,
                autoplay: true,
                startBy: 2
              },
              startByTime: 4700,
              endByTime: 10000
            },
            {
              type: 'SnowBall',
              params: {
                x: size / 2 + 86,
                y: size / 2 + 26,
                vx: 300,
                vy: -1000,
                g: 2000
              },
              startByTime: 3500,
              endByTime: 10000
            },
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/new_throwing.json'),
                width: 500,
                height: 500,
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
    createDanceAnimation (size = 500) {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/dancing.json'),
                width: size,
                height: size,
                autoplay: true,
                loop: false
              },
              startByTime: 0,
              endByTime: 3000
            }
          ]
        }
      )
    },
    createRotateAnimation (size = 500) {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/rotate.json'),
                width: size,
                height: size,
                autoplay: true,
                loop: false
              },
              startByTime: 0,
              endByTime: 3000
            }
          ]
        }
      )
    },
    createShakeHeadAnimation (size = 500) {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/shakeHead_1.json'),
                width: size,
                height: size,
                autoplay: true,
                loop: false
              },
              startByTime: 0,
              endByTime: 2000
            }
          ]
        }
      )
    },
    createNodHeadAnimation (size = 500) {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/nod_1.json'),
                width: size,
                height: size,
                autoplay: true,
                loop: false
              },
              startByTime: 0,
              endByTime: 2000
            }
          ]
        }
      )
    },
    createEatAnimation (size = 500) {
      return this.createByScript(
        {
          list: [
            {
              type: 'LottieWrapper',
              params: {
                data: require('@/assets/talk_1.json'),
                width: size,
                height: size,
                autoplay: true,
                startAt: 20,
                // debug: true,
                loop: false
              },
              startByTime: 0,
              endByTime: 500
            }
          ]
        }
      )
    },
    /**
     * 建立動畫腳本用
     */
    createByScript (script, types = {}) {
      return AnimationManager.createByScript(script, {
        LottieWrapper,
        SnowBall
      }).on('all-complete', (item) => {
        console.log(`item ${item.name} completed`)
      })
    },

    addSnowBall (x = 100, y = 100, floor = 500) {
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
      if (this.$lastAudio) {
        this.$lastAudio.pause()
      }
      var audio = new Audio()
      audio.src = this.generateWav(str)
      audio.play()
      this.$lastAudio = audio
    },

    include (str, keywords) {
      for (let keyword of keywords) {
        if (str.indexOf(keyword) < 0) {
          return false
        }
      }
      return true
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
  @import url("https://fonts.googleapis.com/css?family=Roboto+Mono");
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
    cursor: crosshair;
  }
  canvas:focus{
    outline: none;
  }
</style>
