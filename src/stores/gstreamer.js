import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'

export const useGstreamerStore = defineStore('gstreamer', () => {
    const address = ref('localhost')
    const port = ref(8443)
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

    const peers = ref({})

    function connect() {
        if (reconnectTimeout.value) clearTimeout(reconnectTimeout.value)
        reconnectTimeout.value = null

        if (
            ws.value &&
            ws.value.readyState !== WebSocket.CLOSED &&
            ws.value.readyState !== WebSocket.CLOSING
        ) {
            if (ws.value.url === url.value) return
            else ws.value.close()
        }

        console.log('[GST]', 'connecting...', url.value)

        const newWs = new WebSocket(url.value)

        newWs.onopen = () => {
            console.log('[GST]', 'connected!', newWs.url)

            newWs.send(
                JSON.stringify({
                    type: 'setPeerStatus',
                    roles: ['listener'],
                })
            )
        }
        newWs.onerror = () => {
            console.log('[GST]', 'error :(', newWs.url)

            peers.value = {}
            scheduleReconnect()
        }
        newWs.onclose = () => {
            console.log('[GST]', 'closed', newWs.url)

            peers.value = {}
            scheduleReconnect()
        }
        newWs.onmessage = (event) => {
            const msg = JSON.parse(event.data)

            switch (msg.type) {
                case 'welcome':
                    console.info('[GST]', `got welcomed with ID ${msg.peer_id}`)
                    newWs.send(
                        JSON.stringify({
                            type: 'list',
                        })
                    )
                    break
                case 'list':
                    peers.value = Object.fromEntries(
                        msg.producers.map(({ id, meta }) => [
                            meta['display-name'],
                            id,
                        ])
                    )
                    console.info(
                        '[GST]',
                        `got stream list: ${JSON.stringify(peers.value)}`
                    )
                    break
                case 'peerStatusChanged':
                    if (msg.roles.includes('producer')) {
                        peers.value = {
                            ...peers.value,
                            [msg.meta['display-name']]: msg.peerId,
                        }
                        console.info(
                            '[GST]',
                            `got new stream ${msg.meta['display-name']}`
                        )
                    } else if (msg.roles.length === 0) {
                        peers.value = { ...peers.value }
                        delete peers.value[msg.meta['display-name']]
                        console.info(
                            '[GST]',
                            `lost stream ${msg.meta['display-name']}`
                        )
                    }
                    console.info(
                        '[GST]',
                        `current stream list: ${JSON.stringify(peers.value)}`
                    )
                    break
            }
        }

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

        peers,
    }
})
