<script setup>
import KeyboardControl from '@/components/ControlWindow/KeyboardControl.vue'
import ManipKeyboardControl from '@/components/ControlWindow/ManipKeyboardControl.vue'
import TouchControl from '@/components/ControlWindow/TouchControl.vue'
import ManipTouchControl from '@/components/ControlWindow/ManipTouchControl.vue'
import { useRosStore } from '@/stores'
import { defineProps } from 'vue'

const props = defineProps(['extraConfig'])

const rosStore = useRosStore()
</script>

<template>
    <div>
        <KeyboardControl
            v-if="
                props.extraConfig.controlledObject === 'Rover' &&
                props.extraConfig.controlMode === 'Keyboard'
            "
            :ros="rosStore.ws"
        />
        <ManipKeyboardControl
            v-else-if="
                props.extraConfig.controlledObject === 'Manipulator' &&
                props.extraConfig.controlMode === 'Keyboard'
            "
            :ros="rosStore.ws"
        />
        <TouchControl
            v-else-if="
                props.extraConfig.controlledObject === 'Rover' &&
                props.extraConfig.controlMode === 'Touch'
            "
            :ros="rosStore.ws"
        />
        <ManipTouchControl
            v-else-if="
                props.extraConfig.controlledObject === 'Manipulator' &&
                props.extraConfig.controlMode === 'Touch'
            "
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
