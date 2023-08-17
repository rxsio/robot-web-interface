import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useJoystickStore = defineStore('joystick', () => {
    const joystick = ref(null)

    const connectListener = ref(null)
    const disconnectListener = ref(null)

    const connected = computed(() => !!joystick.value)

    const findJoystick = async () => {
        const gamepads = navigator.getGamepads()
        for (const gamepad of gamepads) {
            if (gamepad && gamepad.connected) {
                joystick.value = gamepad
                return
            }
        }
        joystick.value = null
    }

    function start() {
        connectListener.value = window.addEventListener(
            'gamepadconnected',
            () => {
                findJoystick()
            }
        )
        disconnectListener.value = window.addEventListener(
            'gamepaddisconnected',
            () => {
                findJoystick()
            }
        )
    }

    function stop() {
        if (connectListener.value) {
            window.removeEventListener(
                'gamepadconnected',
                connectListener.value
            )
            connectListener.value = null
        }
        if (disconnectListener.value) {
            window.removeEventListener(
                'gamepaddisconnected',
                disconnectListener.value
            )
            disconnectListener.value = null
        }
    }

    return {
        connected,
        joystick,

        start,
        stop,
    }
})
