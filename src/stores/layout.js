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
                        type: 'testWindow',
                        name: 'AAA',
                        config: { test: '123' },
                    },
                    bbb: { type: 'testWindow', name: 'Kamera Tył', config: {} },
                    ccc: { type: 'testWindow', name: 'Kamera', config: {} },
                    ddd: { type: 'testWindow', name: 'Kamera Dół', config: {} },
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

    const panelContainer = ref(null)
    const panelGrid = ref(null)
    function mountPanel(newContainer, newGrid) {
        panelContainer.value = newContainer
        panelGrid.value = newGrid
    }
    function unMountPanel() {
        panelContainer.value = null
        panelGrid.value = null
    }

    return {
        panel,
        allLayouts,
        layout,
        nextLayoutId,
        panelContainer,
        panelGrid,
        mountPanel,
        unMountPanel,
    }
})
