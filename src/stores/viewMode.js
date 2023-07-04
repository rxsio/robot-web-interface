import { defineStore } from 'pinia'
import { ref, getCurrentInstance } from 'vue'

export const useViewModeStore = defineStore('viewMode', () => {
    const mode = ref('normal')

    const $vuetify = getCurrentInstance().proxy.$vuetify
    function editMode() {
        mode.value = 'edit'
        $vuetify.theme.themes.light.primary =
            $vuetify.theme.themes.light.primaryEdit
    }
    function normalMode() {
        mode.value = 'normal'
        $vuetify.theme.themes.light.primary =
            $vuetify.theme.themes.light.primaryNormal
    }

    const editDrawer = ref(false)
    function toggleEditDrawer() {
        editDrawer.value = !editDrawer.value
    }

    return {
        mode,
        editMode,
        normalMode,

        editDrawer,
        toggleEditDrawer,
    }
})
