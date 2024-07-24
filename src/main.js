import Vue from 'vue'
import router from '@/router'
import vuetify from '@/plugins/vuetify'
import { createPinia, PiniaVuePlugin } from 'pinia'

import App from '@/App.vue'

import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import '@/styles/overrides.scss'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()
Vue.config.productionTip = false

const app = new Vue({
    router,
    vuetify,
    pinia,
    render: (h) => {
        return h(App)
    },
})
app.$mount('#app')
