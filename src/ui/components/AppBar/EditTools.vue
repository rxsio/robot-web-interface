<script setup>
import { useLayoutStore, useViewModeStore } from '@/stores'
import { defineProps } from 'vue'

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

const exportLayout = () => {
    console.log(JSON.stringify(layoutStore.layouts))

    const a = document.createElement('a')
    const file = new Blob([JSON.stringify(layoutStore.layouts)], {
        type: 'text/json',
    })
    a.href = URL.createObjectURL(file)
    a.download = 'robotControlInterfaceLayout.json'
    a.click()
    a.remove()
}

const importLayout = (event) => {
    ;(async () => {
        if (event.target?.files?.[0]) {
            layoutStore.layouts = JSON.parse(await event.target.files[0].text())
        }
    })()
}

const buttons = [
    {
        type: 'icon',
        icon: 'mdi-tab-plus',
        color: 'primary',
        tooltip: 'Add window',
        onClick: viewModeStore.toggleEditDrawer,
    },
    { type: 'divider' },
    {
        type: 'icon',
        icon: 'mdi-download',
        color: 'primary',
        tooltip: 'Export layout',
        onClick: exportLayout,
    },
    {
        type: 'fileUpload',
        icon: 'mdi-import',
        color: 'primary',
        tooltip: 'Import layout',
        onClick: importLayout,
    },
    {
        type: 'divider',
    },
    {
        type: 'icon',
        icon: 'mdi-content-save-outline',
        color: 'primary',
        tooltip: 'Save and close',
        onClick: saveAndClose,
    },
    {
        type: 'icon',
        icon: 'mdi-refresh',
        color: 'error',
        tooltip: 'Reset layout',
        onClick: layoutStore.resetAll,
    },
    {
        type: 'icon',
        icon: 'mdi-close',
        color: 'error',
        tooltip: 'Close without saving',
        onClick: discardAndClose,
    },
]
</script>
<template>
    <IconButtonList
        :buttons="buttons"
        :show="props.show"
    />
</template>
