<template>
    <div id="role">
        <div style="display: inline-block;  height:300px"></div>
        <div ref="container">

<div>

<canvas height="800" width="800" style="width:800px;height:800px" ref="canvasball" id="canvasball"></canvas>
                    <!-- <canvas  :id="key"></canvas> -->
                    <p :class="assOpts.cls"
                        style="position: fixed;"
                        :style="assOpts.style"
                       >
                <canvas height="400" width="400" style="width: 380px; height: 350px;" ref="mycanvas" id="mycanvas"></canvas>

                </p>

            <canvas
              height="1000"
              width="1000"
              style="position: fixed; width: 400px; height: 400px;"
              :style="mainRoleStyle"
              tabindex="0"
              @keydown="move('main', $event)"
              ref="canvas"
            ></canvas>
            </div>
        <!-- <button @click="drawball()">
            ball
        </button> -->
        <!-- <button @click="handle()">
            throw ball
        </button> -->
        <!-- <button @click="play('dancing')">
            rotate
        </button> -->
<button id="preview"  @click="test()">test</button>
            <div id="word">
                <!-- eslint-disable-next-line vue/valid-v-bind -->
                <table><tr>
                <td id="talk" align="center" style="width:33vw">
                <p :class="assOpts.cls" :style="assOpts.style">
                    <!-- <canvas id="mycanvas"></canvas> -->
                    <!-- {{assistant}} -->
                </p>
                </td>
                <td align="center" style="width:22vw">
                 <h2 :class="msgOpts.cls" :style="msgOpts.style">
                    <!-- {{msg}} -->
                </h2>
                </td>
                <td id="talk" align="center" style="width:44vw">
                <p :class="msgOpts.cls" style="position: fixed;" :style="msgOpts.style">
                    {{user}}
                    {{msg}}
                </p>
                </td>
                </tr></table>
            </div>
            <!-- <button @click="test" ref="btn">test</button> -->

        </div>
    </div>
</template>

<script>
/* eslint-disable camelcase */
/* eslint-disable prefer-const */
import lottie from 'lottie-web'
export default {
  data () {
    return {
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
        y: 0
      },
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
        top: this.mainRole.y + 'px',
        left: this.mainRole.x + 'px'
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
    this.add('dance', await import('@/assets/dancing.json'))
    this.add('yes1', await import('@/assets/nod_1.json'))
    this.add('no1', await import('@/assets/shakeHead_1.json'))
    this.add('jump', await import('@/assets/jumping.json'))
    this.add('original', await import('@/assets/original.json'))
    this.add('octopus', await import('@/assets/nobg.json'))
    this.add('throw', await import('@/assets/new_throwing.json'))
    this.mainRole.x = (window.innerWidth - 400) / 2
    this.mainRole.y = (window.innerHeight - 400) / 2

    this.$bus.$on('canvas-update', (data) => {
      console.log('onupdate', data)
      // this.flag = false
      // this.assistant = ''
      this.playnext = data.playnext
      this.nextcha = data.nexcha
      // this.sing = data.sing
      this.msg = data.init
      this.assistant = data.output
      this.user = data.input
      this.flag = data.show
      this.key = data.key
      // if (data.cha === 'throw') {

      // }
      setTimeout(() => {
        this.resetAssistant()
        if (this.flag === true) {
          this.draw()
          this.flag = false
        }
        // this.flag = false
        this.preview(data.output)
      }, 2000)
      this.resetMsgAnimation()
      this.play(data.cha)
      if (data.cha === 'throw') {
        setTimeout(() => {
          this.handle()
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
    this.$synth = new window.Animalese('animalese.wav', () => {
      // --
    })
    console.log(this.$synth)
    setTimeout(() => {
      this.loaded = true
    }, 100)
  },
  beforeDestroy () {
    this.$bus.$off('canvas-update')
  },
  methods: {
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

    // canvas.addEventListener('click', function (e) {
    handle () {
      var CANVAS_HEIGHT = 800
      var CANVAS_WIDTH = 800
      var u = 0.6// 能耗系数
      var g = 4// 重Ｆ力加速度
      var timer
      var ball = { x: this.mainRole.x, y: this.mainRole.y, Vx: 5, Vy: 100, r: 10, color: 'white' }

      var canvas = this.$refs.canvasball
      canvas.height = CANVAS_HEIGHT
      canvas.width = CANVAS_WIDTH

      var ctx = canvas.getContext('2d')

      function draw () {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)// 清除小球在canvas上前一帧的状态
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI)
        ctx.fillStyle = ball.color
        ctx.fill()
      }
      function update () {
        ball.x += ball.Vx
        if (ball.Vy === 0 && ball.y >= CANVAS_HEIGHT - ball.r) {
          ball.Vy = 0
        } else {
          ball.Vy += g
        }
        ball.y += ball.Vy
        console.log(ball.Vy)
        if (ball.y > CANVAS_HEIGHT - ball.r) {
          ball.y = CANVAS_HEIGHT - ball.r
          ball.Vy = -Math.ceil(ball.Vy * u)
        }
        if (ball.x === 0 + ball.r || ball.x === CANVAS_WIDTH) {
          clearInterval(timer)
        }
      }
      timer = setInterval(function () {
        draw()
        update()
      }, 40)
    },

    // ball.draw()

    draw () {
      var canvas = this.$refs.mycanvas
      if (canvas.getContext) {
        var ctx = canvas.getContext('2d')
        // .fillStyle = 'rgb(0,0,225)'
        // Quadratric curves example
        ctx.clearRect(20, 20, 295, 130)
        ctx.fillStyle = 'rgb(50, 50, 160)'
        ctx.strokeStyle = 'rgb(50, 50, 160)'
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
        ctx.fillText(this.assistant, 50, 62.5, 210)
      }
    },
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
          top: (this.mainRole.y + 300) + 'px',
          left: (this.mainRole.x + 400) + 'px'
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
          top: (this.mainRole.y - 60) + 'px',
          left: (this.mainRole.x + 40) + 'px'

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
    test () {
      // let msg = this.msg === 'octopus' ? 'onion' : 'octopus'
      let user = this.user === 'hihi' ? 'hello' : 'hihi'
      let assistant = this.assistant === 'How do you do today' ? 'I fine thankyou' : 'How do you do today'
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
      if (dataURI.split(',')[0].indexOf('base64') >= 0) { byteString = atob(dataURI.split(',')[1]) } else { byteString = unescape(dataURI.split(',')[1]) }

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
      return this.$synth.Animalese(str,
        false,
        1.0).dataURI
      // document.getElementById('shorten').checked,
      // document.getElementById('pitch').value).dataURI
    },

    preview (str) {
      var audio = new Audio()
      audio.src = this.generateWav(str)
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
 @import url('https://fonts.googleapis.com/css?family=Caveat');
 @import url('https://fonts.googleapis.com/css?family=Orbitron');
 @import url('https://fonts.googleapis.com/css?family=Indie+Flower');
 @import url('https://fonts.googleapis.com/css?family=Economica');
 @import url('https://fonts.googleapis.com/css?family=Noto+Serif+TC');
 @import url('https://fonts.googleapis.com/css?family=Fredericka+the+Great');
 @font-face {
   font-family: 'abc';
   src: url('https://fonts.googleapis.com/earlyaccess/cwtexyen.css');
 }
  body {
            margin:0;
            padding:0;
            /* height: 100%; */
            /*background: #000;*/
            /* overflow: hidden; */
  }
  #canvasball{

            padding: 0;
            background: lightsteelblue;
            /* border: 1px solid */

  }
#role{
    background-color:lightsteelblue
}
#word{
    font-size:2.5rem;
    padding-bottom:150px;
    text-align: center;
    color:aliceblue;
    font-family: 'Indie FLower','Fredericka the Great','abc', sans-serif;
}
#talk{
    font-size:1rem;
    padding-bottom:150px;
    text-align: center;
    color:royalblue;
    font-family: 'Orbitron','Fredericka the Great','abc', sans-serif;
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
