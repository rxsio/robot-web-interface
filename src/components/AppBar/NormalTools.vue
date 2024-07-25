<script setup>
import { useGstreamerStore, useRosStore, useViewModeStore } from '@/stores'
import { computed, defineProps } from 'vue'

import IconButtonList from './IconButtonList.vue'

const props = defineProps(['show'])

const viewModeStore = useViewModeStore()
const gstreamerStore = useGstreamerStore()
const rosStore = useRosStore()
const { editMode } = viewModeStore

const buttons = computed(() => [
    { type: 'inputList' },
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
    rosStore.connected
        ? {
              type: 'icon',
              icon: 'mdi-robot',
              color: 'primary',
              tooltip: 'Robot connected',
              onClick: () => {},
          }
        : {
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
