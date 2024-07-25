import global from '@/configuration/global.json'
import viewsConfiguration from '@/configuration/views.json'
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConfigurationStore = defineStore('configuration', () => {
    const views = ref([])

    const fetchConfiguration = async (url) => {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Network response wat not ok')
        }

        return await response.json()
    }

    const loadConfiguration = async (cell, name, defaultValue) => {
        if (global[name].dynamic) {
            try {
                cell.value = ref(await fetchConfiguration(global[name].url))
            } catch (error) {
                console.log(
                    'Cannot load dynamic configuration for: ',
                    name,
                    '. Using local'
                )
                cell.value = defaultValue
            }
        } else {
            cell.value = defaultValue
        }
    }

    const start = async () => {
        await loadConfiguration(views, 'views', viewsConfiguration)
    }

    return {
        start,
        views,
    }
})
