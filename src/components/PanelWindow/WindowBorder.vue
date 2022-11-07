<script setup>
import { defineProps } from 'vue'
import { useViewModeStore } from '@/stores'

const props = defineProps(['name', 'icon'])
const viewModeStore = useViewModeStore()
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
            <div
                style="flex-grow: 1"
                class="window-grab-handle"
            >
                <v-icon color="primary">
                    {{ props.icon }}
                </v-icon>
                <span class="primary--text text-truncate">
                    {{ props.name }}
                </span>
                <v-spacer></v-spacer>
            </div>

            <v-icon
                color="primary"
                v-if="viewModeStore.mode === 'edit'"
                @click="$emit('openConfig')"
            >
                mdi-cog
            </v-icon>
            <v-icon
                color="primary"
                v-if="viewModeStore.mode === 'edit'"
                @click="$emit('remove')"
            >
                mdi-close
            </v-icon>
        </v-system-bar>
        <div class="content">
            <slot />
        </div>
    </v-sheet>
</template>
<style scoped>
.background {
    flex-grow: 1;
    width: inherit;
}
.header {
    color: var(--v-primary-base);
}
.content {
    overflow: scroll;
    height: calc(100% - 30px);
    width: inherit;
    display: flex;
}
</style>
