import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'
import { Ros } from 'roslib'

export const useRosStore = defineStore('ros', () => {
    const address = ref('sirius.local')
    const port = ref(8081)
    const url = computed(() =>
        new URL(`ws://${address.value}:${port.value}`).toString()
    )
    function setAddress(newAddress) {
        address.value = newAddress
    }
    function setPort(newPort) {
        port.value = newPort
    }

    const ros = ref(null)

    const reconnectTimeout = ref(null)

    function connect() {
        if (reconnectTimeout.value) clearTimeout(reconnectTimeout.value)
        reconnectTimeout.value = null

        if (
            ros.value &&
            ros.value.readyState !== WebSocket.CLOSED &&
            ros.value.readyState !== WebSocket.CLOSING
        ) {
            if (ros.value.socket.url === url.value) return
            else ros.value.close()
        }

        console.log('[ROS]', 'connecting...', url.value)

        const newRos = new Ros({
            url: url.value,
        })

        newRos.on('connection', () => {
            console.log('[ROS]', 'connected!', newRos.socket.url)
        })
        newRos.on('error', () => {
            console.log('[ROS]', 'error :(', newRos.socket.url)

            scheduleReconnect()
        })
        newRos.on('close', () => {
            console.log('[ROS]', 'closed', newRos.socket.url)
        })

        ros.value = newRos
    }

    function scheduleReconnect() {
        if (!reconnectTimeout.value)
            reconnectTimeout.value = setTimeout(() => connect(), 3000)
    }

    watchEffect(() => {
        connect()
    })

    return {
        ros,
        url,
        connect,

        port,

        setPort,
        setAddress,
    }
})
