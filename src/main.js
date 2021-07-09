import Vue from 'vue'
import App from './App.vue'
import router from './router'
import lottie from 'vue-lottie'

Vue.component('lottie', lottie)
Vue.prototype.$bus = new Vue()

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
