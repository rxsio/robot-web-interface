<script setup>
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
const timer = ref(null)
const manipTopic = ref(null)
const gripperTopic = ref(null)
const maxSpeed = ref(1.0)
const messageRate = 100 // [ms]

function startPublishing() {
    timer.value = setInterval(() => {
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
                maxSpeed.value *
                0.01 *
                elements.value[0].speedPercentage
            manipMessage.linear.y =
                (pressed.value.A - pressed.value.D) *
                maxSpeed.value *
                0.01 *
                elements.value[1].speedPercentage
            manipMessage.linear.z =
                (pressed.value.Q - pressed.value.E) *
                maxSpeed.value *
                0.01 *
                elements.value[2].speedPercentage
        } else if (focusIndex.value >= 3 && focusIndex.value <= 5) {
            manipMessage.angular.x =
                (pressed.value.A - pressed.value.D) *
                maxSpeed.value *
                0.01 *
                elements.value[3].speedPercentage
            manipMessage.angular.y =
                (pressed.value.W - pressed.value.S) *
                maxSpeed.value *
                0.01 *
                elements.value[4].speedPercentage
            gripperMessage.data =
                (pressed.value.Q - pressed.value.E) *
                maxSpeed.value *
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
    clearInterval(timer.value)
    window.removeEventListener('keydown', keyDownCallback)
    window.removeEventListener('keyup', keyUpCallback)
})
</script>
<template>
    <div
        class="control keyboardControl manip"
        @click.left="focus()"
        @focusout="unfocus()"
        @focusin="focus()"
    >
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

        <p>
            Use 'TAB' to switch between sliders or 'Arrow Keys' to change each
            effort value.
        </p>
        <p>
            Steering will be automaticly switched between the arm or the claw by
            changing the choosen slider. Use keys:
        </p>
        <div class="description">
            <li>
                <b>'A'</b>
                and
                <b>'D'</b>
                to rotate the arm or the claw
            </li>
            <li>
                <b>'W'</b>
                and
                <b>'S'</b>
                to lift the arm or the claw
            </li>
            <li>
                <b>'Q'</b>
                and
                <b>'E'</b>
                to tilt the arm or clamp the claw
            </li>
        </div>
    </div>
</template>

<style scoped>
@import '@/styles/control-styles.css';

div.keyboardControl.manip {
    height: max-content;
}

div.keyboardControl.manip div.description {
    width: 22em;
    display: inline-block;
}

div.keyboardControl.manip div.description li {
    margin-left: 2em;
    padding: 0.25em;
    text-align: left;
}
</style>
