<script setup>
import { computed } from 'vue'

import SKARLogo from '@/assets/SKARLogo'
import { useForceNavDrawerStore, useViewStateStore } from '@/stores'
import NormalTools from './NormalTools.vue'
import EditTools from './EditTools.vue'

const forceNavDrawerStore = useForceNavDrawerStore()
const viewStateStore = useViewStateStore()
const toggleDrawer = forceNavDrawerStore.toggle

const menuIcon = computed(() =>
    forceNavDrawerStore.opened ? 'mdi-chevron-left' : 'mdi-menu'
)
</script>
<template>
    <v-app-bar
        color="secondary"
        clipped-left
        clipped-right
        app
    >
        <v-app-bar-nav-icon
            color="primary"
            @click.stop="toggleDrawer()"
            :disabled="$vuetify.breakpoint.mdAndUp"
        >
            <v-icon>
                {{ $vuetify.breakpoint.smAndDown ? menuIcon : null }}
            </v-icon>
        </v-app-bar-nav-icon>
        <v-toolbar-title>
            <SKARLogo
                height="50px"
                width="auto"
                style="margin-top: 7px"
            />
        </v-toolbar-title>
        <v-spacer />
        <NormalTools
            key="normalTools"
            :show="viewStateStore.mode === 'normal'"
        />
        <EditTools
            key="editTools"
            :show="viewStateStore.mode === 'edit'"
        />
    </v-app-bar>
</template>
