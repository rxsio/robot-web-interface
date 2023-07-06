import { defineStore } from 'pinia'
import { ref, computed, getCurrentInstance } from 'vue'
import panelViewConfig from '@/assets/panelViewConfig.json'

const generateDefaultConfig = () =>
    Array.from({ length: 3 }, () =>
        Object.fromEntries(
            panelViewConfig.map(({ name }) => [
                name,
                {
                    shape: [],
                    windows: {},
                    nextId: 0,
                },
            ])
        )
    )

export const useLayoutStore = defineStore('layout', () => {
    const getConfig = () => {
        const currentLayoutJSON = localStorage.getItem('layout')
        if (!currentLayoutJSON) return generateDefaultConfig()
        else return JSON.parse(currentLayoutJSON)
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
    const screen = computed(() => {
        const $route = getCurrentInstance().proxy.$route
        return $route.params.screen
    })
    const layout = computed(() => {
        return allLayouts.value[screen.value - 1][panel.value]
    })
    function nextWindowId() {
        return `${screen.value};${panel.value};${layout.value.nextId++}`
    }

    return {
        screen,
        panel,
        allLayouts,
        layout,
        nextWindowId,
        resetAll,
        save,
        reload,
    }
})
