<template>
  <div id="app">
    <div v-show="false">
      <div style="display: inline-block;  height:60px">test!</div>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/animation">Animation</router-link>
    </div>
    <router-view />
  </div>
</template>
<script>
export default {
  data () {
    return {
      msg: '',
      setupCanvas: false
    }
  },
  mounted () {
    window.$bus = this.$bus
    this.$bus.$on('page-ready', this.initInteractiveCanvas)
    setTimeout(() => {
      this.initInteractiveCanvas()
    }, 2500)
  },
  methods: {
    initInteractiveCanvas () {
      if (!this.setupCanvas) {
        this.setupCanvas = true
        console.log('%cApp', 'color:blue', 'setup interactiveCanvas')
        window.interactiveCanvas.ready({
          onUpdate: data => {
            console.log('data', data)
            this.$bus.$emit('canvas-update', data)
          }
        })
      }
    }
  }
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
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
