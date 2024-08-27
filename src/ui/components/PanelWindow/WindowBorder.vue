<script setup>
import { Modes, useViewModeStore } from '@/stores'
import {
    computed,
    defineEmits,
    defineProps,
    onBeforeUnmount,
    onMounted,
    ref,
} from 'vue'

const props = defineProps(['name', 'icon', 'hasConfig', 'controls'])
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

const modeControls = computed(() => {
    let filtered = props.controls
        ? props.controls.filter((x) => x.mode() === viewModeStore.mode)
        : []

    if (viewModeStore.mode === Modes.Edit) {
        if (props.hasConfig) {
            filtered.push({
                id: 'openConfig',
                name: 'Open Config',
                icon: 'mdi-tune',
                mode: viewModeStore.mode,
            })
        }

        filtered.push({
            id: 'close',
            name: 'Close',
            icon: 'mdi-close',
            mode: viewModeStore.mode,
        })
    }

    return filtered
})

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

            <v-tooltip
                v-for="control of modeControls"
                :key="control.name"
                bottom
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        v-bind="attrs"
                        v-on="on"
                        color="primary"
                        @click="$emit('control', control.id)"
                    >
                        {{ control.icon }}
                    </v-icon>
                </template>
                <span>{{ control.name }}</span>
            </v-tooltip>
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
.window-grab-handle .v-icon {
    margin-top: 2px;
}
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
