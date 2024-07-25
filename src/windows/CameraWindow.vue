<script setup>
import {
    createConsumerSession,
    SessionState,
} from '@/lib/gstwebrtc-api/gstwebrtc-api'
import { useGstreamerStore } from '@/stores'
import { computed, defineProps, ref, watch } from 'vue'

const gstreamerStore = useGstreamerStore()
const props = defineProps(['windowDimensions', 'extraConfig'])

const producerId = computed(
    () => gstreamerStore.producers[props.extraConfig.videoSource]
)
const session = ref(null)
const state = ref(SessionState.closed)

const videoDim = ref({
    width: null,
    height: null,
})

const viewer = ref(null)

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

const connect = () => {
    console.log('[dbg] connect()', producerId.value)
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
                console.log('[dbg] closed()', session.value._sessionId)
                if (session.value === currSession) {
                    if (viewer.value) {
                        viewer.value.pause()
                        viewer.value.srcObject = null
                    }

                    session.value = null
                    state.value = SessionState.closed
                }
            })

            currSession.addEventListener('streamsChanged', () => {
                if (session.value === currSession) {
                    console.log('[dbg] streaming()', session.value._sessionId)
                    const streams = currSession.streams
                    if (streams.length > 0) {
                        if (viewer.value) {
                            viewer.value.srcObject = streams[0]
                            viewer.value.play().catch(() => {})
                        }
                        state.value = SessionState.streaming
                    }
                }
            })

            state.value = SessionState.connecting
            currSession.connect()
        }
    }
}

const disconnect = () => {
    console.log('[dbg] disconnect()')
    if (session.value) {
        session.value.close()
    }
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

const statusIcon = computed(() => {
    if (!gstreamerStore.connected) return 'mdi-power-plug-off'
    else
        return (
            {
                [SessionState.closed]: 'mdi-video-off',
                [SessionState.connecting]: 'mdi-loading',
                [SessionState.streaming]: 'none',
            }[state.value] || 'mdi-help'
        )
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
        <v-icon
            color="primary"
            class="status-icon"
            v-if="statusIcon !== 'none'"
        >
            {{ statusIcon }}
        </v-icon>
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
<style scoped>
.video-name {
    text-shadow: -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000,
        2px 2px 0 #000, -3px 0px 0 #000, 0px -3px 0 #000, 3px 0px 0 #000,
        0px 3px 0 #000;
    color: white;
    font-size: 30px;
    position: absolute;
    top: 10px;
    left: 10px;
}
.status-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 100px;
}
</style>
