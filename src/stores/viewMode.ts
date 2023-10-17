import { defineStore } from 'pinia'
import { ref, getCurrentInstance } from 'vue'

export enum EViewMode {
    Normal = 'normal',
    Edit = 'edit',
}

export const useViewModeStore = defineStore('viewMode', () => {
    const mode = ref<EViewMode>(EViewMode.Normal)

    const $vuetify = getCurrentInstance()!.proxy.$vuetify
    function editMode() {
        mode.value = EViewMode.Edit
        $vuetify.theme.themes.light.primary =
            $vuetify.theme.themes.light.primaryEdit
    }
    function normalMode() {
        mode.value = EViewMode.Normal
        $vuetify.theme.themes.light.primary =
            $vuetify.theme.themes.light.primaryNormal
    }

    const editDrawer = ref<boolean>(false)
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
