<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    contrast: Boolean,
    records: Boolean,
})

const controls = [
    props.records
        ? {
              id: 'stopRecording',
              name: 'Stop recording',
              icon: 'mdi-stop',
          }
        : {
              id: 'startRecording',
              name: 'Start recording',
              icon: 'mdi-record-circle-outline',
          },
    {
        id: 'restart',
        name: 'Restart camera position',
        icon: 'mdi-format-horizontal-align-center',
    },
    {
        id: 'screenshot',
        name: 'Take photo',
        icon: 'mdi-camera',
    },
]
</script>

<template>
    <div :class="['overlay', { contrast: props.contrast }]">
        <div class="rotate rotate-left"></div>
        <div class="controls">
            <v-tooltip
                v-for="control in controls"
                :key="control.id"
                bottom
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        v-on="on"
                        :class="['control', control.id]"
                        @click="$emit('cameraControl', control.id)"
                    >
                        {{ control.icon }}
                    </v-icon>
                </template>
                <span>{{ control.name }}</span>
            </v-tooltip>
        </div>
        <div class="rotate rotate-right"></div>
    </div>
</template>

<style scoped>
.overlay {
    z-index: 100;
    position: absolute;
    width: 100%;
    height: 100%;
    border: 24px solid transparent;
    --camera-controls-base-color: #555;
}
.overlay.contrast {
    --camera-controls-base-color: #aaa;
}

.rotate {
    cursor: pointer;
    position: absolute;
    top: 50%;
    width: 20px;
    height: 20px;
    border: 0 solid var(--camera-controls-base-color);
    transform: translateY(-50%) rotate(45deg);
    transition: all 250ms ease;
}
.rotate-left {
    left: 0;
    border-left-width: 3px;
    border-bottom-width: 3px;
}
.rotate-right {
    right: 0;
    border-right-width: 3px;
    border-top-width: 3px;
}

.controls {
    position: absolute;
    display: flex;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}
.control {
    cursor: pointer;
    padding: 0 4px;
}
.control.v-icon {
    color: var(--camera-controls-base-color);
}
</style>
