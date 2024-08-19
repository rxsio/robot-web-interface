<script setup>
import { defineProps, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
    recording: Boolean,
    viewer: undefined,
    contrast: Boolean,
})

const resolution = ref('---')
const fps = ref('---')

const update = () => {
    if (props.viewer.srcObject === null) {
        return
    }

    const tracks = props.viewer.srcObject.getVideoTracks()
    if (tracks.length === 0) {
        resolution.value = '---'
        fps.value = '---'
    } else {
        const settings = tracks[0].getSettings()

        if (settings.width !== undefined && settings.height !== undefined) {
            resolution.value = `${settings.width}x${settings.height}`
        } else {
            resolution.value = '---'
        }

        if (settings.frameRate !== undefined) {
            fps.value = Math.round(settings.frameRate) || '---'
        }
    }

    requestAnimationFrame(update)
}

onMounted(() => {
    props.viewer.addEventListener('play', update)
})

onUnmounted(() => {
    props.viewer.removeEventListener('play', update)
})
</script>

<template>
    <div :class="['overlay', { contrast: props.contrast }]">
        <div class="corner corner-nw">
            <div
                class="recording"
                v-if="props.recording"
            >
                <v-icon>mdi-record</v-icon>
                REC
            </div>
        </div>
        <div class="corner corner-ne"></div>
        <div class="corner corner-sw">
            <div class="resolution">{{ resolution }}</div>
        </div>
        <div class="corner corner-se">
            <div class="frame-rate">{{ fps }} FPS</div>
        </div>

        <div class="crosshair">
            <div class="corner corner-nw"></div>
            <div class="corner corner-ne"></div>
            <div class="corner corner-sw"></div>
            <div class="corner corner-se"></div>
        </div>
    </div>
</template>

<style scoped>
:root {
    --universal-corner-padding: 16px;
    --universal-corner-size: 50px;
    --universal-corner-thickness: 3px;
}

.overlay {
    z-index: 90;
    position: absolute;
    width: 100%;
    height: 100%;
    border: 24px solid transparent;
    color: var(--universal-corner-color);
    --universal-corner-color: #ccc;
    --universal-corner-size: 10%;
    --universal-corner-padding: 8px;
    --universal-corner-thickness: 3px;
}
.overlay.contrast {
    --universal-corner-color: #fffa00;
}

.crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20%;
    height: auto;
    aspect-ratio: 1 / 1;
    transform: translate(-50%, -50%);
    --universal-corner-size: 20%;
    --universal-corner-thickness: 2px;
}
.crosshair::after,
.crosshair::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--universal-corner-color);
}
.crosshair::after {
    width: 20%;
    height: 1%;
}
.crosshair::before {
    width: 1%;
    height: 20%;
}

.frame-rate,
.resolution,
.recording {
    width: 300px;
    font-weight: bold;
}

.recording i {
    color: #be212f;
    margin-right: -4px;
    margin-top: -1px;
    animation-name: pulsate;
    animation-duration: 1s;
    animation-delay: 2s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
    animation-direction: alternate;
}

@keyframes pulsate {
    from {
        transform: scale(0.9);
    }
    to {
        transform: scale(1.1);
    }
}

/* Universal corners */
.corner {
    display: flex;
    position: absolute;
    width: var(--universal-corner-size);
    height: auto;
    aspect-ratio: 1 / 1;
    border: 0 solid var(--universal-corner-color);
    background: transparent;
}

.corner.corner-nw,
.corner.corner-ne {
    top: 0;
    padding-top: var(--universal-corner-padding);
    align-items: flex-start;
    border-top-width: var(--universal-corner-thickness);
}
.corner.corner-ne,
.corner.corner-se {
    right: 0;
    padding-right: var(--universal-corner-padding);
    text-align: right;
    justify-content: flex-end;
    border-right-width: var(--universal-corner-thickness);
}
.corner.corner-sw,
.corner.corner-se {
    bottom: 0;
    padding-bottom: var(--universal-corner-padding);
    align-items: flex-end;
    border-bottom-width: var(--universal-corner-thickness);
}
.corner.corner-nw,
.corner.corner-sw {
    left: 0;
    padding-left: var(--universal-corner-padding);
    justify-content: flex-start;
    border-left-width: var(--universal-corner-thickness);
}
.corner.corner-se,
.corner.corner-nw {
    flex-direction: column;
}
.corner.corner-sw,
.corner.corner-ne {
    flex-direction: row;
}
</style>
