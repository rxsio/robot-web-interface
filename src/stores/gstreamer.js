import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
    startGstreamerConnection,
    registerConnectionListener,
    registerProducersListener,
} from '@/lib/gstwebrtc-api'

export const useGstreamerStore = defineStore('gstreamer', () => {
    const address = 'localhost'
    const port = 8443
    const url = computed(() => new URL(`ws://${address}:${port}`).toString())

    const connected = ref(false)
    const producers = ref({})

    const connectionListener = {
        connected: (clientId) => {
            console.log('[GST]', 'Connected! with id', clientId)
            connected.value = true
        },
        disconnected: () => {
            console.log('[GST]', 'Disconnected')
            connected.value = false
        },
    }
    const producerListener = {
        producerAdded: (producer) => {
            console.log('[GST]', 'Added producer', producer)
            let name = ''
            if (!!producer.meta && !!producer.meta['display-name']) {
                name = producer.meta['display-name']
                producers.value = {
                    ...producers.value,
                    [name]: producer.id,
                }
            }
        },
        producerRemoved: (producer) => {
            console.log('[GST]', 'Removed producer', producer)
            for (let name in producers.value) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        producers.value,
                        name
                    ) &&
                    producers.value[name] == producer.id
                ) {
                    delete producers.value[name]
                    producers.value = { ...producers.value }
                }
            }
        },
    }

    const connect = () => {
        console.log('[GST]', 'Connecting...')
        startGstreamerConnection({
            meta: null,
            signalingServerUrl: url.value,
            reconnectionTimeout: 2500,
            webrtcConfig: {
                iceServers: [
                    {
                        urls: [
                            'stun:stun.l.google.com:19302',
                            'stun:stun1.l.google.com:19302',
                        ],
                    },
                ],
            },
        })

        registerConnectionListener(connectionListener)
        registerProducersListener(producerListener)
    }

    return {
        url,
        connected,
        producers,

        connect,
    }
})
