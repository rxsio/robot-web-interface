<script setup>
import { defineProps } from 'vue'
import { useLayoutStore, useViewModeStore } from '@/stores'
const props = defineProps(['type', 'name'])

const layoutStore = useLayoutStore()
const viewModeStore = useViewModeStore()
const addItem = () => {
    const windowId = layoutStore.nextLayoutId()
    layoutStore.layout.shape.push({
        x: 0,
        y: 0,
        w: 2,
        h: 2,
        i: windowId,
    })
    layoutStore.layout.windows[windowId] = {
        type: props.type,
        name: props.name,
        config: {},
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
