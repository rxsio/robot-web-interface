import { GstWebRTCAPI } from '@/lib/gstwebrtc-api'
import Vue, { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useGStreamerStore = defineStore('gstreamer', () => {
    const protocol = 'wss'
    const address = window.location.hostname
    const port = 8443

    const url = computed(() =>
        new URL(`${protocol}://${address}:${port}`).toString()
    )
    const config = computed(() => {
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
                ],
            },
        }
    })

    const api = ref()
    const connected = ref(false)
    const producers = ref({})

    class ConnectionListener {
        connected(clientId) {
            console.log('[GST]', 'Connected! with id', clientId)
            connected.value = true
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

        const producerListener = new ProducerListener()

        api.value = new GstWebRTCAPI(config.value)
        api.value.registerConnectionListener(new ConnectionListener())
        api.value.registerProducersListener(producerListener)

        for (const producer of api.value.getAvailableProducers()) {
            producerListener.producerAdded(producer)
        }
    }

    return {
        api,
        connected,
        producers,
        connect,
    }
})
