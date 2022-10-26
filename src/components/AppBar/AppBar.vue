<script setup>
import { computed } from 'vue'

import SKARLogo from '@/assets/SKARLogo'
import { useForceNavDrawerStore, useViewModeStore } from '@/stores'
import NormalTools from './NormalTools.vue'
import EditTools from './EditTools.vue'
import GearSelector from './GearSelector.vue'

const forceNavDrawerStore = useForceNavDrawerStore()
const viewModeStore = useViewModeStore()
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
                :variant="$vuetify.breakpoint.smAndUp ? 'big' : 'small'"
            />
        </v-toolbar-title>
        <v-spacer />
        <GearSelector />
        <NormalTools
            key="normalTools"
            :show="viewModeStore.mode === 'normal'"
        />
        <EditTools
            key="editTools"
            :show="viewModeStore.mode === 'edit'"
        />
    </v-app-bar>
</template>
