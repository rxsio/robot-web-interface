<script setup>
import Joystick from './Joystick.vue'
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message, Param } from 'roslib'

const props = defineProps(['ros'])

const topic = ref(null)
const message = ref(null)
const commandInterval = ref(null)
const max_linear_speed = ref(1)
const max_angular_speed = ref(1.57)
const linear_speed_percentage = ref(25)
const angular_speed_percentage = ref(25)

function joystickMovedCallback(stickData) {
    message.value.linear.x =
        parseFloat(stickData.y) *
        max_linear_speed.value *
        0.01 *
        linear_speed_percentage.value
    message.value.angular.z =
        -parseFloat(stickData.x) *
        max_angular_speed.value *
        0.01 *
        angular_speed_percentage.value
}

onMounted(() => {
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

    // Start sending messages to cmd_vel (10Hz)
    commandInterval.value = setInterval(() => {
        topic.value.publish(message.value)
    }, 100)

    // Read maximum speed from ros params
    let base = '/web_interface/control'
    let maxLinearSpeedParam = new Param({
        ros: props.ros,
        name: base + '/linear/x/max_velocity',
    })
    maxLinearSpeedParam.get((value) => {
        if (value != null) {
            max_linear_speed.value = value
        }
    })
    let maxAngularSpeedParam = new Param({
        ros: props.ros,
        name: base + '/angular/z/max_velocity',
    })
    maxAngularSpeedParam.get((value) => {
        if (value != null) {
            max_angular_speed.value = value
        }
    })
})
onBeforeUnmount(() => {
    clearInterval(commandInterval.value)
})
</script>
<template>
    <div class="control">
        <joystick
            :size="250"
            :callback="joystickMovedCallback"
        />
        <div class="slidecontainer">
            <input
                type="range"
                min="1"
                max="100"
                value="50"
                class="slider"
                id="linear_speed"
                v-model="linear_speed_percentage"
            />
            <label class="sliderLabel">
                Linear: {{ linear_speed_percentage }}%
            </label>
        </div>
        <div class="slidecontainer">
            <input
                type="range"
                min="1"
                max="100"
                value="50"
                class="slider"
                id="angular_speed"
                v-model="angular_speed_percentage"
            />
            <label class="sliderLabel">
                Angular: {{ angular_speed_percentage }}%
            </label>
        </div>
    </div>
</template>
<style scoped>
@import '@/styles/control-styles.css';
</style>
