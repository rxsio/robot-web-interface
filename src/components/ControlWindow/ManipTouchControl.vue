<script setup>
import Joystick from './Joystick.vue'
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message, Param } from 'roslib'

const props = defineProps(['ros'])

const elements = ref([
    {
        id: 0,
        text: 'X velocity',
        speedPercentage: 25,
    },
    {
        id: 1,
        text: 'Y velocity',
        speedPercentage: 25,
    },
    {
        id: 2,
        text: 'Z velocity',
        speedPercentage: 25,
    },
    {
        id: 3,
        text: 'Roll velocity',
        speedPercentage: 25,
    },
    {
        id: 4,
        text: 'Pitch velocity',
        speedPercentage: 25,
    },
    {
        id: 5,
        text: 'Clamp effort',
        speedPercentage: 25,
    },
])

// Publish steering informations
const commandInterval = ref(null)
const manipTopic = ref(null)
const gripperTopic = ref(null)
const manipMessage = ref(null)
const gripperMessage = ref(null)
const maxSpeed = ref(1.0)
const messageRate = 100 // [ms]

function joystickMovedCallbackXY(stickData) {
    manipMessage.value.linear.x =
        -parseFloat(stickData.y) *
        maxSpeed.value *
        0.01 *
        elements.value[0].speedPercentage
    manipMessage.value.linear.y =
        parseFloat(stickData.x) *
        maxSpeed.value *
        0.01 *
        elements.value[1].speedPercentage
}
function joystickMovedCallbackZPitch(stickData) {
    manipMessage.value.linear.z =
        parseFloat(stickData.y) *
        maxSpeed.value *
        0.01 *
        elements.value[2].speedPercentage
    manipMessage.value.angular.y =
        parseFloat(stickData.x) *
        maxSpeed.value *
        0.01 *
        elements.value[4].speedPercentage
}
function joystickMovedCallbackRollClamp(stickData) {
    manipMessage.value.angular.x =
        parseFloat(stickData.x) *
        maxSpeed.value *
        0.01 *
        elements.value[3].speedPercentage
    gripperMessage.value.data =
        parseFloat(stickData.y) *
        maxSpeed.value *
        0.01 *
        elements.value[5].speedPercentage
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
            maxSpeed.value = value
        }
    })

    manipTopic.value = new Topic({
        ros: props.ros,
        name: '/cmd_manip',
        messageType: 'geometry_msgs/Twist',
    })
    gripperTopic.value = new Topic({
        ros: props.ros,
        name: '/cmd_grip',
        messageType: 'std_msgs/Float64',
    })

    manipMessage.value = new Message({
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
    gripperMessage.value = new Message({
        data: 0,
    })

    // Start sending messages to cmd_manip and cmd_grip
    commandInterval.value = setInterval(() => {
        manipTopic.value.publish(manipMessage.value)
        gripperTopic.value.publish(gripperMessage.value)
    }, messageRate)
})
onBeforeUnmount(() => {
    clearInterval(commandInterval.value)
})
</script>
<template>
    <div class="control keyboardControl">
        <joystick
            :size="250"
            :callback="joystickMovedCallbackXY"
        />
        <joystick
            :size="250"
            :callback="joystickMovedCallbackZPitch"
        />
        <joystick
            :size="250"
            :callback="joystickMovedCallbackRollClamp"
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
                        class="slider"
                        :id="element.id"
                        v-model="element.speedPercentage"
                    />
                </div>
                <div class="col2">
                    <label class="sliderLabel">
                        {{ element.text }}
                    </label>
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
