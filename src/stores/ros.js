import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { Ros } from 'roslib'

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

    function scheduleReconnectRos(container) {
        console.log('rss', container, container.value.reconnectTimeout)
        if (!container.value.reconnectTimeout) {
            container.value.reconnectTimeout = setTimeout(
                () => connectRos(container),
                1000
            )
        }
    }

    function connectRos(container) {
        const newRos = new Ros({
            url: url.value,
        })

        container.value.connectionTimeout = setTimeout(() => {
            newRos.close()
        }, 4000)

        newRos.on('connection', () => {
            console.log(
                '[ROS]',
                container.value.id,
                'connected!',
                newRos.socket.url
            )

            container.value.connected = container.ros.isConnected

            clearTimeout(container.value.connectionTimeout)
        })
        newRos.on('error', () => {
            console.log(
                '[ROS]',
                container.value.id,
                'error :(',
                newRos.socket.url
            )

            container.value.connected = container.value.ros.isConnected

            scheduleReconnectRos(container)
        })
        newRos.on('close', () => {
            console.log(
                '[ROS]',
                container.value.id,
                'closed',
                newRos.socket.url
            )

            container.value.connected = container.value.ros.isConnected

            scheduleReconnectRos(container)
        })

        container.value.ros = newRos
    }

    let containers = [
        ref({
            id: 0,
            ros: null,
            connected: false,
            connectionTimeout: null,
            reconnectTimeout: null,
        }),
        ref({
            id: 1,
            ros: null,
            connected: false,
            connectionTimeout: null,
            reconnectTimeout: null,
        }),
        ref({
            id: 2,
            ros: null,
            connected: false,
            connectionTimeout: null,
            reconnectTimeout: null,
        }),
        ref({
            id: 3,
            ros: null,
            connected: false,
            connectionTimeout: null,
            reconnectTimeout: null,
        }),
    ]

    for (const container of containers) {
        connectRos(container)
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
        containers,
        setPort,
        setAddress,
    }
})
