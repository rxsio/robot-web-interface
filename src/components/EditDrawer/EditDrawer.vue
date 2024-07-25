<script setup>
import { useViewModeStore } from '@/stores'
import windowList from '@/windows'

import WindowListEntry from './WindowListEntry.vue'

const viewModeStore = useViewModeStore()
const { toggleEditDrawer } = viewModeStore
</script>
<template>
    <v-navigation-drawer
        temporary
        v-model="viewModeStore.editDrawer"
        right
        fixed
        hide-overlay
        touchless
    >
        <v-list dense>
            <v-list-item-group>
                <v-list-item @click="toggleEditDrawer()">
                    <v-list-item-icon>
                        <v-icon>mdi-close</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Close</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider />
                <WindowListEntry
                    v-for="[type, { typeName }] in Object.entries(windowList)"
                    :key="type"
                    :name="typeName"
                    :type="type"
                />
            </v-list-item-group>
        </v-list>
    </v-navigation-drawer>
</template>
