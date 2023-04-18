<script setup>
import Joystick from './Joystick.vue'
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message } from 'roslib'
import { createController } from './controller'

const props = defineProps(['ros', 'config'])

const elements = ref([
    {
        id: 'linear_speed',
        text: 'Linear speed',
        speedPercentage: 25,
    },
    {
        id: 'angular_speed',
        text: 'Angular speed',
        speedPercentage: 25,
    },
])

// Publish steering informations
const commandInterval = ref(null)
const topic = ref(null)
const messageRate = 100 // [ms]
const maxLinearSpeed = ref(1)
const maxAngularSpeed = ref(1.57)
const carMode = ref(true)
const controllers = ref([])

function startPublishing() {
    commandInterval.value = setInterval(() => {
        let message = new Message({
            linear: {
                x: 0,
                y: 0,
                z: 0,
            },
            angular: {
                x: 0,
                y: 0,
                z: 0,
            },
        })
        message.linear.x =
            controllers.value[0].getResult() *
            0.01 *
            elements.value[0].speedPercentage
        if (carMode.value) {
            message.angular.z =
                (message.linear.x / maxLinearSpeed.value) *
                maxAngularSpeed.value *
                Math.tan(
                    (controllers.value[1].getResult() / maxAngularSpeed.value) *
                        0.01 *
                        elements.value[1].speedPercentage
                )
        } else {
            message.angular.z =
                controllers.value[1].getResult() *
                0.01 *
                elements.value[1].speedPercentage
        }
        topic.value.publish(message)
    }, messageRate)
}

function joystickMovedCallback(stickData) {
    controllers.value[0].setCommand(parseFloat(stickData.y))
    controllers.value[1].setCommand(-parseFloat(stickData.x))
}

onMounted(() => {
    // Read configuration from props
    if (props.config.maxLinearSpeed)
        maxLinearSpeed.value = props.config.maxLinearSpeed
    if (props.config.maxAngularSpeed)
        maxAngularSpeed.value = props.config.maxAngularSpeed
    const shapeCoefficient = props.config.shapeCoefficient
        ? props.config.shapeCoefficient
        : 1.0
    const deadzone = props.config.deadzone ? props.config.deadzone : 0.15
    const inertia = props.config.inertia ? props.config.inertia : 0

    // Start publishing steering informations
    topic.value = new Topic({
        ros: props.ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/Twist',
    })

    // Create controllers instances
    controllers.value = [
        createController(
            maxLinearSpeed.value,
            shapeCoefficient,
            deadzone,
            inertia
        ),
        createController(
            maxAngularSpeed.value,
            shapeCoefficient,
            deadzone,
            inertia
        ),
    ]
    startPublishing()
})
onBeforeUnmount(() => {
    clearInterval(commandInterval.value)
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
