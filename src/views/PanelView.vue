<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout'

import AppBar from '@/components/AppBar'
import NavigationDrawer from '@/components/NavigationDrawer.vue'
import EditDrawer from '@/components/EditDrawer'
import BatteryBar from '@/components/BatteryBar.vue'
import WindowBorder from '@/windows/WindowBorder.vue'

import { useViewModeStore, useLayoutStore } from '@/stores'

const viewModeStore = useViewModeStore()
const layoutStore = useLayoutStore()

const isEditMode = computed(() => viewModeStore.mode === 'edit')

const panelContainer = ref(null)
const panelGrid = ref(null)
onMounted(() => {
    layoutStore.mountPanel(panelContainer.value, panelGrid.value)
})
onUnmounted(() => {
    layoutStore.unMountPanel()
})
</script>
<template>
    <div style="width: 100%; flex-grow: 1; display: flex">
        <AppBar />
        <NavigationDrawer />
        <BatteryBar />
        <EditDrawer />
        <v-main>
            <div
                ref="panelContainer"
                class="grey lighten-4 content-wrapper"
                :style="{ 'user-select': isEditMode ? 'none' : 'text' }"
            >
                <GridLayout
                    ref="panelGrid"
                    :layout.sync="layoutStore.layout.shape"
                    :col-num="12"
                    :row-height="100"
                    :is-draggable="isEditMode"
                    :is-resizable="isEditMode"
                    :responsive="true"
                    :use-css-transforms="true"
                >
                    <GridItem
                        v-for="item in layoutStore.layout.shape"
                        :key="item.i"
                        :static="false"
                        :x="item.x"
                        :y="item.y"
                        :w="item.w"
                        :h="item.h"
                        :i="item.i"
                        class="window-wrapper"
                        dragAllowFrom=".window-grab-handle"
                    >
                        <WindowBorder
                            v-if="item.i !== 'drop'"
                            :id="item.i"
                        />
                        <div v-if="item.i === 'drop'">
                            AAAAAAAAAAAAAAAAAAAAAAa
                        </div>
                    </GridItem>
                </GridLayout>
            </div>
        </v-main>
    </div>
</template>
<style scoped>
.content-wrapper {
    height: calc(100vh - 64px);
    overflow: scroll;
}
.window-wrapper {
    display: flex;
    touch-action: none;
}
</style>
