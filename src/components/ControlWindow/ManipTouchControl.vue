<script setup>
import Joystick from './Joystick.vue'
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message } from 'roslib'
import { createController } from './controller'
import { manipElements } from './elements'

const props = defineProps(['ros', 'config'])

const elements = ref(manipElements)

// Publish steering informations
const commandInterval = ref(null)
const manipTopic = ref(null)
const gripperTopic = ref(null)
const messageRate = 100 // [ms]
const controllers = ref([])
const commandBuffer = ref([0, 0, 0, 0, 0, 0])

function sendMessage() {
    commandBuffer.value.forEach((value, index) => {
        controllers.value[index].setCommand(value)
    })

    let manipMessage = new Message({
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
    let gripperMessage = new Message({
        data: 0,
    })

    ;[
        manipMessage.linear.x,
        manipMessage.linear.y,
        manipMessage.linear.z,
        manipMessage.angular.x,
        manipMessage.angular.y,
        gripperMessage.data,
    ] = controllers.value.map(
        (controller, index) =>
            controller.getResult() *
            0.01 *
            elements.value[index].speedPercentage
    )

    manipTopic.value.publish(manipMessage)
    gripperTopic.value.publish(gripperMessage)
}

const joysticks = ref([
    {
        horizontalText: '- Move Y -',
        verticalText: '- Move X -',
        callback: (stickData) => {
            commandBuffer.value[0] = parseFloat(stickData.y)
            commandBuffer.value[1] = -parseFloat(stickData.x)
        },
    },
    {
        horizontalText: '- Pitch -',
        verticalText: '- Move Z -',
        callback: (stickData) => {
            commandBuffer.value[2] = parseFloat(stickData.y)
            commandBuffer.value[4] = parseFloat(stickData.x)
        },
    },
    {
        horizontalText: '- Roll -',
        verticalText: '- Clamp -',
        callback: (stickData) => {
            commandBuffer.value[3] = parseFloat(stickData.x)
            commandBuffer.value[5] = parseFloat(stickData.y)
        },
    },
])

onMounted(() => {
    // Read configuration from props
    const maxLinearSpeed = props.config.maxLinearSpeed
        ? props.config.maxLinearSpeed
        : 1.0
    const maxAngularSpeed = props.config.maxAngularSpeed
        ? props.config.maxAngularSpeed
        : 1.0
    const maxEffort = props.config.maxEffort ? props.config.maxEffort : 1.0
    const shapeCoefficient = props.config.shapeCoefficient
        ? props.config.shapeCoefficient
        : 1.0
    const deadzone = props.config.deadzone ? props.config.deadzone : 0.15
    const inertia = props.config.inertia ? props.config.inertia : 0

    // Create controllers instances
    controllers.value = [
        maxLinearSpeed,
        maxLinearSpeed,
        maxLinearSpeed,
        maxAngularSpeed,
        maxAngularSpeed,
        maxEffort,
    ].map((value) =>
        createController(value, shapeCoefficient, deadzone, inertia)
    )

    // Start publishing steering informations
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
    commandInterval.value = setInterval(() => {
        sendMessage()
    }, messageRate)
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
