import { defineStore } from 'pinia'
import { ref, computed, getCurrentInstance } from 'vue'
import { useViewModeStore } from './viewMode'

export const useLayoutStore = defineStore('layout', () => {
    const viewMode = useViewModeStore()

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
            },
            manipulator: {
                shape: [],
                windows: {},
            },
            drilling: {
                shape: [],
                windows: {},
            },
            science: {
                shape: [],
                windows: {},
            },
            terminal: {
                shape: [],
                windows: {},
            },
        },
        {
            overview: {
                shape: [],
                windows: {},
            },
        },
        {
            overview: {
                shape: [],
                windows: {},
            },
        },
    ])

    const $route = getCurrentInstance().proxy.$route
    const panel = $route.params.variant
    const layout = computed(() => {
        const $route = getCurrentInstance().proxy.$route
        const panel = $route.params.variant

        return allLayouts.value[viewMode.screen - 1][panel]
    })
    function nextLayoutId() {
        return String(layout.value.nextId++)
    }

    return {
        panel,
        allLayouts,
        layout,
        nextLayoutId,
    }
})
