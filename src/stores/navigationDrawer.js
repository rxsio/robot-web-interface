import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNavigationDrawerStore = defineStore('forceNavDrawer', () => {
    const opened = ref(false)

    function toggle() {
        opened.value = !opened.value
    }

    function set(newValue) {
        opened.value = newValue
    }

    return { opened, toggle, set }
})
