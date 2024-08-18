<script setup>
import { Modes, useLayoutStore, useViewModeStore } from '@/stores'
import AppBar from '@/ui/components/AppBar'
import BatteryBar from '@/ui/components/BatteryBar.vue'
import EditDrawer from '@/ui/components/EditDrawer'
import NavigationDrawer from '@/ui/components/NavigationDrawer.vue'
import PanelWindow from '@/ui/components/PanelWindow'
import { computed } from 'vue'
import { GridItem, GridLayout } from 'vue-grid-layout'

const viewModeStore = useViewModeStore()
const layoutStore = useLayoutStore()

const isEditMode = computed(() => viewModeStore.mode === Modes.Edit)

const breakpointPresets = { lg: 12, md: 10, sm: 6, xs: 4, xss: 2 }

// eslint-disable-next-line no-unused-vars
const breakpointChanged = (b, _) => {
    layoutStore.updateColumns(breakpointPresets[b])
}
</script>
<template>
    <div style="width: 100%; flex-grow: 1; display: flex">
        <AppBar />
        <NavigationDrawer />
        <BatteryBar />
        <EditDrawer />
        <v-main>
            <div
                class="background content-wrapper"
                :style="{ 'user-select': isEditMode ? 'none' : 'text' }"
            >
                <GridLayout
                    :key="`${layoutStore.panel} ${layoutStore.screen}`"
                    :layout.sync="layoutStore.layout.shape"
                    :row-height="10"
                    :margin="[5, 5]"
                    :is-draggable="isEditMode"
                    :is-resizable="isEditMode"
                    :is-bounded="true"
                    :vertical-compact="false"
                    :use-css-transforms="true"
                    :responsive="true"
                    :auto-size="false"
                    class="content-wrapper-grid"
                    @breakpoint-changed="breakpointChanged"
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
                        <PanelWindow :id="item.i" />
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
.content-wrapper-grid {
    height: 100%;
}
.window-wrapper {
    display: flex;
    touch-action: none;
}
.window-wrapper .vue-resizable-handle {
    z-index: 1000;
}
</style>
