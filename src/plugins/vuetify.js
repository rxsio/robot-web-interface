import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

export default new Vuetify({
    theme: {
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: colors.teal.lighten1,
                secondary: colors.blueGrey.darken4,
                accent: colors.blue.accent1,
                error: colors.red.accent2,
                info: colors.blue.base,
                success: colors.green.base,
                warning: colors.amber.base,

                primaryNormal: colors.teal.lighten1,
                primaryEdit: colors.amber.base,
            },
        },
    },
})
