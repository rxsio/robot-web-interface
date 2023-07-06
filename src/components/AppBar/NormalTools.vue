<script setup>
import { computed, defineProps } from 'vue'
import { useViewModeStore, useGstreamerStore } from '@/stores'
import IconButtonList from './IconButtonList.vue'

const props = defineProps(['show'])

const viewModeStore = useViewModeStore()
const gstreamerStore = useGstreamerStore()
const { editMode } = viewModeStore

const buttons = computed(() => [
    {
        type: 'icon',
        icon: 'mdi-controller-off',
        color: 'red',
        tooltip: 'Controller disconnected',
        onClick: () => {},
    },
    gstreamerStore.connected
        ? {
              type: 'icon',
              icon: 'mdi-video',
              color: 'primary',
              tooltip: 'Video server connected',
              onClick: () => {},
          }
        : {
              type: 'icon',
              icon: 'mdi-video-off',
              color: 'red',
              tooltip: 'Video server disconnected',
              onClick: () => {},
          },
    {
        type: 'icon',
        icon: 'mdi-robot-off',
        color: 'red',
        tooltip: 'Robot disconnected',
        onClick: () => {},
    },
    { type: 'divider' },
    {
        type: 'icon',
        icon: 'mdi-application-edit-outline',
        color: 'primary',
        tooltip: 'Edit layout',
        onClick: editMode,
    },
    { type: 'divider' },
    {
        type: 'icon',
        icon: 'mdi-alert',
        color: 'primary',
        tooltip: 'No alerts',
        onClick: () => {},
    },
])
</script>
<template>
    <IconButtonList
        :show="props.show"
        :buttons="buttons"
    />
</template>
