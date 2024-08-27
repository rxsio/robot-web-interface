import { useConfigurationStore } from '@/stores'
import { computed, getCurrentInstance, ref } from 'vue'
import { defineStore } from 'pinia'

const createDefaultViewConfiguration = () => {
    return {
        shape: [],
        windows: {},
        nextId: 0,
    }
}

const getDefaultConfiguration = async () => {
    const configurationStore = useConfigurationStore()
    await configurationStore.loadConfiguration('layout')
    return configurationStore.layout
}

export const useLayoutStore = defineStore('layout', () => {
    const layouts = ref({})
    const columns = ref(12)

    const updateColumns = (c) => {
        columns.value = c
    }

    const loadConfiguration = () => {
        const localConfiguration = localStorage.getItem('layout')

        if (localConfiguration) {
            try {
                layouts.value = JSON.parse(localConfiguration)
                return
                // eslint-disable-next-line no-empty
            } catch (error) {}
        }

        getDefaultConfiguration().then((layout) => {
            layouts.value = layout
        })
    }

    loadConfiguration()

    function resetAll() {
        getDefaultConfiguration().then((layout) => {
            layouts.value = layout
        })
    }

    function save() {
        localStorage.setItem('layout', JSON.stringify(layouts.value))
    }

    function reload() {
        loadConfiguration()
    }

    const panel = computed(() => {
        const $route = getCurrentInstance().proxy.$route
        return $route.params.variant
    })

    const layout = computed(() => {
        if (!(panel.value in layouts.value)) {
            layouts.value[panel.value] = createDefaultViewConfiguration()
        }

        return layouts.value[panel.value]
    })

    function nextWindowId() {
        return `${panel.value};${layout.value.nextId++}`
    }

    const calculateNextWindowPosition = (w, h) => {
        let y = 0
        let x = 0

        yLoop: for (y = 0; y < 1000; y++) {
            xLoop: for (x = 0; x < columns.value - 1; x++) {
                // It should fit horizontally
                // Skip if it exceeds line
                if (x + w >= columns.value) {
                    // Shift vertically, cause there is not enough space in this line
                    if (w !== 0 && w !== columns.value) {
                        continue yLoop
                    }
                }

                // It should not collide with any other window
                for (let window of layout.value.shape) {
                    const collision =
                        x < window.x + window.w &&
                        x + w > window.x &&
                        y < window.y + window.h &&
                        y + h > window.y

                    if (collision) {
                        // Next allowed x should be not lower than blocking window end
                        x = Math.max(x, window.x + window.w - 1)

                        // Maybe if fit after x shift
                        continue xLoop
                    }
                }

                // Found matching space
                break yLoop
            }
        }

        return {
            x: x,
            y: y,
        }
    }

    return {
        panel,
        layouts,
        updateColumns,
        columns,
        layout,
        nextWindowId,
        calculateNextWindowPosition,
        resetAll,
        save,
        reload,
    }
})
