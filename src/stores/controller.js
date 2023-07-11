import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useSteeringStore } from './steering'

export const useControllerStore = defineStore('controller', () => {
    const steeringStore = useSteeringStore()

    const connected = computed(() => !!controller.value)

    const controller = ref(null)

    const connectListener = ref(null)
    const disconnectListener = ref(null)
    const statusTransmitter = ref(null)

    function findController() {
        steeringStore.giveUpControl()
        if (statusTransmitter.value) {
            cancelAnimationFrame(statusTransmitter.value)
            statusTransmitter.value = null
        }

        const gamepads = navigator.getGamepads()
        for (const gamepad of gamepads) {
            if (gamepad && gamepad.connected) {
                statusTransmitter.value = requestAnimationFrame(transmitStatus)
                controller.value = gamepad
                return
            }
        }
        controller.value = null
    }

    function start() {
        connectListener.value = window.addEventListener(
            'gamepadconnected',
            () => {
                findController()
            }
        )
        disconnectListener.value = window.addEventListener(
            'gamepaddisconnected',
            () => {
                findController()
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
        if (statusTransmitter.value) {
            cancelAnimationFrame(statusTransmitter.value)
            statusTransmitter.value = null
        }
    }

    function transmitStatus() {
        statusTransmitter.value = requestAnimationFrame(transmitStatus)
    }

    return {
        connected,
        controller,

        start,
        stop,
    }
})
