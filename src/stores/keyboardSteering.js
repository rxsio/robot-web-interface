import ROSLIB from 'roslib'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useRosStore } from './ros'
import { useSteeringStore } from './steering'

export const useKeyboardSteeringStore = defineStore('keyboardSteering', () => {
    const rosStore = useRosStore()
    const steeringStore = useSteeringStore()

    const enabled = ref(false)

    const gear = ref(1)
    const pressedKeys = ref({
        forwards: false,
        backwards: false,
        right: false,
        left: false,
    })
    const cmdVel = ref(null)

    const clickListener = ref(null)
    const keyDownListener = ref(null)
    const keyUpListener = ref(null)
    const statusTransmitter = ref(null)

    // this should be controlled by a launch file
    const gearConfig = ref([
        { linear: 0.1, angular: 0.1 },
        { linear: 0.5, angular: 0.5 },
        { linear: 1.0, angular: 1.0 },
    ])
    const config = computed(() => gearConfig.value[gear.value - 1])

    function takeOverControl() {
        if (!rosStore.ros) return

        enabled.value = true

        if (!clickListener.value) {
            clickListener.value = document.addEventListener('click', () => {
                steeringStore.giveUpControl()
            })
        }

        cmdVel.value = new ROSLIB.Topic({
            ros: rosStore.ros,
            name: '/cmd_vel',
            messageType: 'geometry_msgs/Twist',
        })

        if (statusTransmitter.value) {
            cancelAnimationFrame(statusTransmitter.value)
            statusTransmitter.value = null
        }
        statusTransmitter.value = requestAnimationFrame(transmitStatus)
    }

    function giveUpControl() {
        enabled.value = false

        if (clickListener.value) {
            document.removeEventListener('click', clickListener.value)
            clickListener.value = null
        }
        if (statusTransmitter.value) {
            cancelAnimationFrame(statusTransmitter.value)
            statusTransmitter.value = null
        }
        cmdVel.value = null
    }

    function transmitStatus() {
        const keys = pressedKeys.value
        let x = 0.0,
            y = 0.0

        if (keys.forwards && !keys.backwards) x = 1.0
        if (keys.backwards && !keys.forwards) x = -1.0

        if (keys.right && !keys.left) y = -1.0
        if (keys.left && !keys.right) y = 1.0

        x *= config.value.linear
        y *= config.value.angular

        let twist = new ROSLIB.Message({
            linear: {
                x: x,
                y: 0,
                z: 0,
            },
            angular: {
                x: 0,
                y: 0,
                z: y,
            },
        })
        cmdVel.value.publish(twist)

        statusTransmitter.value = requestAnimationFrame(transmitStatus)
    }

    function onKeyDown(event) {
        if (steeringStore.currentMode === 'keyboard' && steeringStore.enabled) {
            switch (event.key) {
                case 'w':
                    pressedKeys.value.forwards = true
                    break
                case 'a':
                    pressedKeys.value.left = true
                    break
                case 's':
                    pressedKeys.value.backwards = true
                    break
                case 'd':
                    pressedKeys.value.right = true
                    break
                case ',':
                    if (gear.value > 1) gear.value--
                    break
                case '.':
                    if (gear.value < 3) gear.value++
                    break
            }
        }
    }
    function onKeyUp(event) {
        if (
            steeringStore.currentMode === 'keyboard' &&
            event.key === ' ' &&
            event.ctrlKey
        ) {
            pressedKeys.value = {
                forwards: false,
                backwards: false,
                right: false,
                left: false,
            }
            if (steeringStore.enabled) {
                steeringStore.giveUpControl()
            } else {
                steeringStore.takeOverControl()
            }
        }
        if (steeringStore.currentMode === 'keyboard' && steeringStore.enabled) {
            switch (event.key) {
                case 'w':
                    pressedKeys.value.forwards = false
                    break
                case 'a':
                    pressedKeys.value.left = false
                    break
                case 's':
                    pressedKeys.value.backwards = false
                    break
                case 'd':
                    pressedKeys.value.right = false
                    break
            }
        }
    }

    function start() {
        pressedKeys.value = {
            forwards: false,
            backwards: false,
            right: false,
            left: false,
        }
        keyDownListener.value = document.addEventListener('keydown', onKeyDown)
        keyUpListener.value = document.addEventListener('keyup', onKeyUp)
    }

    function stop() {
        if (statusTransmitter.value) {
            cancelAnimationFrame(statusTransmitter.value)
            statusTransmitter.value = null
        }
        if (keyDownListener.value) {
            document.removeEventListener('keydown', keyDownListener.value)
            keyDownListener.value = null
        }
        if (keyUpListener.value) {
            document.removeEventListener('keyup', keyUpListener.value)
            keyUpListener.value = null
        }
    }

    return {
        gear,
        config,
        enabled,

        takeOverControl,
        giveUpControl,
        start,
        stop,
    }
})
