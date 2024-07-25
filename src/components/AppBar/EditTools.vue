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
    console.log(JSON.stringify(layoutStore.allLayouts))

    const a = document.createElement('a')
    const file = new Blob([JSON.stringify(layoutStore.allLayouts)], {
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
            layoutStore.allLayouts = JSON.parse(
                await event.target.files[0].text()
            )
        }
    })()
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
    { type: 'divider' },
    {
        type: 'icon',
        icon: 'mdi-application-export',
        color: 'primary',
        tooltip: 'Export layout',
        onClick: exportLayout,
    },
    {
        type: 'fileUpload',
        icon: 'mdi-application-import',
        color: 'primary',
        tooltip: 'Import layout',
        onClick: importLayout,
    },
]
</script>
<template>
    <IconButtonList
        :show="props.show"
        :buttons="buttons"
    />
</template>
