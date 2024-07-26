<script setup>
import { useConfigurationStore, useNavigationDrawerStore } from '@/stores'
import { computed, getCurrentInstance, onMounted } from 'vue'

const configurationStore = useConfigurationStore()
const navigationDrawer = useNavigationDrawerStore()

const views = computed(() => configurationStore.views)

onMounted(() => {
    const currentInstance = getCurrentInstance()
    const $vuetify = currentInstance.proxy.$vuetify

    navigationDrawer.set($vuetify.breakpoint.mdAndUp)
})
</script>

<template>
    <v-navigation-drawer
        v-if="views.length > 1"
        v-model="navigationDrawer.opened"
        :mini-variant="$vuetify.breakpoint.mdAndUp"
        :permanent="$vuetify.breakpoint.mdAndUp"
        app
        clipped
        color="primary"
    >
        <v-list
            dense
            shaped
        >
            <v-list-item-group
                active-class="selected"
                color="secondary"
            >
                <v-list-item
                    v-for="item in views"
                    :key="item.title"
                    :to="{
                        name: 'panel',
                        params: {
                            variant: item.name,
                        },
                    }"
                    link
                >
                    <v-tooltip
                        :disabled="!$vuetify.breakpoint.mdAndUp"
                        right
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
