import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useSteeringStore } from './steering'
import { useRosStore } from './ros'
import { useJoystickStore } from './joystick'

import ROSLIB from 'roslib'
import {
    callService,
    onRosConnected,
    onRosDisconnected,
    useDynamicReconfigure,
    useTopicSubscriber,
} from '@/misc/roslibExtensions'

export const useJoystickSteeringStore = defineStore('joystickSteering', () => {
    const steeringStore = useSteeringStore()
    const rosStore = useRosStore()
    const joystickStore = useJoystickStore()

    const statusTransmitter = ref(null)

    const joyTopic = ref(null)

    // control mode config
    const multiplexerOutputs = {
        driving: 'joy_diff_drive',
        manipulator: 'joy_manipulator',
    }
    const drivingModes = ['normal', 'car', 'tank']
    const manipModes = ['forward', 'inverse', 'inverseCylinder']

    // control node state
    const multiplexerStatus = ref({
        joyTopicName: '__none',
        outputTopicName: '__none',
    })
    const drivingConfig = useDynamicReconfigure('joy_diff_drive')
    const manipConfig = ref({
        mode: 'forward',
        gear: 1,
    })

    const enabled = computed(() => {
        if (joyTopic.value)
            return multiplexerStatus.value.joyTopicName === joyTopic.value.name

        return false
    })

    const drivingGear = computed({
        get() {
            return drivingConfig.value.gear || 0
        },
        set(newGear) {
            drivingConfig.value.gear = newGear
        },
    })
    const drivingGearMaxSpeed = computed({
        get() {
            let configName = `gear_${drivingGear.value}_max_speed`
            if (drivingGear.value) return drivingConfig.value[configName]
            else return 0
        },
        set(newGearMaxSpeed) {
            let configName = `gear_${drivingGear.value}_max_speed`
            if (drivingGear.value)
                drivingConfig.value[configName] = newGearMaxSpeed
        },
    })
    const manipGear = computed(() => manipConfig.value.gear)
    const currentMode = computed({
        get() {
            if (
                multiplexerStatus.value.outputTopicName ==
                multiplexerOutputs.driving
            )
                return drivingModes[drivingConfig.value.mode]
            if (
                multiplexerStatus.value.outputTopicName ==
                multiplexerOutputs.manipulator
            )
                return manipConfig.value.mode

            return '__none'
        },
        set(newMode) {
            ;(async () => {
                if (drivingModes.includes(newMode)) {
                    await callService(
                        '/joy_multiplexer/select_output',
                        'joystick_control/SendTopic',
                        { topic: { name: multiplexerOutputs.driving } }
                    )
                    drivingConfig.value.mode = drivingModes.indexOf(newMode)
                }

                if (manipModes.includes(newMode)) {
                    await callService(
                        '/joy_multiplexer/select_output',
                        'joystick_control/SendTopic',
                        { topic: { name: multiplexerOutputs.manipulator } }
                    )
                }
            })()
        },
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

    // topic listeners to detect node state updates
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

    onRosConnected(async () => {
        // get initial node state, without waiting for an update
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
        drivingGear,
        drivingGearMaxSpeed,
        manipGear,

        takeOverControl,
        giveUpControl,

        drivingModes,
        manipModes,

        stop,
    }
})
