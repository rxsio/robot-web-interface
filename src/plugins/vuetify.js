import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import pwColors from '@/assets/pwColors.json'

Vue.use(Vuetify)

export default new Vuetify({
    theme: {
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: pwColors.miętowy,
                secondary: pwColors.grafitowy,
                accent: '#82B1FF',
                error: '#FF5252',
                info: '#2196F3',
                success: '#4CAF50',
                warning: '#FFC107',
                ...pwColors,
            },
        },
    },
})
