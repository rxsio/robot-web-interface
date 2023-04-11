<script setup>
import KeyboardControl from '@/components/ControlWindow/KeyboardControl.vue'
import ManipKeyboardControl from '@/components/ControlWindow/ManipKeyboardControl.vue'
import TouchControl from '@/components/ControlWindow/TouchControl.vue'
import ManipTouchControl from '@/components/ControlWindow/ManipTouchControl.vue'
import { useRosStore } from '@/stores'
import { defineProps } from 'vue'

const props = defineProps(['extraConfig'])

const rosStore = useRosStore()
// Modes to add:
// - rover - car, tank switched in one window - keyboard with inercia
// - rover - car, tank switched in another window - joystick without inercia (on mobile)
// - manip - velocity steering, inverse kinematics - keyboard with inercia
// - manip - velocity steering, inverse kinematics - joystick without inercia (on mobile)
// - manip - position steering, forward and inverse kinematics in one window - typing values
</script>

<template>
    <div>
        <KeyboardControl
            v-if="
                props.extraConfig.controlledObject === 'Rover' &&
                props.extraConfig.controlMode === 'Keyboard'
            "
            :ros="rosStore.ws"
            :maxLinearSpeed="props.extraConfig.maxLinearSpeed"
            :maxAngularSpeed="props.extraConfig.maxAngularSpeed"
        />
        <ManipKeyboardControl
            v-else-if="
                props.extraConfig.controlledObject === 'Manipulator' &&
                props.extraConfig.controlMode === 'Keyboard'
            "
            :ros="rosStore.ws"
            :maxLinearSpeed="props.extraConfig.maxLinearSpeed"
            :maxAngularSpeed="props.extraConfig.maxAngularSpeed"
        />
        <TouchControl
            v-else-if="
                props.extraConfig.controlledObject === 'Rover' &&
                props.extraConfig.controlMode === 'Touch'
            "
            :ros="rosStore.ws"
            :maxLinearSpeed="props.extraConfig.maxLinearSpeed"
            :maxAngularSpeed="props.extraConfig.maxAngularSpeed"
            :maxEffort="props.extraConfig.maxEffort"
        />
        <ManipTouchControl
            v-else-if="
                props.extraConfig.controlledObject === 'Manipulator' &&
                props.extraConfig.controlMode === 'Touch'
            "
            :ros="rosStore.ws"
            :maxLinearSpeed="props.extraConfig.maxLinearSpeed"
            :maxAngularSpeed="props.extraConfig.maxAngularSpeed"
            :maxEffort="props.extraConfig.maxEffort"
        />
        <div
            v-else
            style="align-items: center; justify-content: center"
        >
            Choose the window type.
        </div>
    </div>
</template>

<style scoped>
* {
    width: 100%;
    height: 100%;
}
</style>
