<script setup>
import KeyboardControl from '@/components/ControlWindow/KeyboardControl.vue'
import ManipKeyboardControl from '@/components/ControlWindow/ManipKeyboardControl.vue'
import { useRosStore } from '@/stores'
import { defineProps } from 'vue'

const props = defineProps(['extraConfig'])

const rosStore = useRosStore()
</script>

<template>
    <div>
        <KeyboardControl
            v-if="props.extraConfig.controlledObject === 'Rover'"
            :ros="rosStore.ws"
        />
        <ManipKeyboardControl
            v-else-if="props.extraConfig.controlledObject === 'Manipulator'"
            :ros="rosStore.ws"
        />
        <div v-else>Choose the window type.</div>
    </div>
</template>

<style scoped>
* {
    width: 100%;
    height: 100%;
}
</style>
