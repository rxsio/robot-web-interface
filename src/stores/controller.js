import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import ROSLIB from 'roslib'
import { callService } from '@/misc/roslibExtensions'

import { useSteeringStore } from './steering'
import { useRosStore } from './ros'

export const useControllerStore = defineStore('controller', () => {
    const steeringStore = useSteeringStore()
    const rosStore = useRosStore()

    const connected = computed(() => !!controller.value)

    const controller = ref(null)

    const connectListener = ref(null)
    const disconnectListener = ref(null)
    const statusTransmitter = ref(null)

    const joyTopic = ref(null)

    watch(
        () => rosStore.ros,
        () => {
            if (rosStore.ros) {
                findController()
            } else {
                cancelAnimationFrame(statusTransmitter.value)
                statusTransmitter.value = null
                joyTopic.value = null
            }
        }
    )

    const findController = async () => {
        steeringStore.giveUpControl()
        if (statusTransmitter.value) {
            cancelAnimationFrame(statusTransmitter.value)
            statusTransmitter.value = null
        }

        const gamepads = navigator.getGamepads()
        for (const gamepad of gamepads) {
            if (gamepad && gamepad.connected) {
                controller.value = gamepad
                if (rosStore.ros) {
                    await startTransmitting()
                }
                return
            }
        }
        controller.value = null
    }

    const getNewJoystickName = async () => {
        const joysticks = (
            await callService({
                name: '/joy_multiplexer/list_joy',
                serviceType: 'joystick_control/ListJoy',
                request: {},
            })
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

        await callService({
            name: '/joy_multiplexer/add_joy',
            serviceType: 'joystick_control/AddJoy',
            request: { topic_name: name },
        })

        joyTopic.value = new ROSLIB.Topic({
            ros: rosStore.ros,
            name: name,
            messageType: 'sensor_msgs/Joy',
        })
        console.log(joyTopic.value.name)
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
                axes: controller.value.axes,
                buttons: controller.value.buttons.map((btn) => btn.value),
            })
        )

        statusTransmitter.value = requestAnimationFrame(transmitStatus)
    }

    function start() {
        connectListener.value = window.addEventListener(
            'gamepadconnected',
            () => {
                findController()
            }
        )
        disconnectListener.value = window.addEventListener(
            'gamepaddisconnected',
            () => {
                findController()
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
        controller,

        start,
        stop,
    }
})
