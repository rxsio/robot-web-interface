import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useDynamicReconfigure } from '@/misc/roslibExtensions'

export const useJoyDiffDrive = defineStore('joyDiffDrive', () => {
    const modes = ['normal', 'car', 'tank']

    const nodeConfig = useDynamicReconfigure('joy_diff_drive')

    const connected = computed(() => Object.keys(nodeConfig.value).length !== 0)

    const mode = computed({
        get() {
            if (connected.value) return modes[nodeConfig.value.mode]
            else return '__none'
        },
        set(newMode) {
            if (connected.value) nodeConfig.value.mode = modes.indexOf(newMode)
        },
    })

    const gear = computed({
        get() {
            if (connected.value) return nodeConfig.value.gear
            else return 0
        },
        set(newGear) {
            if (connected.value) nodeConfig.value.gear = newGear
        },
    })

    const maxGearSpeed = computed({
        get() {
            let paramName = `gear_${gear.value}_max_speed`
            if (gear.value) return nodeConfig.value[paramName]
            else return 0
        },
        set(newGearMaxSpeed) {
            let paramName = `gear_${gear.value}_max_speed`
            if (gear.value) nodeConfig.value[paramName] = newGearMaxSpeed
        },
    })

    return {
        connected,

        mode,
        modes,
        gear,
        maxGearSpeed,
    }
})
