import { getCurrentInstance, ref } from 'vue'
import { defineStore } from 'pinia'

export const Modes = {
    Normal: 'normal',
    Edit: 'edit',
}

export const useViewModeStore = defineStore('viewMode', () => {
    const mode = ref(Modes.Normal)

    const $vuetify = getCurrentInstance().proxy.$vuetify
    function editMode() {
        mode.value = Modes.Edit
        $vuetify.theme.themes.light.primary =
            $vuetify.theme.themes.light.primaryEdit
    }
    function normalMode() {
        mode.value = Modes.Normal
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
