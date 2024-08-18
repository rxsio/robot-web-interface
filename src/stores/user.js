import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    const hasInteracted = ref(false)

    const recordInteraction = () => {
        hasInteracted.value = true
    }

    return {
        hasInteracted,
        recordInteraction,
    }
})
