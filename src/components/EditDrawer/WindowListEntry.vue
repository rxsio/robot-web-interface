<script setup>
import { useLayoutStore, useViewModeStore } from '@/stores'
import { defineProps } from 'vue'

const props = defineProps(['type', 'name'])

const layoutStore = useLayoutStore()
const viewModeStore = useViewModeStore()
const addItem = () => {
    const windowId = layoutStore.nextWindowId()
    layoutStore.layout.shape = [
        ...layoutStore.layout.shape,
        {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
            i: windowId,
        },
    ]
    layoutStore.layout.windows = {
        ...layoutStore.layout.windows,
        [windowId]: {
            type: props.type,
            name: props.name,
            extraConfig: {},
        },
    }

    viewModeStore.toggleEditDrawer()
}
</script>
<template>
    <v-list-item @click="addItem()">
        <v-list-item-content>
            <v-list-item-title>{{ props.name }}</v-list-item-title>
        </v-list-item-content>
    </v-list-item>
</template>
<style scoped></style>
