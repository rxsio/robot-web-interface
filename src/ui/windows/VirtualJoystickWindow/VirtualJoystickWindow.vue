<script setup>
import {
    InputType,
    useKeyboardSteeringStore,
    useRosStore,
    useSteeringStore,
} from '@/stores'
import Joystick from '@/ui/windows/VirtualJoystickWindow/components/Joystick.vue'
import { onBeforeUnmount, ref } from 'vue'

const rosStore = useRosStore()
const steeringStore = useSteeringStore()
const keyboardSteeringStore = useKeyboardSteeringStore()

const control = ref(false)

const takeControl = () => {
    control.value = true
    keyboardSteeringStore.currentMode = 'virtualJoystick'
    steeringStore.takeOverControl()
}

const giveUpControl = () => {
    steeringStore.giveUpControl()
    keyboardSteeringStore.currentMode = 'keyboard'
}

const onMove = (joy) => {
    const x = parseFloat(joy.x)
    const y = parseFloat(joy.y)
    keyboardSteeringStore.updateVirtualJoystickPosition(y, x)
}

onBeforeUnmount(() => {
    if (control.value) {
        giveUpControl()
    }
})
</script>

<template>
    <div class="content">
        <template v-if="steeringStore.currentInput === InputType.Keyboard">
            <div
                v-if="steeringStore.currentMode !== 'virtualJoystick'"
                class="content-center"
            >
                <v-btn
                    @click="takeControl"
                    color="primary"
                >
                    Take control
                </v-btn>
            </div>
            <template v-else>
                <template v-if="rosStore.connected">
                    <joystick
                        id="rover-1"
                        :size="250"
                        class="content-joystick"
                        :callback="onMove"
                    />
                    <div
                        class="content-controls"
                        style="align-self: stretch"
                    >
                        <span class="text-caption">Max linear speed</span>
                        <v-slider
                            v-model="keyboardSteeringStore.config.linear"
                            hideDetails
                            thumb-label
                            :min="0"
                            :max="1"
                            :step="0.01"
                        ></v-slider>
                        <span class="text-caption">Max angular speed</span>
                        <v-slider
                            v-model="keyboardSteeringStore.config.angular"
                            hideDetails
                            thumb-label
                            :min="0"
                            :max="1"
                            :step="0.01"
                        ></v-slider>
                        <v-btn
                            @click="giveUpControl"
                            color="error"
                            block
                        >
                            <v-icon>mdi-controller-off</v-icon>
                            Give up control
                        </v-btn>
                    </div>
                </template>
                <template v-else>
                    <div class="content-center">
                        <v-icon
                            color="error"
                            size="60"
                        >
                            mdi-robot-off
                        </v-icon>
                    </div>
                </template>
            </template>
        </template>
        <div
            v-else
            class="content-center"
        >
            <b>Cannot use virtual joystick when gamepad connected</b>
        </div>
    </div>
</template>

<style scoped src="@/styles/virtualJoystick.css"></style>
>
