<script>
import { Topic, Message, Param } from 'roslib'
export default {
    name: 'KeyboardControl',
    props: {
        ros: Object,
    },
    data() {
        return {
            topic: null,
            timer: null,
            message_rate: 100, // [ms]
            max_linear_speed: 1,
            max_angular_speed: 1.57,
            focus_index: 0,
            is_focused: false,
            pressed: { W: false, A: false, S: false, D: false },
            elements: [
                {
                    id: 'linear_speed',
                    text: 'Linear velocity',
                    speed_percentage: 25,
                },
                {
                    id: 'angular_speed',
                    text: 'Angular velocity',
                    speed_percentage: 25,
                },
            ],
            key_down_callback: (event) => {
                this.keyListener(event, true)
            },
            key_up_callback: (event) => {
                this.keyListener(event, false)
            },
        }
    },
    methods: {
        startPublishing() {
            this.timer = setInterval(() => {
                let message = new Message({
                    linear: {
                        x:
                            (this.pressed.W - this.pressed.S) *
                            this.max_linear_speed *
                            0.01 *
                            this.elements[0].speed_percentage,
                        y: 0,
                        z: 0,
                    },
                    angular: {
                        x: 0,
                        y: 0,
                        z:
                            (this.pressed.A - this.pressed.D) *
                            this.max_angular_speed *
                            0.01 *
                            this.elements[1].speed_percentage,
                    },
                })
                // console.log(message)
                this.topic.publish(message)
            }, this.message_rate)
        },
        keyListener(e, isPressed) {
            if (!this.is_focused) return
            let key = e.key.toUpperCase()

            if (this.pressed[key] !== undefined) this.pressed[key] = isPressed

            if (key === 'TAB' && isPressed) {
                this.focus_index = (this.focus_index + 1) % this.elements.length
                document
                    .getElementById(this.elements[this.focus_index].id)
                    .focus()
            }
        },
        focus() {
            this.is_focused = true
            document.getElementById(this.elements[this.focus_index].id).focus()
        },
        unfocus() {
            this.is_focused = false
            this.pressed.W = false
            this.pressed.A = false
            this.pressed.S = false
            this.pressed.D = false
        },
    },
    mounted() {
        this.topic = new Topic({
            ros: this.ros,
            name: '/cmd_vel',
            messageType: 'geometry_msgs/Twist',
        })
        window.addEventListener('keydown', this.key_down_callback)
        window.addEventListener('keyup', this.key_up_callback)

        // Read maximum speed from ros params
        let base = '/web_interface/control'
        let maxLinearSpeedParam = new Param({
            ros: this.ros,
            name: base + '/linear/x/max_velocity',
        })
        maxLinearSpeedParam.get((value) => {
            if (value != null) {
                this.max_linear_speed = value
            }
        })
        let maxAngularSpeedParam = new Param({
            ros: this.ros,
            name: base + '/angular/z/max_velocity',
        })
        maxAngularSpeedParam.get((value) => {
            if (value != null) {
                this.max_angular_speed = value
            }
        })
        this.startPublishing()

        // Set focus on first slider
        document.getElementById(this.elements[this.focus_index].id).focus()
    },
    beforeDestroy() {
        clearInterval(this.timer)
        window.removeEventListener('keydown', this.key_down_callback)
        window.removeEventListener('keyup', this.key_up_callback)
    },
}
</script>
<template>
    <div
        class="control keyboardControl"
        @click.left="focus()"
        @focusout="unfocus()"
        @focusin="focus()"
    >
        <div
            v-for="(element, i) in this.elements"
            :key="element.name"
            class="slidecontainer"
        >
            <td class="col1">
                <input
                    type="range"
                    min="1"
                    max="100"
                    class="slider"
                    :class="{ focused: focus_index == i && is_focused }"
                    :id="element.id"
                    v-model="element.speed_percentage"
                    @click="focus_index = i"
                />
            </td>
            <td class="col2">
                <label class="sliderLabel">{{ element.text }}:</label>
            </td>
            <td class="col3">
                <label class="sliderLabel">
                    {{ element.speed_percentage }}%
                </label>
            </td>
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
        <p>
            Use 'TAB' to switch between sliders or 'Arrow Keys' to change each
            speed value.
        </p>
    </div>
</template>
<style>
@import './control-styles.css';
</style>
