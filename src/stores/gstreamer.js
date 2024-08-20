import { GstWebRTCAPI } from '@/lib/gstwebrtc-api'
import Vue, { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const CamerasStatus = {
    Connected: 'Connected',
    Disconnected: 'Disconnected',
    ConnectedWithoutTurn: 'ConnectedWithoutTurn',
}

export const useGStreamerStore = defineStore('gstreamer', () => {
    const protocol = 'wss'
    const address = window.location.hostname
    const port = 8443

    const url = computed(() =>
        new URL(`${protocol}://${address}:${port}`).toString()
    )
    const config = computed(async () => {
        let turnServers = {}

        await fetch(`https://${address}/getCamerasConfiguration`).then(
            async (r) => {
                if (r.status !== 200) {
                    console.error('Cannot get turn configuration')
                } else {
                    turn.value = true
                    turnServers = await r.json()
                    console.log('TURN Configuration', turnServers)
                }
            }
        )

        return {
            meta: {
                name: 'Interface',
            },
            signalingServerUrl: url.value,
            reconnectionTimeout: 2500,
            webrtcConfig: {
                iceServers: [
                    {
                        urls: [
                            'stun:stun.l.google.com:19302',
                            'stun:stun1.l.google.com:19302',
                            'stun:stun.mit.de:3478',
                        ],
                    },
                    turnServers,
                ],
            },
        }
    })
    const status = computed(() => {
        if (!connected.value) {
            return CamerasStatus.Disconnected
        }

        if (!turn.value) {
            return CamerasStatus.Connected
        }

        return CamerasStatus.Connected
    })

    const api = ref()
    const turn = ref(false)
    const connected = ref(false)
    const producers = ref({})

    class ConnectionListener {
        connected(clientId) {
            console.log('[GST]', 'Connected! with id', clientId)
            connected.value = true
            status.value = CamerasStatus.On
        }

        disconnected() {
            console.log('[GST]', 'Disconnected')
            connected.value = false
        }
    }

    class ProducerListener {
        producerAdded(producer) {
            console.log('[GST]', 'Added producer', producer)
            let name = ''
            if (!!producer.meta && !!producer.meta['name']) {
                name = producer.meta['name']
                producers.value = {
                    ...producers.value,
                    [name]: producer.id,
                }
            }
        }
        producerRemoved(producer) {
            console.log('[GST]', 'Removed producer', producer)
            for (let name in producers.value) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        producers.value,
                        name
                    ) &&
                    producers.value[name] === producer.id
                ) {
                    Vue.delete(producers.value, name)
                }
            }
        }
    }

    const connect = () => {
        console.log('[GST]', 'Connecting...')

        const connectionListener = new ConnectionListener()
        const producerListener = new ProducerListener()

        config.value.then(() => {
            api.value = new GstWebRTCAPI(config.value)
            api.value.registerConnectionListener(connectionListener)
            api.value.registerProducersListener(producerListener)

            for (const producer of api.value.getAvailableProducers()) {
                producerListener.producerAdded(producer)
            }
        })
    }

    return {
        api,
        status,
        connected,
        producers,
        connect,
    }
})
