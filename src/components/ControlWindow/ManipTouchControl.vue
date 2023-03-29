<script setup>
import Joystick from './Joystick.vue'
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message, Param } from 'roslib'

const props = defineProps(['ros'])

const elements = ref([
    {
        id: 0,
        name: 'arm_rotate',
        text: 'Arm rotate effort',
        effortPercentage: 25,
    },
    {
        id: 1,
        name: 'arm_lift',
        text: 'Arm lift effort',
        effortPercentage: 25,
    },
    {
        id: 2,
        name: 'arm_tilt',
        text: 'Arm tilt effort',
        effortPercentage: 25,
    },
    {
        id: 3,
        name: 'claw_rotate',
        text: 'Claw rotate effort',
        effortPercentage: 25,
    },
    {
        id: 4,
        name: 'claw_lift',
        text: 'Claw lift effort',
        effortPercentage: 25,
    },
    {
        id: 5,
        name: 'claw_clamp',
        text: 'Claw clamp effort',
        effortPercentage: 25,
    },
])

// Publish steering informations
const commandInterval = ref(null)
const topic = ref(null)
const message = ref(null)
const maxEffort = ref(1.0)
const messageRate = 100 // [ms]

function joystickMovedCallback1(stickData) {
    message.value.effort[0] =
        parseFloat(stickData.x) *
        maxEffort.value *
        0.01 *
        elements.value[0].effortPercentage
    message.value.effort[1] =
        parseFloat(stickData.y) *
        maxEffort.value *
        0.01 *
        elements.value[1].effortPercentage
}
function joystickMovedCallback2(stickData) {
    message.value.effort[2] =
        parseFloat(stickData.x) *
        maxEffort.value *
        0.01 *
        elements.value[2].effortPercentage
    message.value.effort[3] =
        parseFloat(stickData.y) *
        maxEffort.value *
        0.01 *
        elements.value[3].effortPercentage
}
function joystickMovedCallback3(stickData) {
    message.value.effort[4] =
        parseFloat(stickData.x) *
        maxEffort.value *
        0.01 *
        elements.value[4].effortPercentage
    message.value.effort[5] =
        parseFloat(stickData.y) *
        maxEffort.value *
        0.01 *
        elements.value[5].effortPercentage
}

onMounted(() => {
    // Read maximum effort from ros params
    let base = '/web_interface/control'
    let maxEffortParam = new Param({
        ros: props.ros,
        name: base + '/max_effort',
    })
    maxEffortParam.get((value) => {
        if (value != null) {
            maxEffort.value = value
        }
    })

    topic.value = new Topic({
        ros: props.ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/Twist',
    })

    let currentTime = new Date().getTime()
    message.value = new Message({
        header: {
            stamp: {
                secs: Math.floor(currentTime / 1000),
                nsecs: Math.round(
                    1000000000 *
                        (currentTime / 1000 - Math.floor(currentTime / 1000))
                ),
            },
        },
        name: elements.value.map((element) => element.name),
        effort: [0, 0, 0, 0, 0, 0],
    })

    // Start sending messages to cmd_vel
    commandInterval.value = setInterval(() => {
        let currentTime = new Date().getTime()
        let names = []
        elements.value.forEach((element) => {
            names.push(element.name)
        })
        message.value.header.stamp = {
            secs: Math.floor(currentTime / 1000),
            nsecs: Math.round(
                1000000000 *
                    (currentTime / 1000 - Math.floor(currentTime / 1000))
            ),
        }
        topic.value.publish(message.value)
    }, messageRate)
})
onBeforeUnmount(() => {
    clearInterval(commandInterval.value)
})
</script>
<template>
    <div class="control">
        <joystick
            :size="250"
            :callback="joystickMovedCallback1"
        />
        <joystick
            :size="250"
            :callback="joystickMovedCallback2"
        />
        <joystick
            :size="250"
            :callback="joystickMovedCallback3"
        />
        <div
            v-for="element in elements"
            :key="element.name"
            class="slidecontainer"
        >
            <input
                type="range"
                min="1"
                max="100"
                class="slider"
                :id="element.id"
                v-model="element.effortPercentage"
            />
            <label class="sliderLabel">
                {{ element.text }}: {{ element.effortPercentage }}%
            </label>
        </div>
    </div>
</template>
<style scoped>
@import '@/styles/control-styles.css';
</style>
