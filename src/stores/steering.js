import { computed } from 'vue'
import { defineStore } from 'pinia'

import { useJoystickStore } from './joystick'
import { useJoystickSteeringStore } from './joystickSteering'
import { useKeyboardSteeringStore } from './keyboardSteering'
import { useRosStore } from './ros'

export const useSteeringStore = defineStore('steering', () => {
    const joystickStore = useJoystickStore()
    const rosStore = useRosStore()
    const keyboardSteeringStore = useKeyboardSteeringStore()
    const joystickSteeringStore = useJoystickSteeringStore()

    const gears = [1, 2, 3]
    const gearIcons = {
        1: 'mdi-numeric-1',
        2: 'mdi-numeric-2',
        3: 'mdi-numeric-3',
    }

    const modeIcons = {
        normal: 'mdi-arrow-decision',
        car: 'mdi-car-side',
        tank: 'mdi-tank',

        forward: 'mdi-robot-industrial',
        inverse: 'mdi-axis-arrow',
        inverseCylinder: 'mdi-axis-z-rotate-clockwise',

        keyboard: 'mdi-keyboard',
    }

    const currentInput = computed(() => {
        if (joystickStore.connected) return 'joystick'
        else return 'keyboard'
    })

    const enabled = computed(() => {
        if (currentInput.value === 'joystick')
            return joystickSteeringStore.enabled
        if (currentInput.value === 'keyboard')
            return keyboardSteeringStore.enabled
        return 0
    })

    const currentGear = computed(() => {
        if (currentInput.value === 'joystick')
            return joystickSteeringStore.currentGear
        if (currentInput.value === 'keyboard') return keyboardSteeringStore.gear
        return 0
    })

    const currentMode = computed({
        get() {
            if (currentInput.value === 'joystick')
                return joystickSteeringStore.currentMode
            if (currentInput.value === 'keyboard') return 'keyboard'
            return 'none'
        },
        set(newValue) {
            if (currentInput.value === 'joystick')
                joystickSteeringStore.currentMode = newValue
        },
    })

    function takeOverControl() {
        if (!rosStore.ros) return

        if (currentInput.value === 'joystick') {
            joystickSteeringStore.takeOverControl()
        }
        if (currentInput.value === 'keyboard') {
            keyboardSteeringStore.takeOverControl()
        }
    }

    function giveUpControl() {
        if (currentInput.value === 'joystick') {
            joystickSteeringStore.giveUpControl()
        }
        if (currentInput.value === 'keyboard') {
            keyboardSteeringStore.giveUpControl()
        }
    }

    function start() {
        keyboardSteeringStore.start()
    }

    function stop() {
        keyboardSteeringStore.stop()
        joystickSteeringStore.stop()
    }

    return {
        currentMode,
        enabled,
        currentGear,

        gears,
        gearIcons,
        modeIcons,

        takeOverControl,
        giveUpControl,
        start,
        stop,
    }
})
