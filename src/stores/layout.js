import { useConfigurationStore } from '@/stores'
import { computed, getCurrentInstance, ref } from 'vue'
import { defineStore } from 'pinia'

const generateDefaultConfig = () => {
    const configurationStore = useConfigurationStore()

    return Object.fromEntries(
        configurationStore.views.map(({ name }) => [
            name,
            {
                shape: [],
                windows: {},
                nextId: 0,
            },
        ])
    )
}

export const useLayoutStore = defineStore('layout', () => {
    const getConfig = () => {
        const currentLayoutJSON = localStorage.getItem('layout')
        if (!currentLayoutJSON) {
            return generateDefaultConfig()
        } else {
            return JSON.parse(currentLayoutJSON)
        }
    }

    const allLayouts = ref(getConfig())

    function resetAll() {
        allLayouts.value = generateDefaultConfig()
    }

    function save() {
        localStorage.setItem('layout', JSON.stringify(allLayouts.value))
    }

    function reload() {
        allLayouts.value = getConfig()
    }

    const panel = computed(() => {
        const $route = getCurrentInstance().proxy.$route
        return $route.params.variant
    })
    const layout = computed(() => {
        return allLayouts.value[panel.value]
    })

    function nextWindowId() {
        return `${panel.value};${layout.value.nextId++}`
    }

    return {
        panel,
        allLayouts,
        layout,
        nextWindowId,
        resetAll,
        save,
        reload,
    }
})
