import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useControllerStore } from './controller'

export const useSteeringStore = defineStore('steering', () => {
    const controllerStore = useControllerStore()

    const enabled = ref(false)
    const controllerMode = ref('normal')
    const drivingGear = ref(1)
    const manipGear = ref(1)
    const keyboardGear = ref(1)

    const clickListener = ref(null)
    const keyboardTransmitter = ref(null)

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
        if (currentMode.value === 'keyboard') return keyboardGear.value
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
        enabled.value = true
        if (currentMode.value === 'keyboard') {
            if (!clickListener.value) {
                clickListener.value = document.addEventListener('click', () => {
                    giveUpControl()
                })
            }
            if (keyboardTransmitter.value) {
                cancelAnimationFrame(keyboardTransmitter.value)
                keyboardTransmitter.value = null
            }
            keyboardTransmitter.value = requestAnimationFrame(
                transmitKeyboardStatus
            )
        }
    }

    function giveUpControl() {
        enabled.value = false
        if (clickListener.value) {
            document.removeEventListener('click', clickListener.value)
            clickListener.value = null
        }
        if (keyboardTransmitter.value) {
            cancelAnimationFrame(keyboardTransmitter.value)
            keyboardTransmitter.value = null
        }
    }

    function transmitKeyboardStatus() {
        keyboardTransmitter.value = requestAnimationFrame(
            transmitKeyboardStatus
        )
    }

    function stop() {
        if (keyboardTransmitter.value) {
            cancelAnimationFrame(keyboardTransmitter.value)
            keyboardTransmitter.value = null
        }
    }

    return {
        currentMode,
        enabled,
        drivingGear,
        manipGear,
        keyboardGear,
        currentGear,

        gears,
        drivingModes,
        manipModes,
        gearIcons,
        modeIcons,

        takeOverControl,
        giveUpControl,
        stop,
    }
})
