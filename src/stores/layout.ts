import { defineStore } from 'pinia'
import { computed, getCurrentInstance, ref } from 'vue'
import panelViewConfig from '@/assets/panelViewConfig.json'

export interface Shape {
    x: number
    y: number
    w: number
    h: number
    i: string
    moved: boolean
}

export interface Window {
    type: string
    name: string
    extraConfig: Object
}

export interface Layout {
    shape: Shape[]
    windows: Map<string, Window>
    nextId: number
}

export interface Configuration {
    [panel: string]: Layout
}

const generateDefaultConfig = (): Configuration[] =>
    Array.from({ length: 3 }, () =>
        Object.fromEntries(
            panelViewConfig.map(({ name }) => [
                name,
                {
                    shape: [],
                    windows: new Map<string, Window>(),
                    nextId: 0,
                },
            ])
        )
    )

export const useLayoutStore = defineStore('layout', () => {
    const getConfig = (): Configuration[] => {
        const currentLayoutJSON = localStorage.getItem('layout')
        if (!currentLayoutJSON) {
            return generateDefaultConfig()
        } else {
            return JSON.parse(currentLayoutJSON)
        }
    }

    const allLayouts = ref<Configuration[]>(getConfig())

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
        const $route = getCurrentInstance()!.proxy.$route
        return $route.params.variant
    })
    const screen = computed<number>(() => {
        const $route = getCurrentInstance()!.proxy.$route
        return parseInt($route.params.screen)
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
