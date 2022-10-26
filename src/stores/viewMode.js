import { defineStore } from 'pinia'
import { ref, getCurrentInstance } from 'vue'
import pwColors from '@/assets/pwColors.json'

export const useViewModeStore = defineStore('viewMode', () => {
    const mode = ref('normal')

    const $vuetify = getCurrentInstance().proxy.$vuetify
    function editMode() {
        mode.value = 'edit'
        $vuetify.theme.themes.light.primary = pwColors.słoneczny
        $vuetify.theme.themes.light.secondary = pwColors.grafitowy
    }
    function normalMode() {
        mode.value = 'normal'
        $vuetify.theme.themes.light.primary = pwColors.miętowy
        $vuetify.theme.themes.light.secondary = pwColors.grafitowy
    }

    const editDrawer = ref(false)
    function toggleEditDrawer() {
        editDrawer.value = !editDrawer.value
    }

    const screen = ref(1)
    function setScreen(newScreen) {
        screen.value = newScreen
    }

    return {
        mode,
        editMode,
        normalMode,

        editDrawer,
        toggleEditDrawer,

        screen,
        setScreen,
    }
})
