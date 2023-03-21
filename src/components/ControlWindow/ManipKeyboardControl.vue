<script setup>
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message, Param } from 'roslib'

const props = defineProps(['ros'])

const elements = ref([
    {
        id: 0,
        name: 'arm_rotate',
        text: 'Arm rotate effort',
        effortPercentage: 25,
    },
    {
        id: 1,
        name: 'arm_lift',
        text: 'Arm lift effort',
        effortPercentage: 25,
    },
    {
        id: 2,
        name: 'arm_tilt',
        text: 'Arm tilt effort',
        effortPercentage: 25,
    },
    {
        id: 3,
        name: 'claw_rotate',
        text: 'Claw rotate effort',
        effortPercentage: 25,
    },
    {
        id: 4,
        name: 'claw_lift',
        text: 'Claw lift effort',
        effortPercentage: 25,
    },
    {
        id: 5,
        name: 'claw_clamp',
        text: 'Claw clamp effort',
        effortPercentage: 25,
    },
])

// Publish steering informations
const timer = ref(null)
const topic = ref(null)
const maxEffort = ref(1.0)
const messageRate = 100 // [ms]

function startPublishing() {
    timer.value = setInterval(() => {
        let currentTime = new Date()
        let names = []
        elements.value.forEach((element) => {
            names.push(element.name)
        })
        let message = new Message({
            header: {
                stamp: {
                    secs: Math.floor(currentTime.getTime() / 1000),
                    nsecs: Math.round(
                        1000000000 *
                            (currentTime.getTime() / 1000 -
                                Math.floor(currentTime.getTime() / 1000))
                    ),
                },
            },
            name: names,
            effort: [0, 0, 0, 0, 0, 0],
        })
        if (focusIndex.value >= 0 && focusIndex.value <= 2) {
            message.effort[0] =
                (pressed.value.A - pressed.value.D) *
                maxEffort.value *
                0.01 *
                elements.value[0].effortPercentage
            message.effort[1] =
                (pressed.value.W - pressed.value.S) *
                maxEffort.value *
                0.01 *
                elements.value[1].effortPercentage
            message.effort[2] =
                (pressed.value.Q - pressed.value.E) *
                maxEffort.value *
                0.01 *
                elements.value[2].effortPercentage
        } else if (focusIndex.value >= 3 && focusIndex.value <= 5) {
            message.effort[3] =
                (pressed.value.A - pressed.value.D) *
                maxEffort.value *
                0.01 *
                elements.value[3].effortPercentage
            message.effort[4] =
                (pressed.value.W - pressed.value.S) *
                maxEffort.value *
                0.01 *
                elements.value[4].effortPercentage
            message.effort[5] =
                (pressed.value.Q - pressed.value.E) *
                maxEffort.value *
                0.01 *
                elements.value[5].effortPercentage
        }
        topic.value.publish(message)
    }, messageRate.value)
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
            maxEffort.value = value
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
    topic.value = new Topic({
        ros: props.ros,
        name: '/manip_vel',
        messageType: 'sensor_msgs/JointState',
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
        <div
            v-for="(element, i) in elements"
            :key="element.name"
            class="slidecontainer"
        >
            <td class="col1">
                <input
                    type="range"
                    min="1"
                    max="100"
                    class="slider"
                    :class="{ focused: focusIndex == i && isWindowFocused }"
                    :id="element.id"
                    v-model="element.effortPercentage"
                    @click="focusIndex = i"
                />
            </td>
            <td class="col2">
                <label class="sliderLabel">{{ element.text }}:</label>
            </td>
            <td class="col3">
                <label class="sliderLabel">
                    {{ element.effortPercentage }}%
                </label>
            </td>
        </div>
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
