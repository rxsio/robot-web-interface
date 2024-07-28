<script setup>
import { useLayoutStore } from '@/stores'
import { defineProps } from 'vue'

const props = defineProps(['type', 'name', 'icon', 'shape'])

const layoutStore = useLayoutStore()

const addItem = () => {
    const windowId = layoutStore.nextWindowId()
    const size = layoutStore.calculateNextWindowPosition(
        props.shape.w,
        props.shape.h
    )

    layoutStore.layout.shape = [
        ...layoutStore.layout.shape,
        {
            ...props.shape,
            x: size.x,
            y: size.y,
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
}
</script>
<template>
    <v-list-item @click="addItem()">
        <v-list-item-icon>
            <v-icon>{{ props.icon }} {{ layoutStore.columns.value }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
            <v-list-item-title>{{ props.name }}</v-list-item-title>
        </v-list-item-content>
    </v-list-item>
</template>
<style scoped></style>
