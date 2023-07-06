<script setup>
import { defineProps } from 'vue'
import { useViewModeStore, useLayoutStore } from '@/stores'
import IconButtonList from './IconButtonList.vue'

const props = defineProps(['show'])

const viewModeStore = useViewModeStore()

const layoutStore = useLayoutStore()

const saveAndClose = () => {
    viewModeStore.normalMode()
    layoutStore.save()
}
const discardAndClose = () => {
    viewModeStore.normalMode()
    layoutStore.reload()
}

const buttons = [
    {
        type: 'icon',
        icon: 'mdi-content-save',
        color: 'primary',
        tooltip: 'Save and close',
        onClick: saveAndClose,
    },
    {
        type: 'icon',
        icon: 'mdi-close',
        color: 'primary',
        tooltip: 'Close without saving',
        onClick: discardAndClose,
    },
    { type: 'divider' },
    {
        type: 'icon',
        icon: 'mdi-delete-alert',
        color: 'red',
        tooltip: 'Reset layout',
        onClick: layoutStore.resetAll,
    },
    {
        type: 'icon',
        icon: 'mdi-plus-box',
        color: 'primary',
        tooltip: 'Add window',
        onClick: viewModeStore.toggleEditDrawer,
    },
]
</script>
<template>
    <IconButtonList
        :show="props.show"
        :buttons="buttons"
    />
</template>
