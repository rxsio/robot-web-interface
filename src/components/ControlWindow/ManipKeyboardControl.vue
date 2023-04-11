<script setup>
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
const maxLinearSpeed = ref(1.0)
const maxAngularSpeed = ref(1.0)
const maxEffort = ref(1.0)
const messageRate = 100 // [ms]

function startPublishing() {
    commandInterval.value = setInterval(() => {
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
        if (focusIndex.value >= 0 && focusIndex.value <= 2) {
            manipMessage.linear.x =
                (pressed.value.W - pressed.value.S) *
                maxLinearSpeed.value *
                0.01 *
                elements.value[0].speedPercentage
            manipMessage.linear.y =
                (pressed.value.A - pressed.value.D) *
                maxLinearSpeed.value *
                0.01 *
                elements.value[1].speedPercentage
            manipMessage.linear.z =
                (pressed.value.Q - pressed.value.E) *
                maxLinearSpeed.value *
                0.01 *
                elements.value[2].speedPercentage
        } else if (focusIndex.value >= 3 && focusIndex.value <= 5) {
            manipMessage.angular.x =
                (pressed.value.A - pressed.value.D) *
                maxAngularSpeed.value *
                0.01 *
                elements.value[3].speedPercentage
            manipMessage.angular.y =
                (pressed.value.W - pressed.value.S) *
                maxAngularSpeed.value *
                0.01 *
                elements.value[4].speedPercentage
            gripperMessage.data =
                (pressed.value.Q - pressed.value.E) *
                maxEffort.value *
                0.01 *
                elements.value[5].speedPercentage
        }
        manipTopic.value.publish(manipMessage)
        gripperTopic.value.publish(gripperMessage)
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
    if (props.maxLinearSpeed) maxLinearSpeed.value = props.maxLinearSpeed
    if (props.maxAngularSpeed) maxAngularSpeed.value = props.maxAngularSpeed
    if (props.maxEffort) maxEffort.value = props.maxEffort

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
        class="control keyboardControl"
        @click.left="focus()"
        @focusout="unfocus()"
        @focusin="focus()"
    >
        <div class="keyboardBox">
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
                        :class="{ focused: focusIndex == i && isWindowFocused }"
                        :id="element.id"
                        v-model="element.speedPercentage"
                        @click="focusIndex = i"
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
        <div style="position: absolute; top: 30px; right: 15px">
            <v-tooltip
                left
                max-width="420px"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-bind="attrs"
                        v-on="on"
                        :icon="true"
                        style="
                            background: none;
                            border: none;
                            border-radius: 100%;
                        "
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
                        Steering will be automaticly switched between the arm or
                        the gripper by changing the choosen slider. Use keys:
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
                    </ul>
                </span>
            </v-tooltip>
        </div>
    </div>
</template>

<style scoped>
@import '@/styles/control-styles.css';
</style>
