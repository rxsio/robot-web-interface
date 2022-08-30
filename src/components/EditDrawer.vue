<script setup>
import { useViewStateStore } from '@/stores'

const viewStateStore = useViewStateStore()
const { toggleEditDrawer } = viewStateStore
</script>
<template>
    <v-navigation-drawer
        temporary
        v-model="viewStateStore.editDrawer"
        right
        fixed
        hide-overlay
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
            </v-list-item-group>
        </v-list>
    </v-navigation-drawer>
</template>
