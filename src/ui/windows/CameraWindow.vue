<script setup>
import { SessionState } from '@/lib/gstwebrtc-api/gstwebrtc-api'
import { useGStreamerStore } from '@/stores'
import CameraControls from '@/ui/components/Camera/CameraControls.vue'
import CameraOverlay from '@/ui/components/Camera/CameraOverlay.vue'
import { computed, defineProps, ref, watch } from 'vue'

const gstreamerStore = useGStreamerStore()
const props = defineProps(['windowDimensions', 'extraConfig'])

const producerId = computed(
    () => gstreamerStore.producers[props.extraConfig.videoSource]
)
const session = ref(null)
const state = ref(SessionState.closed)

const videoDimensions = ref({
    width: 0,
    height: 0,
})

const viewer = ref(null)

const dimensions = computed(() => {
    const aspectRatio =
        videoDimensions.value.width / videoDimensions.value.height
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

    if (!producerId.value || !viewer.value) {
        return
    }
    const currentSession = gstreamerStore.api.createConsumerSession(
        producerId.value
    )

    if (currentSession) {
        session.value = currentSession

        currentSession.addEventListener('error', (event) => {
            if (session.value === currentSession) {
                console.error(event.message, event.error)
            }
        })

        currentSession.addEventListener('closed', () => {
            console.log('[dbg] closed()', session.value._sessionId)
            if (session.value === currentSession) {
                if (viewer.value) {
                    viewer.value.pause()
                    viewer.value.srcObject = null
                }

                session.value = null
                state.value = SessionState.closed
            }
        })

        currentSession.addEventListener('streamsChanged', () => {
            if (session.value === currentSession) {
                console.log('[dbg] streaming()', session.value._sessionId)
                const streams = currentSession.streams
                if (streams.length > 0) {
                    if (viewer.value) {
                        viewer.value.srcObject = streams[0]
                        viewer.value.play().catch(() => {})
                    } else {
                        console.log('Viever not available yet')
                    }
                    state.value = SessionState.streaming
                }
            }
        })

        state.value = SessionState.connecting
        currentSession.connect()
    }
}

const disconnect = () => {
    console.log('[dbg] disconnect()')
    if (session.value) {
        session.value.close()
    }
}

const streamStarted = () => {
    videoDimensions.value.width = viewer.value && viewer.value.videoWidth
    videoDimensions.value.height = viewer.value && viewer.value.videoHeight
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
            v-if="statusIcon !== 'none'"
            class="status-icon"
            color="primary"
        >
            {{ statusIcon }}
        </v-icon>
        <CameraOverlay
            v-if="props.extraConfig.overlay === true && statusIcon === 'none'"
            :recording="true"
            :resolution="'1080p'"
            :fps="30"
            :style="{
                width: dimensions.width + 'px',
                height: dimensions.height + 'px',
                'object-fit': 'cover',
            }"
        />
        <CameraControls
            v-if="props.extraConfig.controls && statusIcon === 'none'"
            :style="{
                width: dimensions.width + 'px',
                height: dimensions.height + 'px',
                'object-fit': 'cover',
            }"
        />
        <video
            ref="viewer"
            :style="{
                width: dimensions.width + 'px',
                height: dimensions.height + 'px',
                'object-fit': 'cover',
            }"
            preload="none"
            @playing="streamStarted"
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
