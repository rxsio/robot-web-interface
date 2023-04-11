<script setup>
import Joystick from './Joystick.vue'
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message, Param } from 'roslib'

const props = defineProps(['ros'])

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

function joystickMovedCallback(stickData) {
    message.value.linear.x =
        parseFloat(stickData.y) *
        maxLinearSpeed.value *
        0.01 *
        elements.value[0].speedPercentage
    message.value.angular.z =
        -parseFloat(stickData.x) *
        maxAngularSpeed.value *
        0.01 *
        elements.value[1].speedPercentage
}

onMounted(() => {
    // Read maximum speed from ros params
    let base = '/web_interface/control'
    let maxLinearSpeedParam = new Param({
        ros: props.ros,
        name: base + '/linear/x/max_velocity',
    })
    maxLinearSpeedParam.get((value) => {
        if (value != null) {
            maxLinearSpeed.value = value
        }
    })
    let maxAngularSpeedParam = new Param({
        ros: props.ros,
        name: base + '/angular/z/max_velocity',
    })
    maxAngularSpeedParam.get((value) => {
        if (value != null) {
            maxAngularSpeed.value = value
        }
    })

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
    <div class="control keyboardControl">
        <joystick
            id="rover-1"
            :size="250"
            :callback="joystickMovedCallback"
        />
        <v-list>
            <v-list-item
                v-for="(element, i) in elements"
                :key="i"
                class="slidecontainer"
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
                    <label class="sliderLabel">{{ element.text }}:</label>
                </div>
                <div class="col3">
                    <label class="sliderLabel">
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
