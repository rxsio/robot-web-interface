import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useDynamicReconfigure } from '@/misc/roslibExtensions'
import { IDynamicConfiguration } from '@/misc/roslibTypes'

export interface Joy5dofManipulator extends IDynamicConfiguration {
    mode: number
    gear: number
}

export enum EMode {
    Forward = 'forward',
    Inverse = 'Inverse',
    None = '__none',
}

export const useJoy5dofManipulator = defineStore('joy5dofManipulator', () => {
    const nodeName = 'joy_5dof_manipulator'
    const modes: EMode[] = [EMode.Forward, EMode.Inverse]

    const nodeConfig = useDynamicReconfigure<Joy5dofManipulator>(nodeName)

    const connected = computed(() => Object.keys(nodeConfig.value).length !== 0)

    const mode = computed<EMode>({
        get() {
            if (connected.value) {
                return modes[nodeConfig.value.mode]
            } else {
                return EMode.None
            }
        },
        set(newMode) {
            if (connected.value) {
                nodeConfig.value.mode = modes.indexOf(newMode)
            }
        },
    })

    const gear = computed<number>({
        get() {
            if (connected.value) {
                return nodeConfig.value.gear
            } else {
                return 0
            }
        },
        set(newGear) {
            if (connected.value) {
                nodeConfig.value.gear = newGear
            }
        },
    })

    const maxGearSpeed = computed<number>({
        get() {
            const paramName = `gear_${gear.value}_max_speed`
            if (gear.value) {
                return nodeConfig.value[paramName]
            } else {
                return 0
            }
        },
        set(newGearMaxSpeed) {
            const paramName = `gear_${gear.value}_max_speed`
            if (gear.value) {
                nodeConfig.value[paramName] = newGearMaxSpeed
            }
        },
    })

    return {
        nodeName,
        connected,

        mode,
        modes,
        gear,
        maxGearSpeed,
    }
})
