<script setup>
import KeyboardControl from '@/components/ControlWindow/KeyboardControl.vue'
import ManipKeyboardControl from '@/components/ControlWindow/ManipKeyboardControl.vue'
import TouchControl from '@/components/ControlWindow/TouchControl.vue'
import ManipTouchControl from '@/components/ControlWindow/ManipTouchControl.vue'
import PositionSteering from '@/components/ControlWindow/PositionSteering.vue'
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
        <PositionSteering
            v-if="props.extraConfig.movementStrategy === 'Position'"
            :ros="rosStore.ws"
        />
        <KeyboardControl
            v-else-if="
                props.extraConfig.controlledObject === 'Rover' &&
                props.extraConfig.controlMode === 'Keyboard'
            "
            :ros="rosStore.ws"
            :maxLinearSpeed="props.extraConfig.maxLinearSpeed"
            :maxAngularSpeed="props.extraConfig.maxAngularSpeed"
            :shapeCoefficient="props.extraConfig.shapeCoefficient"
        />
        <ManipKeyboardControl
            v-else-if="
                props.extraConfig.controlledObject === 'Manipulator' &&
                props.extraConfig.controlMode === 'Keyboard'
            "
            :ros="rosStore.ws"
            :maxLinearSpeed="props.extraConfig.maxLinearSpeed"
            :maxAngularSpeed="props.extraConfig.maxAngularSpeed"
            :shapeCoefficient="props.extraConfig.shapeCoefficient"
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
            :shapeCoefficient="props.extraConfig.shapeCoefficient"
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
            :shapeCoefficient="props.extraConfig.shapeCoefficient"
        />
        <div
            v-else
            style="align-items: center; justify-content: center; display: flex"
        >
            Invalid choice. Choose the window type correctly.
        </div>
    </div>
</template>

<style scoped>
* {
    width: 100%;
    height: 100%;
}
</style>
