import { defineStore } from 'pinia'
import { ref, computed, getCurrentInstance } from 'vue'
import panelViewConfig from '@/assets/panelViewConfig.json'

export const useLayoutStore = defineStore('layout', () => {
    const allLayouts = ref([
        {
            overview: {
                shape: [
                    { i: 'aaa', x: 0, y: 0, w: 2, h: 2 },
                    { i: 'bbb', x: 0, y: 0, w: 2, h: 2 },
                    { i: 'ccc', x: 0, y: 0, w: 2, h: 2 },
                    { i: 'ddd', x: 0, y: 0, w: 2, h: 2 },
                ],
                windows: {
                    aaa: {
                        type: 'testWindowA',
                        name: 'AAA',
                        extraConfig: { test: '123' },
                    },
                    bbb: {
                        type: 'testWindow',
                        name: 'Kamera Tył',
                        extraConfig: {},
                    },
                    ccc: {
                        type: 'testWindow',
                        name: 'Kamera',
                        extraConfig: {},
                    },
                    ddd: {
                        type: 'testWindow',
                        name: 'Kamera Dół',
                        extraConfig: {},
                    },
                },
                nextId: 0,
            },
            steering: {
                shape: [],
                windows: {},
                nextId: 0,
            },
            manipulator: {
                shape: [],
                windows: {},
                nextId: 0,
            },
            drilling: {
                shape: [],
                windows: {},
                nextId: 0,
            },
            science: {
                shape: [],
                windows: {},
                nextId: 0,
            },
            terminal: {
                shape: [],
                windows: {},
                nextId: 0,
            },
        },
        Object.fromEntries(
            panelViewConfig.map(({ name }) => [
                name,
                {
                    shape: [],
                    windows: {},
                    nextId: 0,
                },
            ])
        ),
        Object.fromEntries(
            panelViewConfig.map(({ name }) => [
                name,
                {
                    shape: [],
                    windows: {},
                    nextId: 0,
                },
            ])
        ),
    ])

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
    }
})
