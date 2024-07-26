<script setup>
import { useLayoutStore } from '@/stores'
import { defineProps } from 'vue'

const props = defineProps(['type', 'name', 'icon', 'shape'])

const layoutStore = useLayoutStore()

const addItem = () => {
    const windowId = layoutStore.nextWindowId()

    layoutStore.layout.shape = [
        ...layoutStore.layout.shape,
        {
            ...props.shape,
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
            <v-icon>{{ props.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
            <v-list-item-title>{{ props.name }}</v-list-item-title>
        </v-list-item-content>
    </v-list-item>
</template>
<style scoped></style>
