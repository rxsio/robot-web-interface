<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useNavigationDrawerStore } from '@/stores'
import layout from '@/configuration/layout.json'

const items = ref(layout)

const navigationDrawer = useNavigationDrawerStore()
onMounted(() => {
    const currentInstance = getCurrentInstance()
    const $vuetify = currentInstance.proxy.$vuetify

    navigationDrawer.set($vuetify.breakpoint.mdAndUp)
})
</script>
<template>
    <v-navigation-drawer
        color="primary"
        clipped
        app
        v-model="navigationDrawer.opened"
        :mini-variant="$vuetify.breakpoint.mdAndUp"
        :permanent="$vuetify.breakpoint.mdAndUp"
        v-if="items.length > 1"
    >
        <v-list
            dense
            shaped
        >
            <v-list-item-group
                color="secondary"
                active-class="selected"
            >
                <v-list-item
                    v-for="item in items"
                    :key="item.title"
                    link
                    :to="{
                        name: 'panel',
                        params: {
                            variant: item.name,
                        },
                    }"
                >
                    <v-tooltip
                        right
                        :disabled="!$vuetify.breakpoint.mdAndUp"
                    >
                        <span>{{ item.title }}</span>
                        <template v-slot:activator="{ on, attrs }">
                            <v-list-item-icon
                                v-bind="attrs"
                                v-on="on"
                            >
                                <v-icon>{{ item.icon }}</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content
                                v-bind="attrs"
                                v-on="on"
                            >
                                <v-list-item-title>
                                    {{ item.title }}
                                </v-list-item-title>
                            </v-list-item-content>
                        </template>
                    </v-tooltip>
                </v-list-item>
            </v-list-item-group>
        </v-list>
    </v-navigation-drawer>
</template>
<style scoped>
.selected {
    color: var(--v-primary-base);
    background-color: var(--v-secondary-base);
}
</style>
