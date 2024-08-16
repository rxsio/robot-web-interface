import { Ros } from 'roslib'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useRosStore = defineStore('ros', () => {
    const address = ref(window.location.hostname)
    //const address = ref('firo2.local')
    const port = ref(8081)
    const url = computed(() =>
        new URL(`wss://${address.value}:${port.value}`).toString()
    )
    function setAddress(newAddress) {
        address.value = newAddress
    }
    function setPort(newPort) {
        port.value = newPort
    }

    const ros = ref(null)
    const connected = ref(false)
    const reconnectTimeout = ref(null)
    const connectionTimeout = ref(null)

    function connect() {
        if (reconnectTimeout.value) clearTimeout(reconnectTimeout.value)
        if (connectionTimeout.value) clearTimeout(connectionTimeout.value)
        reconnectTimeout.value = null
        connectionTimeout.value = null

        if (
            ros.value &&
            ros.value.socket &&
            ros.value.socket.readyState !== WebSocket.CLOSED &&
            ros.value.socket.readyState !== WebSocket.CLOSING
        ) {
            if (ros.value.socket.url === url.value) return
            else ros.value.close()
        }

        console.log('[ROS]', 'connecting...', url.value)

        const newRos = new Ros({
            url: url.value,
        })
        connectionTimeout.value = setTimeout(() => {
            newRos.close()
        }, 4000)

        newRos.on('connection', () => {
            console.log('[ROS]', 'connected!', newRos.socket.url)

            connected.value = ros.value.isConnected

            clearTimeout(connectionTimeout.value)
        })
        newRos.on('error', () => {
            console.log('[ROS]', 'error :(', newRos.socket.url)

            connected.value = ros.value.isConnected

            scheduleReconnect()
        })
        newRos.on('close', () => {
            console.log('[ROS]', 'closed', newRos.socket.url)

            connected.value = ros.value.isConnected

            scheduleReconnect()
        })

        ros.value = newRos
    }

    function scheduleReconnect() {
        if (!reconnectTimeout.value)
            reconnectTimeout.value = setTimeout(() => connect(), 1000)
    }

    return {
        ros,
        url,
        connected,
        connect,

        setPort,
        setAddress,
    }
})
