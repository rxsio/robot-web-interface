<script setup>
import {
    computed,
    defineProps,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue'
import { createConsumerSession } from '@/lib/gstwebrtc-api/gstwebrtc-api'
import { useGstreamerStore } from '@/stores'
const gstreamerStore = useGstreamerStore()
const props = defineProps(['windowDimensions', 'extraConfig'])

const producerId = computed(
    () => gstreamerStore.producers[props.extraConfig.videoSource]
)
const session = ref(null)
const state = ref('Disconnected')

const videoDim = ref({
    width: null,
    height: null,
})

const dimensions = computed(() => {
    const aspectRatio = videoDim.value.width / videoDim.value.height
    let { width, height } = props.windowDimensions

    // room for the border
    width -= 10
    height -= 10

    // calculate dimensions for maxed width or height
    let maxWidth = {
        width,
        height: width / aspectRatio,
    }
    let maxHeight = {
        width: height * aspectRatio,
        height,
    }

    // choose the one that will fit
    if (height < maxWidth.height) {
        return maxHeight
    } else {
        return maxWidth
    }
})

const viewer = ref(null)

const connect = () => {
    console.log(producerId.value)
    if (producerId.value && viewer.value) {
        const currSession = createConsumerSession(producerId.value)
        if (currSession) {
            session.value = currSession

            currSession.addEventListener('error', (event) => {
                if (session.value === currSession) {
                    console.error(event.message, event.error)
                }
            })

            currSession.addEventListener('closed', () => {
                if (session.value === currSession) {
                    viewer.value.pause()
                    viewer.value.srcObject = null

                    session.value = null
                    state.value = 'Disconnected'
                }
            })

            currSession.addEventListener('streamsChanged', () => {
                if (session.value === currSession) {
                    const streams = currSession.streams
                    if (streams.length > 0) {
                        viewer.value.srcObject = streams[0]
                        viewer.value.play().catch(() => {})
                        state.value = ''
                    }
                }
            })

            state.value = 'Connecting...'
            currSession.connect()
        }
    }
}

const disconnect = () => {
    if (session.value) session.value.close()
}

const streamStarted = () => {
    videoDim.value.width = viewer.value && viewer.value.videoWidth
    videoDim.value.height = viewer.value && viewer.value.videoHeight
}

watch(
    () => [producerId.value, viewer.value],
    (oldVal, newVal, onCleanup) => {
        onCleanup(disconnect)
        connect()
    }
)

onMounted(() => {
    connect()
})
onBeforeUnmount(() => {
    disconnect()
})
</script>
<template>
    <div
        :style="{
            'background-color': 'black',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            width: props.windowDimensions.width + 'px',
            height: props.windowDimensions.height + 'px',
            overflow: 'hidden',
            position: 'relative',
        }"
    >
        <span
            :style="{
                'text-shadow':
                    '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -3px 0px 0 #000, 0px -3px 0 #000, 3px 0px 0 #000, 0px 3px 0 #000',
                color: 'white',
                'font-size': '30px',
                position: 'absolute',
                top: '10px',
                left: '10px',
            }"
        >
            {{ props.extraConfig.videoSource }}
        </span>
        <span
            :style="{
                'text-shadow':
                    '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -3px 0px 0 #000, 0px -3px 0 #000, 3px 0px 0 #000, 0px 3px 0 #000',
                color: 'white',
                'font-size': '30px',
                position: 'absolute',
                top: '50%',
                left: '50%',
            }"
        >
            {{ gstreamerStore.connected ? state : 'No server' }}
        </span>
        <video
            preload="none"
            ref="viewer"
            @playing="streamStarted"
            :style="{
                width: dimensions.width + 'px',
                height: dimensions.height + 'px',
                'object-fit': 'cover',
            }"
        />
    </div>
</template>
