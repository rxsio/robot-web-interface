import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useControllerStore } from './controller'
import { useRosStore } from './ros'
import ROSLIB from 'roslib'

export const useSteeringStore = defineStore('steering', () => {
    const controllerStore = useControllerStore()
    const rosStore = useRosStore()

    const enabled = ref(false)
    const controllerMode = ref('normal')
    const drivingGear = ref(1)
    const manipGear = ref(1)
    const keyboardGear = ref(1)
    const keyboardPressedKeys = ref({
        forwards: false,
        backwards: false,
        right: false,
        left: false,
    })
    const keyboardCmdVel = ref(null)

    const clickListener = ref(null)
    const keyDownListener = ref(null)
    const keyUpListener = ref(null)
    const keyboardTransmitter = ref(null)

    const gears = [1, 2, 3]
    const gearIcons = {
        1: 'mdi-numeric-1',
        2: 'mdi-numeric-2',
        3: 'mdi-numeric-3',
    }
    const keyboardGearConfig = ref([
        { linear: 0.1, angular: 0.1 },
        { linear: 0.5, angular: 0.5 },
        { linear: 1.0, angular: 1.0 },
    ])
    const keyboardConfig = computed(
        () => keyboardGearConfig.value[keyboardGear.value - 1]
    )

    const drivingModes = ['normal', 'car', 'tank']
    const manipModes = ['forward', 'inverse', 'inverseCylinder']

    const modeIcons = {
        normal: 'mdi-arrow-decision',
        car: 'mdi-car-side',
        tank: 'mdi-tank',

        forward: 'mdi-robot-industrial',
        inverse: 'mdi-axis-arrow',
        inverseCylinder: 'mdi-axis-z-rotate-clockwise',

        keyboard: 'mdi-keyboard',
    }

    const currentGear = computed(() => {
        if (drivingModes.includes(currentMode.value)) return drivingGear.value
        if (manipModes.includes(currentMode.value)) return manipGear.value
        if (currentMode.value === 'keyboard') return keyboardGear.value
        return 0
    })

    const currentMode = computed({
        get() {
            return controllerStore.connected ? controllerMode.value : 'keyboard'
        },
        set(newValue) {
            if (controllerStore.connected) controllerMode.value = newValue
        },
    })

    function takeOverControl() {
        enabled.value = true
        if (currentMode.value === 'keyboard') {
            if (!clickListener.value) {
                clickListener.value = document.addEventListener('click', () => {
                    giveUpControl()
                })
            }

            keyboardCmdVel.value = new ROSLIB.Topic({
                ros: rosStore.ros,
                name: '/cmd_vel',
                messageType: 'geometry_msgs/Twist',
            })

            if (keyboardTransmitter.value) {
                cancelAnimationFrame(keyboardTransmitter.value)
                keyboardTransmitter.value = null
            }
            keyboardTransmitter.value = requestAnimationFrame(
                transmitKeyboardStatus
            )
        }
    }

    function giveUpControl() {
        enabled.value = false
        if (clickListener.value) {
            document.removeEventListener('click', clickListener.value)
            clickListener.value = null
        }
        if (keyboardTransmitter.value) {
            cancelAnimationFrame(keyboardTransmitter.value)
            keyboardTransmitter.value = null
        }
        keyboardCmdVel.value = null
    }

    function transmitKeyboardStatus() {
        const keys = keyboardPressedKeys.value
        let x = 0.0,
            y = 0.0

        if (keys.forwards && !keys.backwards) x = 1.0
        if (keys.backwards && !keys.forwards) x = -1.0

        if (keys.right && !keys.left) y = -1.0
        if (keys.left && !keys.right) y = 1.0

        x *= keyboardConfig.value.linear
        y *= keyboardConfig.value.angular

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
        keyboardCmdVel.value.publish(twist)

        keyboardTransmitter.value = requestAnimationFrame(
            transmitKeyboardStatus
        )
    }

    function onKeyDown(event) {
        if (currentMode.value === 'keyboard' && enabled.value) {
            switch (event.key) {
                case 'w':
                    keyboardPressedKeys.value.forwards = true
                    break
                case 'a':
                    keyboardPressedKeys.value.left = true
                    break
                case 's':
                    keyboardPressedKeys.value.backwards = true
                    break
                case 'd':
                    keyboardPressedKeys.value.right = true
                    break
                case ',':
                    if (keyboardGear.value > 1) keyboardGear.value--
                    break
                case '.':
                    if (keyboardGear.value < 3) keyboardGear.value++
                    break
            }
        }
    }
    function onKeyUp(event) {
        if (
            currentMode.value === 'keyboard' &&
            event.key === ' ' &&
            event.ctrlKey
        ) {
            keyboardPressedKeys.value = {
                forwards: false,
                backwards: false,
                right: false,
                left: false,
            }
            if (enabled.value) {
                giveUpControl()
            } else {
                takeOverControl()
            }
        }
        if (currentMode.value === 'keyboard' && enabled.value) {
            switch (event.key) {
                case 'w':
                    keyboardPressedKeys.value.forwards = false
                    break
                case 'a':
                    keyboardPressedKeys.value.left = false
                    break
                case 's':
                    keyboardPressedKeys.value.backwards = false
                    break
                case 'd':
                    keyboardPressedKeys.value.right = false
                    break
            }
        }
    }

    function start() {
        keyboardPressedKeys.value = {
            forwards: false,
            backwards: false,
            right: false,
            left: false,
        }
        keyDownListener.value = document.addEventListener('keydown', onKeyDown)
        keyUpListener.value = document.addEventListener('keyup', onKeyUp)
    }

    function stop() {
        if (keyboardTransmitter.value) {
            cancelAnimationFrame(keyboardTransmitter.value)
            keyboardTransmitter.value = null
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
        currentMode,
        enabled,
        drivingGear,
        manipGear,
        keyboardGear,
        currentGear,

        gears,
        drivingModes,
        manipModes,
        gearIcons,
        modeIcons,

        keyboardConfig,

        takeOverControl,
        giveUpControl,
        start,
        stop,
    }
})
