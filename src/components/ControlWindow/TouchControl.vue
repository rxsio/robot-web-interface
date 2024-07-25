<script setup>
import { defineProps, onMounted, ref } from 'vue'

import { createController } from './controller'
import { roverElements } from './elements'
import Joystick from './Joystick.vue'
import { useRoverSender } from './messageSender'

const props = defineProps(['ros', 'config'])

const elements = ref(roverElements)

// Publish steering informations
const carMode = ref(true)
const controllers = ref([])
const commandBuffer = ref([0, 0])
useRoverSender(
    props.ros,
    elements,
    controllers,
    carMode,
    () => commandBuffer.value
)

function joystickMovedCallback(stickData) {
    commandBuffer.value[0] = parseFloat(stickData.y)
    commandBuffer.value[1] = -parseFloat(stickData.x)
}

onMounted(() => {
    // Read configuration from props
    const maxLinearSpeed = props.config.maxLinearSpeed
        ? props.config.maxLinearSpeed
        : 1.0
    const maxAngularSpeed = props.config.maxAngularSpeed
        ? props.config.maxAngularSpeed
        : 1.57
    const shapeCoefficient = props.config.shapeCoefficient
        ? props.config.shapeCoefficient
        : 1.0
    const deadzone = props.config.deadzone ? props.config.deadzone : 0.15
    const inertia = props.config.inertia ? props.config.inertia : 0

    // Create controllers instances
    controllers.value = [maxLinearSpeed, maxAngularSpeed].map((value) =>
        createController(value, shapeCoefficient, deadzone, inertia)
    )
})
</script>
<template>
    <div class="control">
        <div class="top-wrapper">
            <joystick
                id="rover-1"
                :size="250"
                :callback="joystickMovedCallback"
            />
            <div class="mode-switch-container">
                <v-btn
                    icon
                    @click="carMode = true"
                    class="mode-switch"
                    :class="{ active: carMode === true }"
                >
                    <v-icon size="60">mdi-car</v-icon>
                </v-btn>
                <v-btn
                    icon
                    @click="carMode = false"
                    class="mode-switch"
                    :class="{ active: carMode === false }"
                >
                    <v-icon size="60">mdi-tank</v-icon>
                </v-btn>
            </div>
        </div>
        <v-list>
            <v-list-item
                v-for="(element, i) in elements"
                :key="i"
                class="slider-container"
            >
                <div class="col1">
                    <input
                        type="range"
                        min="1"
                        max="100"
                        value="50"
                        class="slider"
                        :id="element.id"
                        v-model="element.speedPercentage"
                    />
                </div>
                <div class="col2">
                    <label class="slider-label">{{ element.text }}:</label>
                </div>
                <div class="col3">
                    <label class="slider-label">
                        {{ element.speedPercentage }}%
                    </label>
                </div>
            </v-list-item>
        </v-list>
    </div>
</template>
<style scoped>
@import '@/styles/control-styles.css';
</style>
