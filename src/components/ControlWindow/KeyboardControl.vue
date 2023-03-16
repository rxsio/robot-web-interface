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
            max_linear_speed: 1,
            max_angular_speed: 1.57,
            linear_speed_percentage: 25,
            angular_speed_percentage: 25,
            timer: null,
            message_rate: 100, // [ms]
            pressed_W: false,
            pressed_A: false,
            pressed_S: false,
            pressed_D: false,
            elements: ['linear_speed', 'angular_speed'],
            focus_index: 0,
            is_focused: false,
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
                var message = new Message({
                    linear: {
                        x:
                            (this.pressed_W - this.pressed_S) *
                            this.max_linear_speed *
                            0.01 *
                            this.linear_speed_percentage,
                        y: 0,
                        z: 0,
                    },
                    angular: {
                        x: 0,
                        y: 0,
                        z:
                            (this.pressed_A - this.pressed_D) *
                            this.max_angular_speed *
                            0.01 *
                            this.angular_speed_percentage,
                    },
                })
                this.topic.publish(message)
            }, this.message_rate)
        },
        keyListener(e, isPressed) {
            if (!this.is_focused) return
            var key = e.key.toUpperCase()
            switch (key) {
                case 'W':
                    this.pressed_W = isPressed
                    break
                case 'S':
                    this.pressed_S = isPressed
                    break
                case 'A':
                    this.pressed_A = isPressed
                    break
                case 'D':
                    this.pressed_D = isPressed
                    break
                case ' ':
                    if (isPressed)
                        this.focus_index =
                            (this.focus_index + 1) % this.elements.length
                    document
                        .getElementById(this.elements[this.focus_index])
                        .focus()
                    break
                default:
                    break
            }
        },
        sliderInputCallback() {
            // this.$cookies.set(
            //     'linear-speed-percentage',
            //     this.linear_speed_percentage
            // )
            // this.$cookies.set(
            //     'angular-speed-percentage',
            //     this.angular_speed_percentage
            // )
        },
        focus() {
            this.is_focused = true
            document.getElementById(this.elements[this.focus_index]).focus()
        },
        unfocus() {
            this.is_focused = false
            this.pressed_W = false
            this.pressed_A = false
            this.pressed_S = false
            this.pressed_D = false
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

        // Read previous percentage settings
        // if (this.$cookies.isKey('linear-speed-percentage')) {
        //     this.linear_speed_percentage = this.$cookies.get(
        //         'linear-speed-percentage'
        //     )
        // }
        // if (this.$cookies.isKey('angular-speed-percentage')) {
        //     this.angular_speed_percentage = this.$cookies.get(
        //         'angular-speed-percentage'
        //     )
        // }

        // Read maximum speed from ros params
        var base = '/web_interface/control'
        var maxLinearSpeedParam = new Param({
            ros: this.ros,
            name: base + '/linear/x/max_velocity',
        })
        maxLinearSpeedParam.get((value) => {
            if (value != null) {
                this.max_linear_speed = value
            }
        })
        var maxAngularSpeedParam = new Param({
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
        document.getElementById(this.elements[this.focus_index]).focus()
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
        <div class="slidecontainer">
            <td class="col1">
                <input
                    type="range"
                    min="1"
                    max="100"
                    class="slider"
                    :class="{ focused: focus_index == 0 && is_focused }"
                    id="linear_speed"
                    v-model="linear_speed_percentage"
                    v-on:input="sliderInputCallback"
                    @click="focus_index = 0"
                />
            </td>
            <td class="col2">
                <label class="sliderLabel">Linear velocity:</label>
            </td>
            <td class="col3">
                <label class="sliderLabel">
                    {{ this.linear_speed_percentage }}%
                </label>
            </td>
        </div>
        <div class="slidecontainer">
            <td class="col1">
                <input
                    type="range"
                    min="1"
                    max="100"
                    class="slider"
                    :class="{ focused: focus_index == 1 && is_focused }"
                    id="angular_speed"
                    v-model="angular_speed_percentage"
                    v-on:input="sliderInputCallback"
                    @click="focus_index = 1"
                />
            </td>
            <td class="col2">
                <label class="sliderLabel">Angular velocity:</label>
            </td>
            <td class="col3">
                <label class="sliderLabel">
                    {{ this.angular_speed_percentage }}%
                </label>
            </td>
        </div>

        <div class="keyboardBox">
            <p>
                <button :class="{ pressed: pressed_W }">W</button>
            </p>
            <p>
                <button :class="{ pressed: pressed_A }">A</button>
                <button :class="{ pressed: pressed_S }">S</button>
                <button :class="{ pressed: pressed_D }">D</button>
            </p>
        </div>
        <p>
            Use 'Space' to switch between sliders or 'Arrow Keys' to change each
            speed value.
        </p>
    </div>
</template>
<style>
@import './control-styles.css';

div.keyboardControl {
    display: flex;
    flex-flow: column;
    align-items: center;
    margin: 10px 5px;
    width: calc(100% - 5px);
    height: calc(100% - 10px);
}

div.keyboardControl div.slidecontainer {
    height: 40px;
    width: 80%;
    display: inline-table;
    padding: 5px;
}

div.keyboardControl div.slidecontainer td.col1 {
    width: auto;
    text-align: right;
    vertical-align: middle;
}

div.keyboardControl div.slidecontainer td.col2 {
    width: 8.5em;
    text-align: left;
    vertical-align: middle;
}

div.keyboardControl div.slidecontainer td.col3 {
    width: 3em;
    text-align: right;
    vertical-align: middle;
}

div.keyboardControl div.slidecontainer .slider {
    width: 90%;
}
div.keyboardControl div.slidecontainer .slider.focused {
    background: var(--control-secondary-light);
    height: 12px;
}

div.keyboardBox {
    padding: 10px;
    text-align: center;
    background: #eee;
    margin: 15px;
    display: inline-block;
    align-items: center;
    border-radius: 15px;
}

div.keyboardBox p {
    margin: 0;
}

div.keyboardBox p button {
    margin: 8px;
    width: 80px;
    height: 80px;
    font-size: 40px;
}

div.keyboardBox p button.pressed {
    background-color: var(--control-secondary-light);
}
</style>
