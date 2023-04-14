<script setup>
import Joystick from './Joystick.vue'
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message } from 'roslib'

const props = defineProps([
    'ros',
    'maxLinearSpeed',
    'maxAngularSpeed',
    'shapeCoefficient',
])

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
const message = ref(null)
const maxLinearSpeed = ref(1)
const maxAngularSpeed = ref(1.57)
const messageRate = 100 // [ms]
const carMode = ref(true)
const shapeCoefficient = ref(1.0)

function joystickMovedCallback(stickData) {
    // non-linearly scale each value depending on the selected mode
    message.value.linear.x = parseFloat(stickData.y)
    message.value.linear.x *=
        Math.pow(message.value.linear.x, shapeCoefficient.value - 1.0) *
        maxLinearSpeed.value *
        0.01 *
        elements.value[0].speedPercentage
    if (carMode.value) {
        message.value.angular.z = -parseFloat(stickData.x)
        message.value.angular.z *=
            Math.pow(message.value.angular.z, shapeCoefficient.value - 1.0) *
            maxAngularSpeed.value *
            0.01 *
            elements.value[1].speedPercentage
    } else {
        let angle = -parseFloat(stickData.x)
        angle *=
            Math.pow(angle, shapeCoefficient.value - 1.0) *
            0.01 *
            elements.value[1].speedPercentage
        message.value.angular.z =
            (message.value.linear.x / maxLinearSpeed.value) *
            maxAngularSpeed.value *
            Math.tan(angle)
    }
}

onMounted(() => {
    // Read maximum speed from props
    if (props.maxLinearSpeed) maxLinearSpeed.value = props.maxLinearSpeed
    if (props.maxAngularSpeed) maxAngularSpeed.value = props.maxAngularSpeed
    if (props.shapeCoefficient) shapeCoefficient.value = props.shapeCoefficient

    topic.value = new Topic({
        ros: props.ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/Twist',
    })

    message.value = new Message({
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

    // Start sending messages to cmd_vel
    commandInterval.value = setInterval(() => {
        topic.value.publish(message.value)
    }, messageRate)
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
