<template>
    <div class="manipKeyboardControl">
        <div v-for:="(element, i) in this.elements" class="slidecontainer">
            <td class="col1">
                <input type="range" min="1" max="100" class="slider" :class="{ focused: focus_index == i }" :id="element.name"
                v-model="element.effort_percentage" v-on:input="sliderInputCallback" @click="focus_index = i">
            </td>
            <td class="col2">
                <label class="sliderLabel">{{ element.text }}:</label>
            </td>
            <td class="col3">
                <label class="sliderLabel">{{ element.effort_percentage }}%</label>
            </td>
        </div>
        <div class="keyboardBox">
            <p>
                <button :class="{ pressed: pressed_Q }">Q</button>
                <button :class="{ pressed: pressed_W }">W</button>
                <button :class="{ pressed: pressed_E }">E</button>
            </p>
            <p>
                <button :class="{ pressed: pressed_A }">A</button>
                <button :class="{ pressed: pressed_S }">S</button>
                <button :class="{ pressed: pressed_D }">D</button>
            </p>
        </div>

        <p>Use 'Space' to switch between sliders or 'Arrow Keys' to change each effort value.</p>
        <p>Steering will be automaticly switched between the arm or the claw by changing the choosen slider. Use keys:</p>
        <div class="description">
            <li><b>'A'</b> and <b>'D'</b> to rotate the arm or the claw</li>
            <li><b>'W'</b> and <b>'S'</b> to lift the arm or the claw</li>
            <li><b>'Q'</b> and <b>'E'</b> to tilt the arm or clamp the claw</li>
        </div>
    </div>
</template>

<script>
import { capitalize } from '@vue/shared';
    export default {
        name: "ManipKeyboardControl",
        props: {
            'ws_address': String,
            'ros': Object,
        },
        data() {
            return {
                topic: null,
                timer: null,
                max_effort: 1.0,
                message_rate: 100, // [ms]
                pressed_Q: false,
                pressed_E: false,
                pressed_W: false,
                pressed_A: false,
                pressed_S: false,
                pressed_D: false,
                focus_index: 0,
                elements: [
                    { text: "Arm rotate effort", name: "arm_rotate", cookie: "arm-rotate", effort_percentage: 25 },
                    { text: "Arm lift effort", name: "arm_lift", cookie: "arm-lift", effort_percentage: 25 },
                    { text: "Arm tilt effort", name: "arm_tilt", cookie: "arm-tilt", effort_percentage: 25 },
                    { text: "Claw rotate effort", name: "claw_rotate", cookie: "claw-rotate", effort_percentage: 25 },
                    { text: "Claw lift effort", name: "claw_lift", cookie: "claw-lift", effort_percentage: 25 },
                    { text: "Claw clamp effort", name: "claw_clamp", cookie: "claw-clamp", effort_percentage: 25 },
                ]
            }
        },
        methods: {
            startPublishing() {
                this.timer = setInterval(() => {
                    var current_time = new Date();
                    var message = new window.ROSLIB.Message({
                        header : {
                            stamp : {
                                secs : Math.floor(current_time.getTime()/1000),
                                nsecs : Math.round(1000000000 * (current_time.getTime()/1000 - Math.floor(current_time.getTime()/1000)))
                            }
                        },
                        name : this.elements,
                        effort : [ 0, 0, 0, 0, 0, 0 ]
                    });
                    if( this.focus_index >= 0 && this.focus_index <= 2 ){
                        message.effort[0] = ( this.pressed_A - this.pressed_D ) * this.max_effort * 0.01 * elements[0].effort_percentage;
                        message.effort[1] = ( this.pressed_W - this.pressed_S ) * this.max_effort * 0.01 * elements[1].effort_percentage;
                        message.effort[2] = ( this.pressed_Q - this.pressed_E ) * this.max_effort * 0.01 * elements[2].effort_percentage;
                    }
                    else if( this.focus_index >= 3 && this.focus_index <= 5 ){
                        message.effort[3] = ( this.pressed_A - this.pressed_D ) * this.max_effort * 0.01 * elements[3].effort_percentage;
                        message.effort[4] = ( this.pressed_W - this.pressed_S ) * this.max_effort * 0.01 * elements[4].effort_percentage;
                        message.effort[5] = ( this.pressed_Q - this.pressed_E ) * this.max_effort * 0.01 * elements[5].effort_percentage;
                    }
                    this.topic.publish(message);
                }, this.message_rate)
            },
            keyListener(e, isPressed) {
                var key = capitalize(e.key);
                switch (key) {
                    case 'Q':
                        this.pressed_Q = isPressed;
                        break;
                    case 'E':
                        this.pressed_E = isPressed;
                        break;
                    case 'W':
                        this.pressed_W = isPressed;
                        break;
                    case 'S':
                        this.pressed_S = isPressed;
                        break;
                    case 'A':
                        this.pressed_A = isPressed;
                        break;
                    case 'D':
                        this.pressed_D = isPressed;
                        break;
                    case ' ':
                        if(isPressed)
                            this.focus_index = (this.focus_index + 1) % this.elements.length;
                        document.getElementById(this.elements[this.focus_index].name).focus();
                        break;
                    default:
                        break;
                }
            },
            sliderInputCallback() {
                for(i in this.elements.length) {
                    this.$cookies.set(this.elements[i - 1].cookie, this.elements[i - 1].effort_percentage);
                }
            }
        },
        mounted() {
            this.topic = new window.ROSLIB.Topic({
                ros : this.ros,
                name : '/manip_vel',
                messageType : 'sensor_msgs/JointState'
            });
            window.addEventListener('keydown', event => {
                this.keyListener(event, true);
            });
            window.addEventListener('keyup', event => {
                this.keyListener(event, false);
            });

            // Read previous percentage settings
            for(i in this.elements_names.length) {
                if (this.$cookies.isKey(this.elements[i - 1].cookie)) {
                    this.elements[i - 1].effort_percentage = this.$cookies.get(this.elements[i - 1].cookie);
                }
            }

            // Read maximum effort from ros params
            var base = "/web_interface/control"
            var maxEffortParam = new window.ROSLIB.Param({
                ros : this.ros,
                name :  base + '/max_effort' // do spradzenia czy istnieje ???
            });
            maxEffortParam.get((value) => {
                if (value != null) {
                    this.max_effort = value;
                }
            });
            this.startPublishing();

            // Set focus on first slider
            document.getElementById(this.elements[this.focus_index].name).focus();
        },
        beforeDestroy() {
            clearInterval(this.timer);
            window.removeEventListener('keydown');
            window.removeEventListener('keyup');
        }
    };
</script>

<style>
    div.manipKeyboardControl {
        margin: 10px 5px;
    }
    div.manipKeyboardControl div.slidecontainer {
        height: 40px;
        width: 80%;
        display: inline-table;
        padding: 5px;
    }
    div.manipKeyboardControl div.slidecontainer td.col1 {
        width: auto;
        text-align: right;
        vertical-align: middle;
    }
    div.manipKeyboardControl div.slidecontainer td.col2 {
        width: 8.5em;
        text-align: left;
        vertical-align: middle;
    }
    div.manipKeyboardControl div.slidecontainer td.col3 {
        width: 3em;
        text-align: right;
        vertical-align: middle;
    }
    div.manipKeyboardControl div.slidecontainer .slider {
        width: 90%;
    }
    div.manipKeyboardControl div.slidecontainer .slider.focused {
        background: var(--secondary-light);
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
    div.keyboardBox p button{
        margin: 8px;
        width: 80px;
        height: 80px;
        font-size: 40px;
    }
    div.keyboardBox p button.pressed {
        background-color: var(--secondary-light);
    }
    div.manipKeyboardControl div.description {
        width: 22em;
        display: inline-block;
    }
    div.manipKeyboardControl div.description li {
        margin-left: 2em;
        padding: 0.25em;
        text-align: left;
    }
</style>
