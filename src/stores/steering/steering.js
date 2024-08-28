import {
    useJoystickSteeringStore,
    useJoystickStore,
    useKeyboardSteeringStore,
} from '@/stores'
import { computed } from 'vue'
import { defineStore } from 'pinia'

import { useRosStore } from '../ros'

export const InputType = {
    Joystick: 'joystick',
    Keyboard: 'keyboard',
    None: 'none',
}

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
        virtualJoystick: 'mdi-gesture-tap',
    }

    const currentInput = computed(() => {
        if (joystickStore.connected) {
            return InputType.Joystick
        } else {
            return InputType.Keyboard
        }
    })

    const enabled = computed(() => {
        if (currentInput.value === InputType.Joystick)
            return joystickSteeringStore.enabled
        if (currentInput.value === InputType.Keyboard)
            return keyboardSteeringStore.enabled
        return 0
    })

    const currentGear = computed(() => {
        if (currentInput.value === InputType.Joystick) {
            return joystickSteeringStore.currentGear
        }

        if (currentInput.value === InputType.Keyboard) {
            return keyboardSteeringStore.gear
        }

        return 0
    })

    const currentMode = computed({
        get() {
            if (currentInput.value === InputType.Joystick) {
                return joystickSteeringStore.currentMode
            }

            if (currentInput.value === InputType.Keyboard) {
                return keyboardSteeringStore.currentMode
            }

            return InputType.None
        },
        set(newValue) {
            if (currentInput.value === InputType.Joystick) {
                joystickSteeringStore.currentMode = newValue
            }

            if (currentInput.value === InputType.Keyboard) {
                keyboardSteeringStore.currentMode = newValue
            }
        },
    })

    function takeOverControl() {
        if (!rosStore.ros) {
            return
        }

        if (currentInput.value === InputType.Joystick) {
            joystickSteeringStore.takeOverControl()
        }
        if (currentInput.value === InputType.Keyboard) {
            keyboardSteeringStore.takeOverControl()
        }
    }

    function giveUpControl() {
        if (currentInput.value === InputType.Joystick) {
            joystickSteeringStore.giveUpControl()
        }
        if (currentInput.value === InputType.Keyboard) {
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
        currentInput,
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
