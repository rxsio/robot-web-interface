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
    await configurationStore.load()
    return configurationStore.layout
}

export const useLayoutStore = defineStore('layout', () => {
    const layouts = ref({})

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
        layouts.value = loadConfiguration()
    }

    const panel = computed(() => {
        const $route = getCurrentInstance().proxy.$route
        return $route.params.variant
    })

    const layout = computed(() => {
        console.log('Layout', JSON.stringify(layouts.value), panel.value)

        if (!(panel.value in layouts.value)) {
            layouts.value[panel.value] = createDefaultViewConfiguration()
        }

        return layouts.value[panel.value]
    })

    function nextWindowId() {
        return `${panel.value};${layout.value.nextId++}`
    }

    return {
        panel,
        layouts,
        layout,
        nextWindowId,
        resetAll,
        save,
        reload,
    }
})
