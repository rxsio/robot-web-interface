import { defineStore } from 'pinia'
import {
    callService,
    onRosConnected,
    useTopicSubscriber,
} from '@/misc/roslibExtensions'
import { computed, ref } from 'vue'

export const useJoyMultiplexer = defineStore('joyMultiplexer', () => {
    const outputTopics = {
        driving: 'joy_diff_drive',
        manipulator: 'joy_manipulator',
    }

    const _joyTopic = ref('__none')
    const _outputTopic = ref('__none')

    const joyTopic = computed({
        get() {
            return _joyTopic.value
        },
        set(newTopic) {
            callService(
                '/joy_multiplexer/select_joy',
                'joystick_control/SendTopic',
                { topic: { name: newTopic } }
            )
        },
    })
    const outputTopic = computed({
        get() {
            return _outputTopic.value
        },
        set(newTopic) {
            callService(
                '/joy_multiplexer/select_output',
                'joystick_control/SendTopic',
                { topic: { name: newTopic } }
            )
        },
    })

    onRosConnected(async () => {
        _joyTopic.value = (
            await callService(
                '/joy_multiplexer/get_selected_joy',
                'joystick_control/GetTopic',
                {}
            )
        ).topic.name
        _outputTopic.value = (
            await callService(
                '/joy_multiplexer/get_selected_output',
                'joystick_control/GetTopic',
                {}
            )
        ).topic.name
    })

    useTopicSubscriber(
        '/joy_multiplexer/selected_joy',
        'joystick_control/Topic',
        (newJoystickTopic) => {
            _joyTopic.value = newJoystickTopic.name
        }
    )
    useTopicSubscriber(
        '/joy_multiplexer/selected_output',
        'joystick_control/Topic',
        (newOutputTopic) => {
            _outputTopic.value = newOutputTopic.name
        }
    )

    return {
        joyTopic,
        outputTopic,
        outputTopics,
    }
})
