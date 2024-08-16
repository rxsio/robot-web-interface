<script setup>
import { useViewModeStore } from '@/stores'
import windowList from '@/ui/windows'

import WindowListEntry from './WindowListEntry.vue'

const viewModeStore = useViewModeStore()
</script>
<template>
    <v-navigation-drawer
        v-model="viewModeStore.editDrawer"
        temporary
        right
        fixed
        hide-overlay
        touchless
        color="primaryEdit"
    >
        <v-list
            dense
            nav
        >
            <v-list-item-group>
                <WindowListEntry
                    v-for="[
                        type,
                        { typeName, icon, defaultShape },
                    ] in Object.entries(windowList)"
                    :key="type"
                    :name="typeName"
                    :type="type"
                    :icon="icon"
                    :shape="defaultShape"
                />
            </v-list-item-group>
        </v-list>
    </v-navigation-drawer>
</template>
