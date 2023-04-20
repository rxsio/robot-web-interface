<script setup>
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message } from 'roslib'
import { createController } from './controller'
import { roverElements } from './elements'

const props = defineProps(['ros', 'config'])

const elements = ref(roverElements)

// Publish steering informations
const commandInterval = ref(null)
const topic = ref(null)
const messageRate = 100 // [ms]
const maxLinearSpeed = ref(1)
const maxAngularSpeed = ref(1.57)
const carMode = ref(true)
const controllers = ref([])

function sendMessage() {
    controllers.value[0].setCommand(pressed.value.W - pressed.value.S)
    controllers.value[1].setCommand(pressed.value.A - pressed.value.D)

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
                (Math.PI / 4) *
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
}

// Check pressed keys
const pressed = ref({ W: false, A: false, S: false, D: false })

const keyDownCallback = (event) => {
    const key = event.key.toUpperCase()
    if (pressed.value[key] !== undefined) pressed.value[key] = true

    if (key === 'TAB') {
        event.preventDefault()
        focusIndex.value += event.shiftKey ? elements.value.length - 1 : 1
        focusIndex.value %= elements.value.length
        document.getElementById(elements.value[focusIndex.value].id).focus()
    }

    if (key === 'Z') carMode.value = !carMode.value
}
const keyUpCallback = (event) => {
    const key = event.key.toUpperCase()
    if (pressed.value[key] !== undefined) pressed.value[key] = false
}

// Set focus to proper object
const focusIndex = ref(0)

function focusSlider() {
    document.getElementById(elements.value[focusIndex.value].id).focus()
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
    const deadzone = props.config.deadzone ? props.config.deadzone : 0
    const inertia = props.config.inertia ? props.config.inertia : 0.9

    // Create controllers instances
    controllers.value = [maxLinearSpeed.value, maxAngularSpeed.value].map(
        (value) => createController(value, shapeCoefficient, deadzone, inertia)
    )

    // Start listening keyboard signals
    document
        .getElementById('rover-keyboard-control')
        .addEventListener('keydown', keyDownCallback)
    document
        .getElementById('rover-keyboard-control')
        .addEventListener('keyup', keyUpCallback)

    // Start publishing steering informations
    topic.value = new Topic({
        ros: props.ros,
        name: '/cmd_vel',
        messageType: 'geometry_msgs/Twist',
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
    <div
        id="rover-keyboard-control"
        class="control"
        @click.left="focusSlider()"
    >
        <div class="top-wrapper">
            <div class="keyboard-box">
                <p>
                    <button :class="{ pressed: pressed.W }">W</button>
                </p>
                <p>
                    <button :class="{ pressed: pressed.A }">A</button>
                    <button :class="{ pressed: pressed.S }">S</button>
                    <button :class="{ pressed: pressed.D }">D</button>
                </p>
            </div>
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
                        class="slider"
                        :id="element.id"
                        v-model="element.speedPercentage"
                        @click="focusIndex = i"
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
        <div class="description">
            <v-tooltip
                left
                max-width="300px"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>mdi-information</v-icon>
                    </v-btn>
                </template>
                <span>
                    <p>
                        Use
                        <b>'TAB'</b>
                        to switch between sliders or
                        <b>'Arrow Keys'</b>
                        to change each speed value.
                        <br />
                        Steering can be switched between the car and the tank
                        mode using
                        <b>'Z'</b>
                        key or choosing the icon.
                    </p>
                </span>
            </v-tooltip>
        </div>
    </div>
</template>
<style scoped>
@import '@/styles/control-styles.css';
</style>
