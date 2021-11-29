import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Visualization from '../views/Visualization.vue'
import Control from '../views/Control.vue'
import Science from '../views/Science.vue'
import Cameras from '../views/Cameras.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    props: true,
  },
  {
    path: '/visualization',
    name: 'Visualization',
    component: Visualization,
    props: true,
    meta: {title: "Visualization",},
  },
  {
    path: '/control',
    name: 'Control',
    component: Control,
    props: true,
    meta: {title: "Control",},
  },
  {
    path: '/science',
    name: 'Science',
    component: Science,
    props: true,
    meta: {title: "Science",},
  },
  {
    path: '/cameras',
    name: 'Cameras',
    component: Cameras,
    props: true,
    meta: {title: "Cameras",},
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
