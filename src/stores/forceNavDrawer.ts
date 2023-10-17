import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useForceNavDrawerStore = defineStore('forceNavDrawer', () => {
    const opened = ref<boolean>(false)

    function toggle() {
        opened.value = !opened.value
    }
    function set(newValue: boolean) {
        opened.value = newValue
    }

    return { opened, toggle, set }
})
