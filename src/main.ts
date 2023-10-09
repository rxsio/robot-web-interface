import Vue from 'vue'
import router from '@/router'
import vuetify from '@/plugins/vuetify'

import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

import { createPinia, Pinia, PiniaVuePlugin } from 'pinia'
import App from '@/App.vue'
import '@/styles/overrides.scss'

Vue.use(PiniaVuePlugin)
const pinia: Pinia = createPinia()

Vue.config.productionTip = false

const app: Vue = new Vue({
    router,
    // @ts-ignore
    vuetify,
    pinia,
    render: (h) => h(App),
})
app.$mount('#app')
