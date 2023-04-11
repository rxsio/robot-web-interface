<script setup>
import Joystick from './Joystick.vue'
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message } from 'roslib'

const props = defineProps([
    'ros',
    'maxLinearSpeed',
    'maxAngularSpeed',
    'maxEffort',
])

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
const maxLinearSpeed = ref(1.0)
const maxAngularSpeed = ref(1.0)
const maxEffort = ref(1.0)
const messageRate = 100 // [ms]

function joystickMovedCallbackXY(stickData) {
    manipMessage.value.linear.x =
        parseFloat(stickData.y) *
        maxLinearSpeed.value *
        0.01 *
        elements.value[0].speedPercentage
    manipMessage.value.linear.y =
        -parseFloat(stickData.x) *
        maxLinearSpeed.value *
        0.01 *
        elements.value[1].speedPercentage
}
function joystickMovedCallbackZPitch(stickData) {
    manipMessage.value.linear.z =
        parseFloat(stickData.y) *
        maxLinearSpeed.value *
        0.01 *
        elements.value[2].speedPercentage
    manipMessage.value.angular.y =
        parseFloat(stickData.x) *
        maxAngularSpeed.value *
        0.01 *
        elements.value[4].speedPercentage
}
function joystickMovedCallbackRollClamp(stickData) {
    manipMessage.value.angular.x =
        parseFloat(stickData.x) *
        maxAngularSpeed.value *
        0.01 *
        elements.value[3].speedPercentage
    gripperMessage.value.data =
        parseFloat(stickData.y) *
        maxEffort.value *
        0.01 *
        elements.value[5].speedPercentage
}

onMounted(() => {
    // Read maximum speed and effort from props
    if (props.maxLinearSpeed) maxLinearSpeed.value = props.maxLinearSpeed
    if (props.maxAngularSpeed) maxAngularSpeed.value = props.maxAngularSpeed
    if (props.maxEffort) maxEffort.value = props.maxEffort

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
        <div
            style="display: inline-flex; flex-wrap: wrap; place-content: center"
        >
            <div style="height: 250px">
                <joystick
                    id="manip-1"
                    :size="250"
                    :callback="joystickMovedCallbackXY"
                />
                <p style="margin: 0; position: relative; top: -250px">
                    - Move Y -
                </p>
                <p
                    style="
                        position: relative;
                        writing-mode: sideways-lr;
                        top: -280px;
                        height: 100%;
                    "
                >
                    - Move X -
                </p>
            </div>
            <div style="height: 250px">
                <joystick
                    id="manip-2"
                    :size="250"
                    :callback="joystickMovedCallbackZPitch"
                />
                <p style="margin: 0; position: relative; top: -250px">
                    - Pitch -
                </p>
                <p
                    style="
                        position: relative;
                        writing-mode: sideways-lr;
                        top: -280px;
                        height: 100%;
                    "
                >
                    - Move Z -
                </p>
            </div>
            <div style="height: 250px">
                <joystick
                    id="manip-3"
                    :size="250"
                    :callback="joystickMovedCallbackRollClamp"
                />
                <p style="margin: 0; position: relative; top: -250px">
                    - Roll -
                </p>
                <p
                    style="
                        position: relative;
                        writing-mode: sideways-lr;
                        top: -280px;
                        height: 100%;
                    "
                >
                    - Clamp -
                </p>
            </div>
        </div>
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
