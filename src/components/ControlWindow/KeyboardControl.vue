<script setup>
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message } from 'roslib'

const props = defineProps(['ros', 'config'])

const elements = ref([
    {
        id: 'linear_speed',
        text: 'Linear velocity',
        speedPercentage: 25,
    },
    {
        id: 'angular_speed',
        text: 'Angular velocity',
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
const inertia = 0.9
const shapeCoefficient = ref(1.0)
const controlCommands = ref({ drive: 0, turn: 0 })

function startPublishing() {
    commandInterval.value = setInterval(() => {
        // Save movement inercia on user commands level
        controlCommands.value.drive =
            controlCommands.value.drive * inertia +
            (1 - inertia) * (pressed.value.W - pressed.value.S)
        controlCommands.value.turn =
            controlCommands.value.turn * inertia +
            (1 - inertia) * (pressed.value.A - pressed.value.D)

        if (Math.abs(controlCommands.value.drive) < 0.01)
            controlCommands.value.drive = 0
        if (Math.abs(controlCommands.value.turn) < 0.01)
            controlCommands.value.turn = 0

        // Non-linearly scale each value depending on the selected mode
        message.value.linear.x =
            Math.sign(controlCommands.value.drive) *
            Math.pow(
                Math.abs(controlCommands.value.drive),
                shapeCoefficient.value
            ) *
            maxLinearSpeed.value *
            0.01 *
            elements.value[0].speedPercentage
        if (carMode.value) {
            message.value.angular.z =
                (message.value.linear.x / maxLinearSpeed.value) *
                maxAngularSpeed.value *
                Math.tan(
                    Math.sign(controlCommands.value.turn) *
                        Math.pow(
                            Math.abs(controlCommands.value.turn),
                            shapeCoefficient.value
                        ) *
                        0.01 *
                        elements.value[1].speedPercentage
                )
        } else {
            message.value.angular.z =
                Math.sign(controlCommands.value.turn) *
                Math.pow(
                    Math.abs(controlCommands.value.turn),
                    shapeCoefficient.value
                ) *
                maxAngularSpeed.value *
                0.01 *
                elements.value[1].speedPercentage
        }
        topic.value.publish(message.value)
    }, messageRate)
}

// Check pressed keys
const pressed = ref({ W: false, A: false, S: false, D: false })

let keyDownCallback = (event) => {
    keyListener(event.key.toUpperCase(), true)
}
let keyUpCallback = (event) => {
    keyListener(event.key.toUpperCase(), false)
}
function keyListener(key, isPressed) {
    if (!isWindowFocused.value) return

    if (pressed.value[key] !== undefined) pressed.value[key] = isPressed

    if (key === 'TAB' && isPressed) {
        focusIndex.value = (focusIndex.value + 1) % elements.value.length
        document.getElementById(elements.value[focusIndex.value].id).focus()
    }

    if (key === 'Z' && isPressed) carMode.value = !carMode.value
}

// Set focus to proper object
const isWindowFocused = ref(false)
const focusIndex = ref(0)

function focus() {
    isWindowFocused.value = true
    document.getElementById(elements.value[focusIndex.value].id).focus()
}
function unfocus() {
    isWindowFocused.value = false
    pressed.value.W = false
    pressed.value.A = false
    pressed.value.S = false
    pressed.value.D = false
}

onMounted(() => {
    // Read maximum speed from props
    if (props.config.maxLinearSpeed)
        maxLinearSpeed.value = props.config.maxLinearSpeed
    if (props.config.maxAngularSpeed)
        maxAngularSpeed.value = props.config.maxAngularSpeed
    if (props.config.shapeCoefficient)
        shapeCoefficient.value = props.config.shapeCoefficient

    // Start listening keyboard signals
    window.addEventListener('keydown', keyDownCallback)
    window.addEventListener('keyup', keyUpCallback)

    // Set unique IDs
    const randId = String(parseInt(1000000 * Math.random()))
    for (let i = 0; i < elements.value.length; ++i)
        elements.value[i].id = randId + i

    // Start publishing steering informations
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
    startPublishing()
})
onBeforeUnmount(() => {
    clearInterval(commandInterval.value)
    window.removeEventListener('keydown', keyDownCallback)
    window.removeEventListener('keyup', keyUpCallback)
})
</script>
<template>
    <div
        class="control"
        @click.left="focus()"
        @focusout="unfocus()"
        @focusin="focus()"
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
