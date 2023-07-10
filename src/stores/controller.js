import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useControllerStore = defineStore('controller', () => {
    const connected = ref(true)

    return {
        connected,
    }
})
