<script setup>
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
const positionMode = ref(true)
const inertia = 0.9
const shapeCoefficient = ref(1.0)
const controlCommands = ref([0, 0, 0, 0, 0, 0])

function startPublishing() {
    commandInterval.value = setInterval(() => {
        let newCommands = [0, 0, 0, 0, 0, 0]
        if (positionMode.value) {
            newCommands[0] = pressed.value.W - pressed.value.S
            newCommands[1] = pressed.value.A - pressed.value.D
            newCommands[2] = pressed.value.Q - pressed.value.E
        } else {
            newCommands[3] = pressed.value.A - pressed.value.D
            newCommands[4] = pressed.value.W - pressed.value.S
            newCommands[5] = pressed.value.Q - pressed.value.E
        }
        controlCommands.value.forEach(
            (value, index) =>
                (value = inertia * value + (1 - inertia) * newCommands[index])
        )
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

// Check pressed keys
const pressed = ref({
    Q: false,
    E: false,
    W: false,
    A: false,
    S: false,
    D: false,
})

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

    if (key === 'Z' && isPressed) positionMode.value = !positionMode.value
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
    pressed.value.Q = false
    pressed.value.E = false
    pressed.value.W = false
    pressed.value.A = false
    pressed.value.S = false
    pressed.value.D = false
}

onMounted(() => {
    // Read maximum speed and effort from props
    if (props.config.maxLinearSpeed)
        maxLinearSpeed.value = props.config.maxLinearSpeed
    if (props.config.maxAngularSpeed)
        maxAngularSpeed.value = props.config.maxAngularSpeed
    if (props.config.maxEffort) maxEffort.value = props.config.maxEffort
    if (props.config.shapeCoefficient)
        shapeCoefficient.value = props.config.shapeCoefficient

    // Start listening keyboard signals
    window.addEventListener('keydown', keyDownCallback)
    window.addEventListener('keyup', keyUpCallback)

    // Set focus on first slider
    document.getElementById(elements.value[focusIndex.value].id).focus()

    // Set unique IDs
    const randId = String(parseInt(1000000 * Math.random()))
    for (let i = 0; i < elements.value.length; ++i)
        elements.value[i].id = randId + i

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
                    <button :class="{ pressed: pressed.Q }">Q</button>
                    <button :class="{ pressed: pressed.W }">W</button>
                    <button :class="{ pressed: pressed.E }">E</button>
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
                    @click="positionMode = true"
                    class="mode-switch"
                    :class="{ active: positionMode === true }"
                >
                    <v-icon size="60">mdi-axis-arrow</v-icon>
                </v-btn>
                <v-btn
                    icon
                    @click="positionMode = false"
                    class="mode-switch"
                    :class="{ active: positionMode === false }"
                >
                    <v-icon size="60">mdi-rotate-orbit</v-icon>
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
                max-width="420px"
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
                        to change each value.
                    </p>
                    <p>
                        Steering can be switched between the arm (position) and
                        the gripper (orientation) by choosing the icon. Use
                        keys:
                    </p>
                    <ul>
                        <li>
                            <b>'A'</b>
                            and
                            <b>'D'</b>
                            to move left/right or roll the gripper
                        </li>
                        <li>
                            <b>'W'</b>
                            and
                            <b>'S'</b>
                            to move forward/back or pitch the gripper
                        </li>
                        <li>
                            <b>'Q'</b>
                            and
                            <b>'E'</b>
                            to move up/down or clamp the gripper
                        </li>
                        <li>
                            <b>'Z'</b>
                            to change the steering mode
                        </li>
                    </ul>
                </span>
            </v-tooltip>
        </div>
    </div>
</template>
<style scoped>
@import '@/styles/control-styles.css';
</style>
