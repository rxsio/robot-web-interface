<script setup>
import { useNavigationDrawerStore, useViewModeStore } from '@/stores'
import FIROExpandedLogo from '@/ui/components/logo/FIROExpandedLogo.vue'
import FIROLogo from '@/ui/components/logo/FIROLogo.vue'
import FIROSmallLogo from '@/ui/components/logo/FIROSmallLogo.vue'
import { computed } from 'vue'

import EditTools from './EditTools.vue'
import NormalTools from './NormalTools.vue'
import AutonomousSteering from './Steering/AutonomousSteering.vue'
import ManualSteering from './Steering/ManualSteering.vue'

const navigationDrawerStore = useNavigationDrawerStore()
const viewModeStore = useViewModeStore()

const menuIcon = computed(() =>
    navigationDrawerStore.opened ? 'mdi-chevron-left' : 'mdi-menu'
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
            @click="navigationDrawerStore.toggle()"
            :disabled="$vuetify.breakpoint.mdAndUp"
        >
            <v-icon>
                {{ $vuetify.breakpoint.smAndDown ? menuIcon : null }}
            </v-icon>
        </v-app-bar-nav-icon>
        <v-toolbar-title>
            <FIROExpandedLogo
                v-if="$vuetify.breakpoint.mdAndUp"
                height="32px"
                width="auto"
                style="margin-top: 7px"
            />
            <FIROLogo
                v-if="$vuetify.breakpoint.sm"
                height="32px"
                width="auto"
                style="margin-top: 7px"
            />
            <FIROSmallLogo
                v-if="$vuetify.breakpoint.xs"
                height="32px"
                width="auto"
                style="margin-top: 7px"
            />
        </v-toolbar-title>
        <v-spacer />
        <AutonomousSteering :show="viewModeStore.mode === 'normal'" />
        <ManualSteering :show="viewModeStore.mode === 'normal'" />
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
