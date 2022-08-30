import { defineStore } from 'pinia'
import { ref, getCurrentInstance } from 'vue'
import pwColors from '@/assets/pwColors.json'

export const useViewStateStore = defineStore('viewState', () => {
    const mode = ref('normal')

    const $vuetify = getCurrentInstance().proxy.$vuetify
    function editMode() {
        mode.value = 'edit'
        $vuetify.theme.themes.light.primary = pwColors.grafitowy
        $vuetify.theme.themes.light.secondary = pwColors.słoneczny
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

    return { mode, editDrawer, editMode, normalMode, toggleEditDrawer }
})
