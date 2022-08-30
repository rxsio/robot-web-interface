import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useForceNavDrawerStore = defineStore('forceNavDrawer', () => {
    const opened = ref(false)

    function toggle() {
        opened.value = !opened.value
    }
    function set(newValue) {
        opened.value = newValue
    }

    return { opened, toggle, set }
})
