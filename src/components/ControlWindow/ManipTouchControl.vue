<script setup>
import Joystick from './Joystick.vue'
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message } from 'roslib'

const props = defineProps(['ros', 'config'])

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
const shapeCoefficient = ref(1.0)
const controlCommands = ref([0, 0, 0, 0, 0, 0])

function startPublishing() {
    commandInterval.value = setInterval(() => {
        const values = controlCommands.value.map(
            (value, index) =>
                Math.sign(value) *
                Math.pow(value, shapeCoefficient.value) *
                0.01 *
                elements.value[index].speedPercentage
        )
        manipMessage.value.linear.x = values[0] * maxLinearSpeed.value
        manipMessage.value.linear.y = values[1] * maxLinearSpeed.value
        manipMessage.value.linear.z = values[2] * maxLinearSpeed.value
        manipMessage.value.angular.x = values[3] * maxAngularSpeed.value
        manipMessage.value.angular.y = values[4] * maxAngularSpeed.value
        gripperMessage.value.data = values[5] * maxEffort.value
        manipTopic.value.publish(manipMessage.value)
        gripperTopic.value.publish(gripperMessage.value)
    }, messageRate)
}

const joysticks = ref([
    {
        horizontalText: '- Move Y -',
        verticalText: '- Move X -',
        callback: (stickData) => {
            controlCommands.value[0] = parseFloat(stickData.y)
            controlCommands.value[1] = -parseFloat(stickData.x)
        },
    },
    {
        horizontalText: '- Pitch -',
        verticalText: '- Move Z -',
        callback: (stickData) => {
            controlCommands.value[2] = parseFloat(stickData.y)
            controlCommands.value[4] = parseFloat(stickData.x)
        },
    },
    {
        horizontalText: '- Roll -',
        verticalText: '- Clamp -',
        callback: (stickData) => {
            controlCommands.value[3] = parseFloat(stickData.x)
            controlCommands.value[5] = parseFloat(stickData.y)
        },
    },
])

onMounted(() => {
    // Read maximum speed and effort from props
    if (props.config.maxLinearSpeed)
        maxLinearSpeed.value = props.config.maxLinearSpeed
    if (props.config.maxAngularSpeed)
        maxAngularSpeed.value = props.config.maxAngularSpeed
    if (props.config.maxEffort) maxEffort.value = props.config.maxEffort
    if (props.config.shapeCoefficient)
        shapeCoefficient.value = props.config.shapeCoefficient

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
    startPublishing()
})
onBeforeUnmount(() => {
    clearInterval(commandInterval.value)
})
</script>
<template>
    <div class="control">
        <div class="joystick-wrapper">
            <div
                v-for="(joy, i) in joysticks"
                :key="i"
                class="joystick-container"
            >
                <joystick
                    :id="'joy-manip-' + i"
                    :size="250"
                    :callback="joy.callback"
                />
                <p class="horizontal-description">{{ joy.horizontalText }}</p>
                <p class="vertical-description">{{ joy.verticalText }}</p>
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

div.joystick-wrapper {
    display: inline-flex;
    flex-wrap: wrap;
    place-content: center;
}
div.joystick-container {
    height: 250px;
}
div.joystick-container p.horizontal-description {
    margin: 0;
    position: relative;
    top: -250px;
}
div.joystick-container p.vertical-description {
    position: relative;
    writing-mode: sideways-lr;
    top: -280px;
    height: 100%;
}
</style>
