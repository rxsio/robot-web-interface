<script setup>
import {
    computed,
    defineProps,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue'
import { useGstreamerStore } from '@/stores'
const gstreamerStore = useGstreamerStore()
const props = defineProps(['windowDimensions', 'extraConfig'])

const peerId = computed(
    () => gstreamerStore.peers[props.extraConfig.videoSource]
)

const wsConn = ref(null)
const peerConnection = ref(null)
const sessionId = ref(null)
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
    if (peerId.value && viewer.value) {
        if (wsConn.value) wsConn.value.close()

        wsConn.value = new WebSocket(gstreamerStore.url)
        wsConn.value.onopen = () => {
            connectPeer()
        }
        wsConn.value.onerror = () => {
            endSession()
        }
        wsConn.value.onclose = () => {
            endSession()
        }
        wsConn.value.onmessage = (event) => {
            const msg = JSON.parse(event.data)

            switch (msg.type) {
                case 'registered':
                    connectPeer()
                    break
                case 'sessionStarted':
                    sessionId.value = msg.sessionId
                    break
                case 'error':
                    endSession()
                    break
                case 'endSession':
                    endSession()
                    break
                case 'peer':
                    // Incoming peer message signals the beginning of a call
                    if (!peerConnection.value) createCall(msg)

                    if (msg.sdp != null) {
                        incomingSDP(msg.sdp)
                    } else if (msg.ice != null) {
                        incomingICE(msg.ice)
                    }
                    break
            }
        }
    }
}

const connectPeer = () => {
    wsConn.value.send(
        JSON.stringify({
            type: 'startSession',
            peerId: peerId.value,
        })
    )
}

const incomingICE = (ice) => {
    peerConnection.value.addIceCandidate(new RTCIceCandidate(ice))
}

const incomingSDP = (sdp) => {
    peerConnection.value.setRemoteDescription(sdp).then(remoteDescriptionSet)
}
const remoteDescriptionSet = () => {
    peerConnection.value.createAnswer().then(localDescription)
}
const localDescription = (desc) => {
    peerConnection.value.setLocalDescription(desc).then(() => {
        wsConn.value.send(
            JSON.stringify({
                type: 'peer',
                sessionId: sessionId.value,
                sdp: peerConnection.value.localDescription.toJSON(),
            })
        )
    })
}

const createCall = () => {
    peerConnection.value = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            {
                urls: 'turn:turn.homeneural.net:3478?transport=udp',
                credential: '1qaz2wsx',
                username: 'test',
            },
        ],
    })
    peerConnection.value.ontrack = remoteStreamAdded
}
const remoteStreamAdded = (event) => {
    let videoTracks = event.streams[0].getVideoTracks()
    // let audioTracks = event.streams[0].getAudioTracks()

    if (videoTracks.length > 0) {
        viewer.value.srcObject = event.streams[0]
        viewer.value.play()
    } else {
        endSession()
    }
}
const endSession = (retry = true) => {
    if (wsConn.value) wsConn.value.close()
    wsConn.value = null
    peerConnection.value = null

    if (retry) setTimeout(1000, () => connect())
}

const streamStarted = () => {
    videoDim.value.width = viewer.value && viewer.value.videoWidth
    videoDim.value.height = viewer.value && viewer.value.videoHeight
}

watch(
    () => [peerId.value, viewer],
    () => {
        connect()
    }
)

onMounted(() => {
    connect()
})
onBeforeUnmount(() => {
    endSession(false)
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
