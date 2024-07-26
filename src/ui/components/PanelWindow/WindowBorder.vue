<script setup>
import { Modes, useViewModeStore } from '@/stores'
import { defineEmits, defineProps, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps(['name', 'icon', 'hasConfig'])
const emit = defineEmits(['setDimensions'])
const viewModeStore = useViewModeStore()

const container = ref(null)
const resizeObserver = ref(
    new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.contentRect) {
                const contentRect = Array.isArray(entry.contentRect)
                    ? entry.contentRect[0]
                    : entry.contentRect

                emit('setDimensions', {
                    height: contentRect.height,
                    width: contentRect.width,
                })
            }
        }
    })
)
onMounted(() => {
    resizeObserver.value.observe(container.value)
})
onBeforeUnmount(() => {
    resizeObserver.value.unobserve(container.value)
})
</script>
<template>
    <v-sheet
        color="white"
        elevation="2"
        rounded
        class="background"
    >
        <v-system-bar
            height="30"
            color="secondary"
            window
            class="window-grab-handle"
        >
            <v-icon color="primary">
                {{ props.icon }}
            </v-icon>
            <span class="primary--text text-truncate">
                {{ props.name }}
            </span>
            <v-spacer></v-spacer>

            <v-icon
                color="primary"
                v-if="viewModeStore.mode === Modes.Edit && props.hasConfig"
                @click="$emit('openConfig')"
            >
                mdi-tune
            </v-icon>
            <v-icon
                color="primary"
                v-if="viewModeStore.mode === Modes.Edit"
                @click="$emit('remove')"
            >
                mdi-close
            </v-icon>
        </v-system-bar>
        <div
            ref="container"
            class="content"
        >
            <slot />
        </div>
    </v-sheet>
</template>
<style scoped>
.background {
    flex-grow: 1;
    width: inherit;
    overflow: hidden;
}
.content {
    height: calc(100% - 30px);
    width: inherit;
    display: flex;
}
</style>
