import global from '@/configuration/global.json'
import layoutConfiguration from '@/configuration/layout.json'
import viewsConfiguration from '@/configuration/views.json'
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const State = {
    Initial: 'Initial',
    Loading: 'Loading',
    Loaded: 'Loaded',
    Error: 'Error',
}

export const useConfigurationStore = defineStore('configuration', () => {
    const state = ref(State.Initial)
    const views = ref([])
    const layout = ref({})

    const configurations = {
        views: {
            cell: views,
            defaultConfiguration: viewsConfiguration,
        },
        layout: {
            cell: layout,
            defaultConfiguration: layoutConfiguration,
        },
    }

    const fetchConfiguration = async (url) => {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Network response wat not ok')
        }

        return await response.json()
    }

    const loadConfiguration = async (name) => {
        const cell = configurations[name].cell
        const defaultConfiguration = configurations[name].defaultConfiguration

        if (global[name].dynamic) {
            try {
                cell.value = ref(await fetchConfiguration(global[name].url))
            } catch (error) {
                console.log(
                    'Cannot load dynamic configuration for: ',
                    name,
                    '. Using local'
                )
                cell.value = defaultConfiguration
            }
        } else {
            cell.value = defaultConfiguration
        }
    }

    const load = async () => {
        if (state.value !== State.Initial) {
            return
        }

        state.value = State.Loading
        await loadConfiguration('views')
        await loadConfiguration('layout')
        state.value = State.Loaded
    }

    return {
        state,
        load,
        loadConfiguration,
        views,
        layout,
    }
})
