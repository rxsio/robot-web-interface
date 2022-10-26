<script setup>
import { defineProps, computed } from 'vue'
import { useLayoutStore } from '@/stores'
import { useViewModeStore } from '@/stores'
import windows from '@/windows'

const props = defineProps(['id'])
const layoutStore = useLayoutStore()
const viewModeStore = useViewModeStore()

const windowData = computed(() => layoutStore.layout.windows[props.id])
const window = computed(() => windows[windowData.value.type])
const WindowContentComponent = computed(() => window.value.component)
</script>
<template>
    <v-sheet
        color="white"
        elevation="2"
        class="background"
    >
        <v-system-bar
            height="30"
            color="secondary"
            dark
            window
            class="header"
        >
            <v-icon color="primary">
                {{ window.icon }}
            </v-icon>
            <span class="primary--text text-truncate">
                {{ windowData.name }}
            </span>
            <v-spacer></v-spacer>
            <v-icon
                color="primary"
                v-if="viewModeStore.mode === 'edit'"
            >
                mdi-cog
            </v-icon>
            <v-icon
                color="primary"
                v-if="viewModeStore.mode === 'edit'"
            >
                mdi-close
            </v-icon>
        </v-system-bar>
        <div class="container">
            <WindowContentComponent :config="windowData.config" />
        </div>
    </v-sheet>
</template>
<style scoped>
.background {
    flex-grow: 1;
}
.header {
    color: var(--v-primary-base);
}
.container {
    overflow: scroll;
    height: calc(100% - 30px);
}
</style>
