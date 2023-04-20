<script setup>
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
const positionMode = ref(true)
const controllers = ref([])

function sendMessage() {
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
    newCommands.forEach((value, index) => {
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

// Check pressed keys
const pressed = ref({
    Q: false,
    E: false,
    W: false,
    A: false,
    S: false,
    D: false,
})

const keyDownCallback = (event) => {
    const key = event.key.toUpperCase()
    if (pressed.value[key] !== undefined) pressed.value[key] = true

    if (key === 'TAB') {
        event.preventDefault()
        focusIndex.value += event.shiftKey ? elements.value.length - 1 : 1
        focusIndex.value %= elements.value.length
        document.getElementById(elements.value[focusIndex.value].id).focus()
    }

    if (key === 'Z') positionMode.value = !positionMode.value
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
    const deadzone = props.config.deadzone ? props.config.deadzone : 0
    const inertia = props.config.inertia ? props.config.inertia : 0.9

    // Start listening keyboard signals
    document
        .getElementById('manip-keyboard-control')
        .addEventListener('keydown', keyDownCallback)
    document
        .getElementById('manip-keyboard-control')
        .addEventListener('keyup', keyUpCallback)

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
    <div
        id="manip-keyboard-control"
        class="control"
        @click.left="focusSlider()"
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
