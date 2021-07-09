<template>
  <div id="role">
    <div style="display: inline-block; height: 300px;"></div>
    <div ref="container">
      <div v-show="ready">
        <canvas
          height="800"
          width="800"
          style="position: fixed;"
          :style="ballStyle"
          ref="canvasball"
          @click="test()"
        ></canvas>

        <!-- <p :class="assOpts.cls" style="position: fixed;" :style="assOpts.style">
          <canvas
            height="400"
            width="400"
            style="width: 380px; height: 350px;"
            ref="mycanvas"
            id="mycanvas"
          ></canvas>
        </p> -->

        <canvas
          height="400"
          width="400"
          style="position: fixed; width: 400px; height: 400px;"
          :style="mainRoleStyle"
          ref="canvas"
        ></canvas>
          <!-- tabindex="0" -->
          <!-- @keydown="move('main', $event)" -->
      </div>
      <div id="word" v-if="false">
        <!-- eslint-disable-next-line vue/valid-v-bind -->
        <table>
          <tr>
            <td id="talk" align="center" style="width: 33vw;">
              <p :class="assOpts.cls" :style="assOpts.style">
                <!-- <canvas id="mycanvas"></canvas> -->
                <!-- {{assistant}} -->
              </p>
            </td>
            <td align="center" style="width: 22vw;">
              <h2 :class="msgOpts.cls" :style="msgOpts.style">
                <!-- {{msg}} -->
              </h2>
            </td>
            <td id="talk" align="center" style="width: 44vw;">
              <p :class="msgOpts.cls" style="position: fixed;" :style="msgOpts.style">
                {{ user }}
                {{ msg }}
              </p>
            </td>
          </tr>
        </table>
      </div>
      <button @click="test()" ref="btn">test</button>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable prefer-const */
import lottie from 'lottie-web'

function delay (t) {
  return new Promise((resolve) => {
    setTimeout(resolve, t)
  })
}

export default {
  data () {
    return {
      ready: false,
      // canvas: document.getElementById('canvasball'),
      key: '',
      animation: false,
      running: false,
      x: 100,
      y: 100,
      vx: 10,
      vy: 25,
      ax: 0,
      ay: 1,
      loss_x: 0.8,
      loss_y: 0.8,
      // 兩幀之間的時間間隔
      dt: 1,
      // 小球半徑
      radius: 16,
      // 小球質量
      m: 1,
      // 小球顏色
      color: 'white',

      playnext: false,
      nextcha: '',
      flag: false,
      msg: '',
      assistant: '',
      user: '',
      map: {},
      mainRole: {
        x: 0,
        y: 0,
        rx: 0,
        ry: 0
      },
      drawMap: {},
      drawList: [],
      centerX: 400,
      centerY: 400,
      msgOpts: {
        cls: [],
        style: {}
      },
      assOpts: {
        cls: [],
        style: {}
      },
      loaded: false,
      animations: []
    }
  },
  computed: {
    mainRoleStyle () {
      return {
        top: this.mainRole.y - 200 + 'px',
        left: this.mainRole.x - 200 + 'px'
      }
    },
    ballStyle () {
      let dx = 0
      let dy = 0
      let ballCanvas = this.$refs.canvasball
      if (ballCanvas) {
        dy = ballCanvas.height / 2
        dx = ballCanvas.width / 2
      }
      return {
        top: this.mainRole.y - dy + 'px',
        left: this.mainRole.x - dx + 'px'
      }
    }
  },
  async mounted () {
    window.app = this
    // eslint-disable-next-line no-unused-vars
    let animation = null
    console.log(this.$refs)
    // this.add('octopus', await import('@/assets/nobg.json'))

    this.add('natural', await import('@/assets/talk_natural.json'))
    this.add('onion', await import('@/assets/data.json'))
    this.add('t1', await import('@/assets/talk_1.json'))
    this.add('t2', await import('@/assets/talk_2.json'))
    this.add('t3', await import('@/assets/talk_3.json'))
    this.add('rotate', await import('@/assets/rotate.json'))
    // this.add('dance', await import('@/assets/dancing.json'))
    this.add('yes1', await import('@/assets/nod_1.json'))
    this.add('no1', await import('@/assets/shakeHead_1.json'))
    this.add('jump', await import('@/assets/jumping.json'))
    this.add('original', await import('@/assets/original.json'))
    this.add('octopus', await import('@/assets/nobg.json'))
    // this.add('throw', await import('@/assets/new_throwing.json'))
    this.$rePosition = () => {
      this.centerX = window.innerWidth / 2
      this.centerY = window.innerHeight / 2
      this.mainRole.x = this.centerX
      this.mainRole.y = this.centerY
      let canvas = this.$refs.canvasball
      canvas.height = window.innerHeight
      canvas.width = window.innerWidth
    }
    this.$rePosition()
    window.addEventListener('resize', this.$rePosition)
    console.log('mainRole', this.mainRole)
    this.$nextTick(() => {
      this.ready = true
    })
    this.$bus.$on('canvas-update', (data) => {
      console.log('onupdate', data)
      // this.flag = false
      // this.assistant = ''
      this.playnext = data.playnext
      this.nextcha = data.nexcha
      // this.sing = data.sing
      this.msg = data.init
      this.flag = data.show
      this.assistant = data.output
      let word = this.drawMap['word']
      if (word && this.flag) {
        word.setText(this.assistant)
        this.preview(data.output)
        console.log('preview')
      }
      this.user = data.input

      this.key = data.key
      // if (data.cha === 'throw') {

      // }
      // setTimeout(() => {
      //   this.resetAssistant()
      //   // if (this.flag === true) {
      //   //   // this.draw()
      //   //   this.flag = false
      //   // }
      //   // this.flag = false
      //   this.preview(data.output)
      // }, 2000)
      this.resetMsgAnimation()
      this.play(data.cha)
      if (data.cha === 'throw') {
        setTimeout(() => {
          // this.handle()
        }, 3600)
        setTimeout(() => {
          this.play('original')
        }, 7100)
      }
      if (data.cha === 'dance') {
        this.mainRole.x += 100
        this.mainRole.y -= 50
        setTimeout(() => {
          this.mainRole.x -= 200
          this.mainRole.y += 100
        }, 500)
        setTimeout(() => {
          this.mainRole.x += 200
          this.mainRole.y -= 150
        }, 1000)
        setTimeout(() => {
          this.mainRole.x -= 100
          this.mainRole.y += 100
        }, 1500)
        // this.mainRole.x -= 100
        // this.mainRole.x -= 100
        // this.mainRole.x += 100
      }
      if (data.cha === 'sing') {
        this.mainRole.x += 100
        this.mainRole.y -= 50
        setTimeout(() => {
          this.mainRole.x -= 200
          this.mainRole.y += 100
        }, 500)
        setTimeout(() => {
          this.mainRole.x += 200
          this.mainRole.y -= 150
        }, 1000)
        setTimeout(() => {
          this.mainRole.x -= 100
          this.mainRole.y += 100
        }, 1500)
        // this.mainRole.x -= 100
        // this.mainRole.x -= 100
        // this.mainRole.x += 100
      }
      setTimeout(() => {
        if (this.playnext === true) {
          this.play(data.nextcha)
          // if (this.sing === true) {
          //   this.play(data.cha)
          // }
        }
      }, 2000)
    })
    this.$synth = new window.Animalese('/animalese.wav', () => {
      // --
    })
    console.log(this.$synth)
    setTimeout(async () => {
      this.loaded = true
      this.addFPS()
      this.addWord()
      this.addFloor()
      this.drawAll()
      this.runScript1()
    }, 100)
  },
  beforeDestroy () {
    this.$bus.$off('canvas-update')
    window.removeEventListener('resize', this.$rePosition)
    clearInterval(this.$fpsCounter)
    clearInterval(this.$drawLoop)
  },
  methods: {
    /**
     * 待修正
     */
    async runScript1 () {
      return this.runScript([
        delay.bind(this, 200),
        [this.play.bind(this, 'original'), true],
        delay.bind(this, 1000),
        [this.play.bind(this, 'throw'), true],
        delay.bind(this, 3600),
        [this.resetSnowBall, true],
        delay.bind(this, 1500),
        [this.play.bind(this, 'original'), true]
      ])
    },
    /**
     * 待修正
     */
    async runScript (list) {
      console.log('this.$runScript', this.$runScript)
      if (this.$runScript) {
        this.$runScript_stop = true
        this.$runScript_restart = true
        this.$runScript_tmpScript = list
      } else {
        if (this.$runScript_restart) {
          console.log('script restart')
        }
        this.$runScript_restart = false
        this.$runScript = true
        this.$runScript_stop = false
        list = list.map((item) => {
          if (Array.isArray(item)) {
            return item
          } else {
            return [item]
          }
        })
        for (let cmd of list) {
          // console.log('run script', this.$runScript_stop)
          if (this.$runScript_stop) {
            break
          }
          // console.log('wait', !cmd[1])
          if (cmd[1]) {
            cmd[0]()
          } else {
            await cmd[0]()
          }
        }
        this.$runScript = false
        if (this.$runScript_restart) {
          this.$nextTick(() => {
            this.runScript(this.$runScript_tmpScript)
          })
        }
      }
    },
    move (name, e) {
      // console.log(e)
      let dx = 0
      let dy = 0
      switch (e.code) {
        case 'ArrowDown':
          dy = 10
          break
        case 'ArrowUp':
          dy = -10
          break
        case 'ArrowLeft':
          dx = -10
          break
        case 'ArrowRight':
          dx = 10
          break
      }
      this.mainRole.x += dx
      this.mainRole.y += dy
      console.log(this.mainRole)
    },
    async add (name, data) {
      let animation = lottie.loadAnimation({
        name,
        // container: this.$refs.container,
        renderer: 'canvas',
        // loop: true,
        autoplay: false,
        animationData: data,
        rendererSettings: {
          context: this.$refs.canvas.getContext('2d'), // the canvas context
          // preserveAspectRatio: 'xMinYMin slice', // Supports the same options as the svg element's preserveAspectRatio property
          clearCanvas: true,
          progressiveLoad: false, // Boolean, only svg renderer, loads dom elements when needed. Might speed up initialization for large number of elements.
          hideOnTransparent: true // Boolean, only svg renderer, hides elements when opacity reaches 0 (defaults to true)
          // className: 'some-css-class-name',
          // id: 'cv'
        }
      })
      this.map[name] = {
        data,
        animation
      }
    },
    drawAll () {
      clearInterval(this.$fpsCounter)
      clearInterval(this.$drawLoop)
      /**
       * @type {Canvas}
       */
      let canvas = this.$refs.canvasball
      let ctx = canvas.getContext('2d')
      let frames = 0
      let pre = performance.now()
      let limitFPS = 30
      // let errList = []
      let errCount = 0
      let removeCount = 0
      console.log('reset draw loop')
      // console.log(errList)
      console.log(this.drawList)
      this.$fpsCounter = setInterval(() => {
        this.$fps = frames
        frames = 0
      }, 1000)
      this.$drawLoop = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let now = performance.now()
        let diff = now - pre
        let radio = diff / limitFPS
        let opts = {
          now,
          diff,
          radio,
          frames
        }
        removeCount = 0
        let count = this.drawList.length
        for (let i = 0; i < count; i++) {
          let drawObj = this.drawList[i]
          if (drawObj) {
            if (drawObj._remove) {
              removeCount += 1
            } else {
              try {
                drawObj.update(opts)
                drawObj.draw(ctx)
              } catch (e) {
                errCount += 1
              }
            }
          } else {
            removeCount += 1
          }
        }
        if (errCount > 0) {
          console.log('draw err:', errCount)
        }
        if (removeCount > 5) {
          console.log('remove', removeCount)
          let arr = new Array(this.drawList.length - removeCount)
          let t = 0
          for (let i = 0; i < this.drawList.length; i += 1) {
            let item = this.drawList[i]
            if (item && !item._remove) {
              arr[t] = item
              t += 1
            }
          }
          this.drawList = arr
          removeCount = 0
        }
        frames += 1
        errCount = 0
        pre = now
      }, 1000 / limitFPS)
    },
    removeDrawObj (name) {
      this.drawMap[name]._remove = true
      delete this.drawMap[name]
    },
    empty () {},
    addDrawObj (name, obj) {
      // console.log('add draw obj', name, obj)
      obj.update = obj.update || this.empty
      obj.draw = obj.draw || this.empty
      if (name) {
        this.drawMap[name] = obj
      }
      this.drawList.push(obj)
    },
    resetSnowBall () {
      var canvas = this.$refs.canvasball
      var ball = {
        name: 'snow_ball',
        x: canvas.width / 2 + 65,
        y: canvas.height / 2 + 60,
        vx: 4,
        vy: -40,
        r: 10,
        color: 'white'
      }
      if (this.drawMap['snow_ball']) {
        Object.assign(this.drawMap.snow_ball, ball)
      } else {
        console.log('add reset snow ball')
        // eslint-disable-next-line no-unused-vars
        let floor = this.drawMap.floor
        var floorY = floor.y
        var g = 4 // 重Ｆ力加速度
        ball.draw = (ctx) => {
          ctx.beginPath()
          ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI)
          ctx.fillStyle = ball.color
          ctx.fill()
        }
        // eslint-disable-next-line no-unused-vars
        ball.update = ({ now, diff, radio }) => {
          floorY = floor.y
          // console.log(diff)
          ball.vy *= 0.98
          ball.x += ball.vx * radio
          ball.y += ball.vy * radio
          // if 球碰到地板
          if (ball.y + ball.r >= floorY) {
            ball.y = floorY - ball.r
            if (Math.abs(ball.vy) < 0.1) {
            } else {
              // 反彈
              ball.vy = -ball.vy
            }
          } else {
            // apply 重力
            ball.vy += g
          }
        }
        this.addDrawObj('snow_ball', ball)
      }
    },
    /**
     * 加入地板
     */
    addFloor () {
      if (!this.drawMap['floor']) {
        var canvas = this.$refs.canvasball
        let floor = {
          y: this.centerY + 60
        }
        floor.update = () => {
          floor.y = this.centerY + 60
        }
        floor.draw = (ctx) => {
          ctx.strokeStyle = 'black'
          ctx.beginPath()
          ctx.moveTo(0, floor.y)
          ctx.lineTo(canvas.width, floor.y)
          ctx.stroke()
        }
        this.addDrawObj('floor', floor)
      }
    },
    /**
     * 加入FPS
     */
    addFPS () {
      if (!this.drawMap['fps']) {
        var canvas = this.$refs.canvasball
        let fps = {
          y: 100,
          x: canvas.width - 100,
          font: '30px Arial',
          counter: 0
        }
        fps.update = () => {
          fps.counter = this.$fps || 0
          fps.y = 100
          fps.x = canvas.width - 100
        }
        fps.draw = (ctx) => {
          ctx.fillStyle = 'rgb(150, 150, 150)'
          ctx.fillText(fps.counter, fps.x, fps.y)
        }
        this.addDrawObj('fps', fps)
      }
    },
    /**
     * 加入下雪效果
     */
    addWord () {
      if (!this.drawMap['word']) {
        var canvas = this.$refs.canvasball
        let word = {
          y: -250,
          x: -150,
          cx: 0,
          cy: 0,
          text: '',
          // font: '30px Arial',
          // counter: 0,
          op: 0,
          clock: null,
          fadeOut: false
        }
        word.setPos = (x, y) => {
          word.x = x
          word.y = y
        }
        word.setText = (text) => {
          clearTimeout(word.clock)
          word.fadeOut = false
          word.text = text
          word.op = 1
          word.clock = setTimeout(() => {
            word.fadeOut = true
          }, 1500)
        }
        word.update = () => {
          if (word.fadeOut && word.op > 0) {
            word.op -= 0.1
          }
          word.cy = canvas.height / 2
          word.cx = canvas.width / 2
          // if (word.op < 0.1) {
          //   word._remove = true
          // }
        }
        word.draw = (ctx) => {
          // let x = word.x
          // let y = word.y
          // ctx.clearRect(20, 20, 295, 130)
          ctx.save()
          ctx.fillStyle = `rgba(50, 50, 160,${word.op})`
          ctx.strokeStyle = `rgb(50, 50, 160,${word.op})`
          ctx.translate(word.cx + word.x, word.cy + word.y)
          ctx.beginPath()
          ctx.moveTo(75, 25)
          ctx.quadraticCurveTo(25, 25, 25, 62.5)
          ctx.quadraticCurveTo(25, 100, 50, 100)
          ctx.quadraticCurveTo(50, 120, 80, 125)
          ctx.quadraticCurveTo(60, 120, 65, 100)
          ctx.quadraticCurveTo(93, 100, 250, 100)
          ctx.quadraticCurveTo(295, 100, 295, 62.5)
          ctx.quadraticCurveTo(295, 25, 250, 25)
          ctx.quadraticCurveTo(93, 25, 75, 25)
          ctx.stroke()
          ctx.font = '1.3rem Orbitron'
          ctx.fillText(word.text, 50, 62.5, 210)
          ctx.restore()
        }
        this.addDrawObj('word', word)
      }
      // var canvas = this.$refs.canvasball
    },
    addSnow (count) {
      var canvas = this.$refs.canvasball
      let w = 100
      let h = 50
      for (let i = 0; i < count; i++) {
        let obj = {
          y: Math.random() * h,
          x: Math.random() * (canvas.width - w),
          vx: Math.random() * 20 + 10,
          vy: Math.random() * 20 + 10,
          r: 5,
          w,
          h,
          op: 1
        }
        obj.update = () => {
          if (obj.vx < 0.1) {
            obj.vx = 0
          }
          if (obj.vy < 0.1) {
            obj.vy = 0
          }
          obj.op -= 0.02
          if (obj.y >= canvas.height) {
            obj.y = canvas.height
            obj.op -= 0.1
            if (obj.op < 0.1) {
              obj._remove = true
            }
          } else {
            obj.x += obj.vx
            obj.y += obj.vy
          }
        }
        obj.draw = (ctx) => {
          ctx.beginPath()
          ctx.arc(obj.x, obj.y, obj.r, 0, 2 * Math.PI)
          ctx.fillStyle = `rgba(150, 75, 75, ${obj.op})`
          ctx.fill()
        }
        this.addDrawObj(null, obj)
      }
    },
    // draw () {
    //   var canvas = this.$refs.mycanvas
    //   if (canvas.getContext) {
    //     var ctx = canvas.getContext('2d')
    //     // .fillStyle = 'rgb(0,0,225)'
    //     // Quadratric curves example
    //     ctx.clearRect(20, 20, 295, 130)
    //     ctx.fillStyle = 'rgb(50, 50, 160)'
    //     ctx.strokeStyle = 'rgb(50, 50, 160)'
    //     ctx.beginPath()
    //     ctx.moveTo(75, 25)
    //     ctx.quadraticCurveTo(25, 25, 25, 62.5)
    //     ctx.quadraticCurveTo(25, 100, 50, 100)
    //     ctx.quadraticCurveTo(50, 120, 80, 125)
    //     ctx.quadraticCurveTo(60, 120, 65, 100)
    //     ctx.quadraticCurveTo(93, 100, 250, 100)
    //     ctx.quadraticCurveTo(295, 100, 295, 62.5)
    //     ctx.quadraticCurveTo(295, 25, 250, 25)
    //     ctx.quadraticCurveTo(93, 25, 75, 25)
    //     ctx.stroke()
    //     ctx.font = '1.3rem Orbitron'
    //     ctx.fillText(this.assistant, 50, 62.5, 210)
    //   }
    // },
    setSpeed () {
      lottie.setSpeed(10, this.current)
    },
    stop () {
      lottie.stop(this.current)
    },
    play (name) {
      lottie.stop(this.current)
      // let { w, h } = this.map[name].data
      // this.$refs.canvas.height = h
      // this.$refs.canvas.width = w
      lottie.play(name)

      // name.setSpeed(10)
      this.current = name
    },
    resetMsgAnimation () {
      this.msgOpts.cls = []
      this.msgOpts.style = {}
      setTimeout(() => {
        this.msgOpts.cls = ['animated', 'fadeOutUp']
        this.msgOpts.style = {
          'animation-duration': '3s',
          'animation-iteration-count': 1,
          top: this.mainRole.y + 300 - 200 + 'px',
          left: this.mainRole.x + 400 - 200 + 'px'
        }
        // setTimeout(() => {
        //   this.assOpts.cls = ['animated', 'fadeOutUp']
        //   this.assOpts.style = {
        //     'animation-duration': '5s',
        //     'animation-iteration-count': 1
        //   }
        // }, 3000)
      }, 100)
    },
    resetAssistant () {
      this.assOpts.cls = []
      this.assOpts.style = {}
      // this.key = ''
      setTimeout(() => {
        // this.key = 'mycanvas'
        this.assOpts.cls = ['animated', 'fadeOut']
        this.assOpts.style = {
          'animation-duration': '8s',
          'animation-iteration-count': 1,
          top: this.mainRole.y - 60 - 200 + 'px',
          left: this.mainRole.x + 40 - 200 + 'px'
        }
      }, 100)
    },
    test () {
      // let msg = this.msg === 'octopus' ? 'onion' : 'octopus'
      let user = this.user === 'hihi' ? 'hello' : 'hihi'
      let assistant =
        this.assistant === 'How do you do today'
          ? 'I fine thankyou'
          : 'How do you do today'
      let data = {
        show: true,
        cha: 'throw',
        input: user,
        output: assistant
        // key: 'canvasball'
      }
      this.$bus.$emit('canvas-update', data)
      // this.handle()
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

    // var synth = new Animalese('animalese.wav', function () {
    //   document.getElementById("preview").disabled = false;
    //   document.getElementById("download").disabled = false;
    // });

    // test0 () {
    //   let obj = {
    //     a: 777
    //   }
    //   function test2 (a, b, c) {
    //     console.log(this)
    //     console.log(a)
    //     console.log(b)
    //     console.log(c)
    //   }
    //   let newFunc = test2.bind(3, 5, 6, 7)
    //   newFunc()
    //   // this.test1(test2.bind(3, 5, 6, 7))
    // },

    // test1 (cb) {
    //   setTimeout(() => {
    //   // eslint-disable-next-line standard/no-callback-literal
    //     cb(5)
    //   }, 200)
    //   // .................
    // },
    // test2 (a, b, c) {
    //   console.log(this)
    //   console.log(a)
    //   console.log(b)
    //   console.log(c)
    // },
    generateWav (str) {
      return this.$synth.Animalese(str, false, 1.0).dataURI
      // document.getElementById('shorten').checked,
      // document.getElementById('pitch').value).dataURI
    },

    preview (str) {
      console.log(str)
      var audio = new Audio()
      audio.src = this.generateWav(str)
      console.log(audio.src)
      audio.play()
    },

    download () {
      var wave = this.generateWav()
      window.saveAs(this.dataURItoBlob(wave), 'animalese.wav')
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
  #canvasball {
    padding: 0;
    /* background: lightsteelblue; */
    /* border: 1px solid */
  }
   /* #role {
     background-color: lightsteelblue;
  }  */
  #word {
    font-size: 2.5rem;
    padding-bottom: 150px;
    text-align: center;
    color: aliceblue;
    font-family: "Indie FLower", "Fredericka the Great", "abc", sans-serif;
  }
  #talk {
    font-size: 1rem;
    padding-bottom: 150px;
    text-align: center;
    color: royalblue;
    font-family: "Orbitron", "Fredericka the Great", "abc", sans-serif;
  }
  #nav {
    padding: 30px;
  }

  #nav a {
    font-weight: bold;
    color: #2c3e50;
  }

  #nav a.router-link-exact-active {
    color: #42b983;
  }
</style>
