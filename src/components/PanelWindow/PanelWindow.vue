<script setup>
import { useLayoutStore } from '@/stores'
import windows from '@/windows'
import InvalidWindow from '@/windows/InvalidWindow.vue'
import Vue, { computed, defineProps, ref } from 'vue'

import ConfigDialog from './ConfigDialog.vue'
import WindowBorder from './WindowBorder.vue'

const props = defineProps(['id'])
const layoutStore = useLayoutStore()

const windowData = computed({
    get() {
        return layoutStore.layout.windows[props.id]
    },
    set(newValue) {
        layoutStore.layout.windows[props.id] = newValue
    },
})
const window = computed(
    () =>
        windows[windowData.value.type] || {
            typeName: 'Invalid Window',
            component: InvalidWindow,
            configOptions: {},
            icon: 'mdi-alert-circle',
        }
)
const WindowContentComponent = computed(() => window.value.component)

const remove = () => {
    const index = layoutStore.layout.shape
        .map((item) => item.i)
        .indexOf(props.id)
    layoutStore.layout.shape.splice(index, 1)

    Vue.delete(layoutStore.layout.windows, props.id)
}

const showConfigDialog = ref(false)
const closeConfig = (newConfig) => {
    showConfigDialog.value = false
    if (newConfig) {
        windowData.value = newConfig
    }
}

const windowDimensions = ref({ height: null, width: null })
</script>
<template>
    <WindowBorder
        :name="windowData.name"
        :icon="window.icon"
        @remove="remove()"
        @openConfig="showConfigDialog = true"
        @setDimensions="(value) => (windowDimensions = value)"
    >
        <WindowContentComponent
            :name="windowData.name"
            :type="windowData.type"
            :extraConfig="windowData.extraConfig"
            :windowDimensions="windowDimensions"
        />
        <ConfigDialog
            :isOpen="showConfigDialog"
            @close="closeConfig"
            :config="windowData"
        />
    </WindowBorder>
</template>
<style scoped></style>
