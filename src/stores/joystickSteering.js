import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useSteeringStore } from './steering'
import { useRosStore } from './ros'
import { useJoystickStore } from './joystick'

import ROSLIB from 'roslib'
import {
    callService,
    getDynamicReconfigureParameters,
    onRosConnected,
    onRosDisconnected,
    parseDynamicReconfigureConfig,
    setDynamicReconfigureParameters,
    useTopicSubscriber,
} from '@/misc/roslibExtensions'

export const useJoystickSteeringStore = defineStore('joystickSteering', () => {
    const steeringStore = useSteeringStore()
    const rosStore = useRosStore()
    const joystickStore = useJoystickStore()

    const statusTransmitter = ref(null)

    const joyTopic = ref(null)

    const multiplexerOutputs = {
        driving: 'joy_diff_drive',
        manipulator: 'joy_manipulator',
    }
    const drivingModes = ['normal', 'car', 'tank']
    const manipModes = ['forward', 'inverse', 'inverseCylinder']

    const multiplexerStatus = ref({
        joyTopicName: '__none',
        outputTopicName: '__none',
    })
    const drivingConfig = ref({
        mode: 'normal',
        gear: 1,
        gearMaxSpeeds: {
            1: 0.1,
            2: 0.5,
            3: 1.0,
        },
    })
    const manipConfig = ref({
        mode: 'forward',
        gear: 1,
    })

    const enabled = computed(() => {
        if (joyTopic.value)
            return multiplexerStatus.value.joyTopicName === joyTopic.value.name

        return false
    })

    const currentMode = computed(() => {
        if (
            multiplexerStatus.value.outputTopicName ==
            multiplexerOutputs.driving
        )
            return drivingConfig.value.mode
        if (
            multiplexerStatus.value.outputTopicName ==
            multiplexerOutputs.manipulator
        )
            return manipConfig.value.mode

        return '__none'
    })
    const currentGear = computed(() => {
        if (
            multiplexerStatus.value.outputTopicName ==
            multiplexerOutputs.driving
        )
            return drivingConfig.value.gear
        if (
            multiplexerStatus.value.outputTopicName ==
            multiplexerOutputs.manipulator
        )
            return manipConfig.value.gear

        return 0
    })

    useTopicSubscriber(
        '/joy_multiplexer/selected_joy',
        'joystick_control/Topic',
        (newJoystickTopic) =>
            (multiplexerStatus.value.joyTopicName = newJoystickTopic.name)
    )
    useTopicSubscriber(
        '/joy_multiplexer/selected_output',
        'joystick_control/Topic',
        (newOutputTopic) =>
            (multiplexerStatus.value.outputTopicName = newOutputTopic.name)
    )
    useTopicSubscriber(
        '/joy_diff_drive/parameter_updates',
        'dynamic_reconfigure/Config',
        (newConfig) => {
            parseDrivingConfig(parseDynamicReconfigureConfig(newConfig))
        }
    )

    const parseDrivingConfig = (newConfig) => {
        drivingConfig.value = {
            mode: drivingModes[newConfig.mode],
            gear: newConfig.gear,
            gearMaxSpeeds: {
                1: newConfig.gear_1_max_speed,
                2: newConfig.gear_2_max_speed,
                3: newConfig.gear_3_max_speed,
            },
        }
    }

    onRosConnected(async () => {
        parseDrivingConfig(
            await getDynamicReconfigureParameters(
                '/joy_diff_drive/set_parameters'
            )
        )
        multiplexerStatus.value.joyTopicName = (
            await callService(
                '/joy_multiplexer/get_selected_joy',
                'joystick_control/GetTopic',
                {}
            )
        ).topic.name
        multiplexerStatus.value.outputTopicName = (
            await callService(
                '/joy_multiplexer/get_selected_output',
                'joystick_control/GetTopic',
                {}
            )
        ).topic.name
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

    const setMode = async (newMode) => {
        if (drivingModes.includes(newMode)) {
            await callService(
                '/joy_multiplexer/select_output',
                'joystick_control/SendTopic',
                { topic: { name: multiplexerOutputs.driving } }
            )
            await setDynamicReconfigureParameters(
                '/joy_diff_drive/set_parameters',
                { mode: drivingModes.indexOf(newMode) }
            )
        }

        if (manipModes.includes(newMode)) {
            await callService(
                '/joy_multiplexer/select_output',
                'joystick_control/SendTopic',
                { topic: { name: multiplexerOutputs.manipulator } }
            )
        }
    }
    const setGear = async (newGear) => {
        if (
            multiplexerStatus.value.outputTopicName ==
            multiplexerOutputs.driving
        )
            await setDynamicReconfigureParameters(
                '/joy_diff_drive/set_parameters',
                { gear: newGear }
            )

        if (manipModes.includes(currentMode.value)) return
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
        currentMode,
        currentGear,
        enabled,

        setMode,
        setGear,
        takeOverControl,
        giveUpControl,

        drivingModes,
        manipModes,

        stop,
    }
})
