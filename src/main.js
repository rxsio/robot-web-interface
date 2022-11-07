import Vue from 'vue'
import router from '@/router'
import vuetify from '@/plugins/vuetify'

import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

import { createPinia, PiniaVuePlugin } from 'pinia'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()

import App from '@/App.vue'
import '@/styles/overrides.scss'

Vue.config.productionTip = false

const app = new Vue({
    router,
    vuetify,
    pinia,
    render: (h) => h(App),
})
app.$mount('#app')
