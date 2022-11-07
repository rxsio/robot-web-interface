import Vue from 'vue'
import VueRouter from 'vue-router'

//import HomeView from '@/views/HomeView.vue'
import PanelView from '@/views/PanelView.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        //component: HomeView,
        redirect: () => ({ path: '/panel/overview' }),
    },
    {
        path: '/panel/:variant',
        name: 'panel',
        component: PanelView,
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
})

export default router
