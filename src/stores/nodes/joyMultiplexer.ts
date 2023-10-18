import { defineStore } from 'pinia'
import {
    callService,
    onRosConnected,
    useTopicSubscriber,
} from '@/misc/roslibExtensions'
import { computed, ref } from 'vue'
import { useJoyDiffDrive } from '@/stores/nodes/joyDiffDrive'
import { useJoy5dofManipulator } from '@/stores/nodes/joy5dofManipulator'

export interface ITopic {
    name: string
}

export interface IGetTopic {
    topic: ITopic
}

export const useJoyMultiplexer = defineStore('joyMultiplexer', () => {
    const joyDiffDrive = useJoyDiffDrive()
    const joy5dofManipulator = useJoy5dofManipulator()

    const nodeName = 'joy_multiplexer'
    const outputTopics = {
        driving: joyDiffDrive.nodeName,
        manipulator: joy5dofManipulator.nodeName,
    }

    const _joyTopic = ref('__none')
    const _outputTopic = ref('__none')

    const joyTopic = computed({
        get() {
            return _joyTopic.value
        },
        set(newTopic) {
            callService(
                `/${nodeName}/select_joy`,
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
                `/${nodeName}/select_output`,
                'joystick_control/SendTopic',
                { topic: { name: newTopic } }
            )
        },
    })

    onRosConnected(async () => {
        _joyTopic.value = (
            await callService<{}, IGetTopic>(
                `/${nodeName}/get_selected_joy`,
                'joystick_control/GetTopic',
                {}
            )
        ).topic.name
        _outputTopic.value = (
            await callService<{}, IGetTopic>(
                `/${nodeName}/get_selected_output`,
                'joystick_control/GetTopic',
                {}
            )
        ).topic.name
    })

    useTopicSubscriber<ITopic>(
        `/${nodeName}/selected_joy`,
        'joystick_control/Topic',
        (newJoystickTopic) => {
            _joyTopic.value = newJoystickTopic.name
        }
    )
    useTopicSubscriber<ITopic>(
        `/${nodeName}/selected_output`,
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
