import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import ROSLIB from 'roslib'
import {
    callService,
    onRosConnected,
    onRosDisconnected,
} from '@/misc/roslibExtensions'

import { useSteeringStore } from './steering'
import { useRosStore } from './ros'

export const useJoystickStore = defineStore('joystick', () => {
    const steeringStore = useSteeringStore()
    const rosStore = useRosStore()

    const connected = computed(() => !!joystick.value)

    const joystick = ref(null)

    const connectListener = ref(null)
    const disconnectListener = ref(null)
    const statusTransmitter = ref(null)

    const joyTopic = ref(null)

    onRosConnected(() => findJoystick())
    onRosDisconnected(() => {
        cancelAnimationFrame(statusTransmitter.value)
        statusTransmitter.value = null
        joyTopic.value = null
    })

    const findJoystick = async () => {
        steeringStore.giveUpControl()
        if (statusTransmitter.value) {
            cancelAnimationFrame(statusTransmitter.value)
            statusTransmitter.value = null
        }

        const gamepads = navigator.getGamepads()
        for (const gamepad of gamepads) {
            if (gamepad && gamepad.connected) {
                joystick.value = gamepad
                if (rosStore.ros) {
                    await startTransmitting()
                }
                return
            }
        }
        joystick.value = null
    }

    const getNewJoystickName = async () => {
        const joysticks = (
            await callService(
                '/joy_multiplexer/list_joy',
                'joystick_control/ListJoy',
                {}
            )
        ).topic_names

        let nextId = 0
        for (const joystick of joysticks) {
            const match = joystick.match(/interface_joy_(\d+)/)

            if (match && match[1]) {
                nextId = Math.max(nextId, parseInt(match[1]) + 1)
            }
        }
        return `/interface_joy_${nextId}`
    }

    const startTransmitting = async () => {
        const name = await getNewJoystickName()
        console.log('Connecting joy to topic:', name)

        await callService(
            '/joy_multiplexer/add_joy',
            'joystick_control/AddJoy',
            { topic_name: name }
        )

        joyTopic.value = new ROSLIB.Topic({
            ros: rosStore.ros,
            name: name,
            messageType: 'sensor_msgs/Joy',
        })
        statusTransmitter.value = requestAnimationFrame(transmitStatus)
    }

    function transmitStatus() {
        joyTopic.value.publish(
            new ROSLIB.Message({
                header: {
                    seq: 1,
                    stamp: 0,
                    frame_id: 'test_joy',
                },
                axes: joystick.value.axes,
                buttons: joystick.value.buttons.map((btn) => btn.value),
            })
        )

        statusTransmitter.value = requestAnimationFrame(transmitStatus)
    }

    function start() {
        connectListener.value = window.addEventListener(
            'gamepadconnected',
            () => {
                findJoystick()
            }
        )
        disconnectListener.value = window.addEventListener(
            'gamepaddisconnected',
            () => {
                findJoystick()
            }
        )
    }

    function stop() {
        if (connectListener.value) {
            window.removeEventListener(
                'gamepadconnected',
                connectListener.value
            )
            connectListener.value = null
        }
        if (disconnectListener.value) {
            window.removeEventListener(
                'gamepaddisconnected',
                disconnectListener.value
            )
            disconnectListener.value = null
        }
        if (statusTransmitter.value) {
            cancelAnimationFrame(statusTransmitter.value)
            statusTransmitter.value = null
        }
    }

    return {
        connected,
        joystick,

        start,
        stop,
    }
})
