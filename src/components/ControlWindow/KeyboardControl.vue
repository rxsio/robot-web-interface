<script setup>
import { defineProps, onMounted, onBeforeUnmount, ref } from 'vue'
import { Topic, Message, Param } from 'roslib'

const props = defineProps(['ros'])

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
const timer = ref(null)
const topic = ref(null)
const maxLinearSpeed = ref(1)
const maxAngularSpeed = ref(1.57)
const messageRate = 100 // [ms]

function startPublishing() {
    timer.value = setInterval(() => {
        let message = new Message({
            linear: {
                x:
                    (pressed.value.W - pressed.value.S) *
                    maxLinearSpeed.value *
                    0.01 *
                    elements.value[0].speedPercentage,
                y: 0,
                z: 0,
            },
            angular: {
                x: 0,
                y: 0,
                z:
                    (pressed.value.A - pressed.value.D) *
                    maxAngularSpeed.value *
                    0.01 *
                    elements.value[1].speedPercentage,
            },
        })
        // console.log(message)
        topic.value.publish(message)
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
    // Read maximum speed from ros params
    let base = '/web_interface/control'
    let maxLinearSpeedParam = new Param({
        ros: props.ros,
        name: base + '/linear/x/max_velocity',
    })
    maxLinearSpeedParam.get((value) => {
        if (value != null) {
            maxLinearSpeed.value = value
        }
    })
    let maxAngularSpeedParam = new Param({
        ros: props.ros,
        name: base + '/angular/z/max_velocity',
    })
    maxAngularSpeedParam.get((value) => {
        if (value != null) {
            maxAngularSpeed.value = value
        }
    })

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
        class="control keyboardControl"
        @click.left="focus()"
        @focusout="unfocus()"
        @focusin="focus()"
    >
        <div style="position: absolute; top: 30px; right: 15px">
            <v-tooltip
                left
                max-width="300px"
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
                    Use
                    <b>'TAB'</b>
                    to switch between sliders or
                    <b>'Arrow Keys'</b>
                    to change each speed value.
                </span>
            </v-tooltip>
        </div>
        <div class="keyboardBox">
            <p>
                <button :class="{ pressed: pressed.W }">W</button>
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
    </div>
</template>
<style scoped>
@import '@/styles/control-styles.css';
</style>
