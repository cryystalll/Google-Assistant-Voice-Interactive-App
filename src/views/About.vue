<template>
  <div class="about">
    <h1>{{ msg }}</h1>
  </div>
</template>
<script>
export default {
  data () {
    return {
      msg: 'yeah'
    }
  },
  mounted () {
    window.cp = this
    this.$bus.$on('canvas-update', data => {
      this.msg = data.msg
    })
  },
  methods: {
    test () {
      this.$bus.$emit('canvas-update', {
        msg: 'A'
      })
    }
  }
}
</script>
