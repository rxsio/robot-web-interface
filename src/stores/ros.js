import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'
import { Ros } from 'roslib'

export const useRosStore = defineStore('ros', () => {
    // set 'sirius.local' for release or your Linux/WSL adress for develop
    const address = ref('192.168.72.112')
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

    const ws = ref(null)
    const reconnectTimeout = ref(null)

    function connect() {
        if (reconnectTimeout.value) clearTimeout(reconnectTimeout.value)
        reconnectTimeout.value = null

        if (
            ws.value &&
            ws.value.readyState !== WebSocket.CLOSED &&
            ws.value.readyState !== WebSocket.CLOSING
        ) {
            if (ws.value.socket.url === url.value) return
            else ws.value.close()
        }

        console.log('[ROS]', 'connecting...', url.value)

        const newWs = new Ros({
            url: url.value,
        })

        newWs.on('connection', () => {
            console.log('[ROS]', 'connected!', newWs.socket.url)
        })
        newWs.on('error', () => {
            console.log('[ROS]', 'error :(', newWs.socket.url)

            scheduleReconnect()
        })
        newWs.on('close', () => {
            console.log('[ROS]', 'closed', newWs.socket.url)

            scheduleReconnect()
        })

        ws.value = newWs
    }

    function scheduleReconnect() {
        if (!reconnectTimeout.value)
            reconnectTimeout.value = setTimeout(() => connect(), 3000)
    }

    watchEffect(() => {
        connect()
    })

    return {
        ws,
        url,
        connect,

        setPort,
        setAddress,
    }
})
