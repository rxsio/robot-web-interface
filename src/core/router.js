import { useConfigurationStore } from '@/stores'
import MainScreen from '@/ui/screens/MainScreen.vue'
import Vue from 'vue'
import VueRouter from 'vue-router'
import { getActivePinia } from 'pinia'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        redirect: () => ({
            name: 'panel',
            params: { variant: 'overview' },
        }),
    },
    {
        path: '/panel/:variant',
        name: 'panel',
        component: MainScreen,
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
    let variants = ['overview']

    if (getActivePinia()) {
        const configurationStore = useConfigurationStore()
        variants = configurationStore.views.map((value) => value.name)
    }

    const variant = to.params.variant

    if (to.name === 'panel' && !variants.includes(variant)) {
        next({ name: '404' })
    } else {
        next()
    }
})

export default router
