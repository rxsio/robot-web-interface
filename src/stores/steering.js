import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useControllerStore } from './controller'
import { useRosStore } from './ros'
import { useKeyboardSteeringStore } from './keyboardSteering'

export const useSteeringStore = defineStore('steering', () => {
    const controllerStore = useControllerStore()
    const rosStore = useRosStore()
    const keyboardSteeringStore = useKeyboardSteeringStore()

    const enabled = ref(false)
    const controllerMode = ref('normal')
    const drivingGear = ref(1)
    const manipGear = ref(1)

    const gears = [1, 2, 3]
    const gearIcons = {
        1: 'mdi-numeric-1',
        2: 'mdi-numeric-2',
        3: 'mdi-numeric-3',
    }

    const drivingModes = ['normal', 'car', 'tank']
    const manipModes = ['forward', 'inverse', 'inverseCylinder']

    const modeIcons = {
        normal: 'mdi-arrow-decision',
        car: 'mdi-car-side',
        tank: 'mdi-tank',

        forward: 'mdi-robot-industrial',
        inverse: 'mdi-axis-arrow',
        inverseCylinder: 'mdi-axis-z-rotate-clockwise',

        keyboard: 'mdi-keyboard',
    }

    const currentGear = computed(() => {
        if (drivingModes.includes(currentMode.value)) return drivingGear.value
        if (manipModes.includes(currentMode.value)) return manipGear.value
        if (currentMode.value === 'keyboard') return keyboardSteeringStore.gear
        return 0
    })

    const currentMode = computed({
        get() {
            return controllerStore.connected ? controllerMode.value : 'keyboard'
        },
        set(newValue) {
            if (controllerStore.connected) controllerMode.value = newValue
        },
    })

    function takeOverControl() {
        if (!rosStore.ros) return

        enabled.value = true
        if (currentMode.value === 'keyboard') {
            keyboardSteeringStore.takeOverControl()
        }
    }

    function giveUpControl() {
        enabled.value = false
        if (currentMode.value === 'keyboard') {
            keyboardSteeringStore.giveUpControl()
        }
    }

    function start() {
        keyboardSteeringStore.start()
    }

    function stop() {
        keyboardSteeringStore.start()
    }

    return {
        currentMode,
        enabled,
        drivingGear,
        manipGear,
        currentGear,

        gears,
        drivingModes,
        manipModes,
        gearIcons,
        modeIcons,

        takeOverControl,
        giveUpControl,
        start,
        stop,
    }
})
