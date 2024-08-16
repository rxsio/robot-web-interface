<script setup>
import {
    useGStreamerStore,
    useJoystickStore,
    useRosStore,
    useViewModeStore,
} from '@/stores'
import { computed, defineProps } from 'vue'

import IconButtonList from './IconButtonList.vue'

const props = defineProps(['show'])

const joystickStore = useJoystickStore()
const viewModeStore = useViewModeStore()
const gstreamerStore = useGStreamerStore()
const rosStore = useRosStore()
const { editMode } = viewModeStore

const buttons = computed(() => [
    { type: 'inputList' },
    joystickStore.connected
        ? {
              type: 'icon',
              icon: 'mdi-controller',
              color: 'primary',
              tooltip: ' Controller connected',
              onClick: () => {},
          }
        : {
              type: 'icon',
              icon: 'mdi-controller-off',
              color: 'error',
              tooltip: 'No controller detected!',
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
              color: 'error',
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
              color: 'error',
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
        :buttons="buttons"
        :show="props.show"
    />
</template>
