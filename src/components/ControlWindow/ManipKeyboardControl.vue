<script>
import { Topic, Message, Param } from 'roslib'
export default {
    name: 'ManipKeyboardControl',
    props: {
        ros: Object,
    },
    data() {
        return {
            topic: null,
            timer: null,
            message_rate: 100, // [ms]
            max_effort: 1.0,
            focus_index: 0,
            is_focused: false,
            pressed: {
                Q: false,
                E: false,
                W: false,
                A: false,
                S: false,
                D: false,
            },
            elements: [
                {
                    id: 0,
                    name: 'arm_rotate',
                    text: 'Arm rotate effort',
                    effort_percentage: 25,
                },
                {
                    id: 1,
                    name: 'arm_lift',
                    text: 'Arm lift effort',
                    effort_percentage: 25,
                },
                {
                    id: 2,
                    name: 'arm_tilt',
                    text: 'Arm tilt effort',
                    effort_percentage: 25,
                },
                {
                    id: 3,
                    name: 'claw_rotate',
                    text: 'Claw rotate effort',
                    effort_percentage: 25,
                },
                {
                    id: 4,
                    name: 'claw_lift',
                    text: 'Claw lift effort',
                    effort_percentage: 25,
                },
                {
                    id: 5,
                    name: 'claw_clamp',
                    text: 'Claw clamp effort',
                    effort_percentage: 25,
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
                let current_time = new Date()
                let names = []
                this.elements.forEach((element) => {
                    names.push(element.name)
                })
                let message = new Message({
                    header: {
                        stamp: {
                            secs: Math.floor(current_time.getTime() / 1000),
                            nsecs: Math.round(
                                1000000000 *
                                    (current_time.getTime() / 1000 -
                                        Math.floor(
                                            current_time.getTime() / 1000
                                        ))
                            ),
                        },
                    },
                    name: names,
                    effort: [0, 0, 0, 0, 0, 0],
                })
                if (this.focus_index >= 0 && this.focus_index <= 2) {
                    message.effort[0] =
                        (this.pressed.A - this.pressed.D) *
                        this.max_effort *
                        0.01 *
                        this.elements[0].effort_percentage
                    message.effort[1] =
                        (this.pressed.W - this.pressed.S) *
                        this.max_effort *
                        0.01 *
                        this.elements[1].effort_percentage
                    message.effort[2] =
                        (this.pressed.Q - this.pressed.E) *
                        this.max_effort *
                        0.01 *
                        this.elements[2].effort_percentage
                } else if (this.focus_index >= 3 && this.focus_index <= 5) {
                    message.effort[3] =
                        (this.pressed.A - this.pressed.D) *
                        this.max_effort *
                        0.01 *
                        this.elements[3].effort_percentage
                    message.effort[4] =
                        (this.pressed.W - this.pressed.S) *
                        this.max_effort *
                        0.01 *
                        this.elements[4].effort_percentage
                    message.effort[5] =
                        (this.pressed.Q - this.pressed.E) *
                        this.max_effort *
                        0.01 *
                        this.elements[5].effort_percentage
                }
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
            this.pressed.Q = false
            this.pressed.E = false
            this.pressed.W = false
            this.pressed.A = false
            this.pressed.S = false
            this.pressed.D = false
        },
    },
    mounted() {
        this.topic = new Topic({
            ros: this.ros,
            name: '/manip_vel',
            messageType: 'sensor_msgs/JointState',
        })
        window.addEventListener('keydown', this.key_down_callback)
        window.addEventListener('keyup', this.key_up_callback)

        // Read maximum effort from ros params
        let base = '/web_interface/control'
        let maxEffortParam = new Param({
            ros: this.ros,
            name: base + '/max_effort',
        })
        maxEffortParam.get((value) => {
            if (value != null) {
                this.max_effort = value
            }
        })
        this.startPublishing()

        // Set focus on first slider
        document.getElementById(this.elements[this.focus_index].id).focus()

        // Set unique IDs
        const randId = String(parseInt(1000000 * Math.random()))
        for (let i = 0; i < this.elements.length; ++i)
            this.elements[i].id = randId + i
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
        class="control keyboardControl manip"
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
                    v-model="element.effort_percentage"
                    @click="focus_index = i"
                />
            </td>
            <td class="col2">
                <label class="sliderLabel">{{ element.text }}:</label>
            </td>
            <td class="col3">
                <label class="sliderLabel">
                    {{ element.effort_percentage }}%
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

<style>
@import './control-styles.css';

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
