import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNetworkStore = defineStore('network', () => {
    const ping = ref(0)
    const strength = ref('alert')
    const pingInterval = ref(null)
    const pingIntervalMilliseconds = 1000

    function pingCallback() {
        const timeout = pingIntervalMilliseconds

        const controller = new AbortController()
        const controllerTimeout = setTimeout(() => controller.abort(), timeout)
        const time = new Date()

        fetch(`/`, {
            timeout,
            signal: controller.signal,
        })
            .then(() => {
                clearTimeout(controllerTimeout)
                ping.value = new Date() - time
                strength.value = Math.ceil(
                    ((pingIntervalMilliseconds - ping.value) /
                        pingIntervalMilliseconds) *
                        4
                )
            })
            .catch(() => {
                ping.value = pingIntervalMilliseconds
                strength.value = 'alert-outline'
                console.log('PING')
            })
    }

    function enablePing() {
        if (!pingInterval.value) {
            pingInterval.value = setInterval(
                pingCallback,
                pingIntervalMilliseconds
            )
        }
    }

    function disablePing() {
        if (pingInterval.value) {
            clearInterval(pingInterval)
            pingInterval.value = null
        }
    }

    enablePing()

    return {
        ping,
        strength,
        enablePing,
        disablePing,
    }
})
