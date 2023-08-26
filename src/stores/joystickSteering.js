import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useSteeringStore, useRosStore, useJoystickStore } from './'
import {
    useJoy5dofManipulator,
    useJoyDiffDrive,
    useJoyMultiplexer,
} from './nodes'

import ROSLIB from 'roslib'
import {
    callService,
    onRosConnected,
    onRosDisconnected,
} from '@/misc/roslibExtensions'

export const useJoystickSteeringStore = defineStore('joystickSteering', () => {
    const steeringStore = useSteeringStore()
    const rosStore = useRosStore()
    const joystickStore = useJoystickStore()
    const joyDiffDrive = useJoyDiffDrive()
    const joy5dofManipulator = useJoy5dofManipulator()
    const joyMultiplexer = useJoyMultiplexer()

    const statusTransmitter = ref(null)

    const joyTopic = ref(null)

    const enabled = computed(() => {
        if (joyTopic.value)
            return joyMultiplexer.joyTopic === joyTopic.value.name

        return false
    })

    const currentMode = computed({
        get() {
            if (
                joyMultiplexer.outputTopic ===
                joyMultiplexer.outputTopics.driving
            )
                return joyDiffDrive.mode
            if (
                joyMultiplexer.outputTopic ===
                joyMultiplexer.outputTopics.manipulator
            )
                return joy5dofManipulator.mode

            return '__none'
        },
        set(newMode) {
            if (joyDiffDrive.modes.includes(newMode)) {
                joyMultiplexer.outputTopic = joyMultiplexer.outputTopics.driving
                joyDiffDrive.mode = newMode
            }

            if (joy5dofManipulator.modes.includes(newMode)) {
                joyMultiplexer.outputTopic =
                    joyMultiplexer.outputTopics.manipulator
            }
        },
    })
    const currentGear = computed(() => {
        if (joyMultiplexer.outputTopic === joyMultiplexer.outputTopics.driving)
            return joyDiffDrive.gear
        if (
            joyMultiplexer.outputTopic ===
            joyMultiplexer.outputTopics.manipulator
        )
            return joy5dofManipulator.gear

        return 0
    })

    onRosConnected(async () => {
        // start transmitting if a joystick has been connected before
        if (joystickStore.connected) await startTransmitting()
    })
    onRosDisconnected(() => {
        stop()
    })

    watch(
        () => joystickStore.joystick,
        async () => {
            if (joystickStore.connected) await startTransmitting()
            else stop()
        }
    )

    // joystick state transmission
    const getNewJoystickName = async () => {
        const joysticks = (
            await callService(
                '/joy_multiplexer/get_joy_list',
                'joystick_control/GetTopicList',
                {}
            )
        ).topics.array

        let nextId = 0
        for (const joystick of joysticks) {
            const match = joystick.name.match(/interface_joy_(\d+)/)

            if (match && match[1]) {
                nextId = Math.max(nextId, parseInt(match[1]) + 1)
            }
        }
        return `/interface_joy_${nextId}`
    }

    const startTransmitting = async () => {
        if (!rosStore.ros || !joystickStore.joystick) return

        steeringStore.giveUpControl()
        if (statusTransmitter.value) {
            cancelAnimationFrame(statusTransmitter.value)
            statusTransmitter.value = null
        }

        const name = await getNewJoystickName()
        console.log('Connecting joy to topic:', name)

        await callService(
            '/joy_multiplexer/add_joy',
            'joystick_control/SendTopic',
            { topic: { name } }
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
                axes: joystickStore.joystick.axes,
                buttons: joystickStore.joystick.buttons.map((btn) => btn.value),
            })
        )

        statusTransmitter.value = requestAnimationFrame(transmitStatus)
    }

    const takeOverControl = async () => {
        await callService(
            '/joy_multiplexer/select_joy',
            'joystick_control/SendTopic',
            { topic: { name: joyTopic.value.name } }
        )
    }
    const giveUpControl = async () => {
        await callService(
            '/joy_multiplexer/select_joy',
            'joystick_control/SendTopic',
            { topic: { name: '__none' } }
        )
    }

    function stop() {
        if (statusTransmitter.value) {
            cancelAnimationFrame(statusTransmitter.value)
            statusTransmitter.value = null
        }
        if (joyTopic.value) {
            callService(
                '/joy_multiplexer/remove_joy',
                'joystick_control/SendTopic',
                { topic: { name: joyTopic.value.name } }
            )
        }
        joyTopic.value = null
    }

    return {
        enabled,
        currentMode,
        currentGear,

        takeOverControl,
        giveUpControl,

        stop,
    }
})
