import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/animation',
    name: 'Animation',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "ani" */ '../views/Animation.vue')
  },
  {
    path: '/animation/v2',
    name: 'AnimationV2',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "ani" */ '../views/AnimationV2.vue')
  },
  {
    path: '/animation/v3',
    name: 'AnimationV3',
    component: () => import(/* webpackChunkName: "Animation3" */ '../views/AnimationV3/AnimationV3.vue')
  },
  {
    path: '/animation/v3/demo0810',
    name: 'AnimationV3-demo0810',
    component: () => import(/* webpackChunkName: "Animation3" */ '../views/AnimationV3/Demo0810.vue')
  },
  {
    path: '/animation/v3/anim',
    name: 'AnimationV3-anim',
    component: () => import(/* webpackChunkName: "Animation3" */ '../views/AnimationV3/DemoAnim.vue')
  },
  {
    path: '/new',
    name: 'AnimationV3-new',
    component: () => import(/* webpackChunkName: "Animation3" */ '../views/AnimationV3/Newpage.vue')
  },
  {
    path: '/animation/v3/garbage',
    name: 'garbage-new',
    component: () => import(/* webpackChunkName: "Animation3" */ '../views/AnimationV3/GarbageCollector.vue')
  },
  {
    path: '/animation/v3/dev',
    name: 'animation-v3-dev',
    component: () => import(/* webpackChunkName: "Animation3" */ '../views/AnimationV3/DevComponents.vue')
  }
  // {
  //   path: '/animation/v4/',
  //   name: 'garbage-new',
  //   component: () => import(/* webpackChunkName: "Animation3" */ '../views/Animation-pixi/index.vue')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
