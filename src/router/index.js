import Vue from 'vue'
import VueRouter from 'vue-router'

//import HomeView from '@/views/HomeView.vue'
import PanelView from '@/views/PanelView.vue'

import panelViewConfig from '@/assets/panelViewConfig.json'

const variants = panelViewConfig.map((value) => value.name)

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        //component: HomeView,
        redirect: () => ({
            name: 'panel',
            params: { screen: '1', variant: 'overview' },
        }),
    },
    {
        path: '/panel/:screen/:variant',
        name: 'panel',
        component: PanelView,
    },
    {
        path: '*',
        name: '404',
        redirect: () => ({ name: 'home' }),
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
})

router.beforeEach((to, from, next) => {
    const screen = parseInt(to.params.screen)
    const variant = to.params.variant
    if (
        to.name === 'panel' &&
        (isNaN(screen) ||
            screen < 1 ||
            3 < screen ||
            !variants.includes(variant))
    )
        next({ name: '404' })
    else next()
})

export default router
