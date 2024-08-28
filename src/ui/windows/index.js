import { Modes, useGStreamerStore, useRosStore } from '@/stores'
import ServiceWindow from '@/ui/windows/ServiceWindow/ServiceWindow.vue'
import TopicListenerWindow from '@/ui/windows/TopicListenerWindow.vue'
import VirtualJoystickWindow from '@/ui/windows/VirtualJoystickWindow/VirtualJoystickWindow.vue'

import CameraWindow from './CameraWindow.vue'

export default {
    cameraWindow: {
        typeName: 'Camera Window',
        icon: 'mdi-camera-outline',
        component: CameraWindow,
        defaultShape: {
            w: 2,
            h: 15,
        },
        barControls: [
            {
                id: 'reload',
                name: 'Reload',
                icon: 'mdi-reload',
                mode: () => Modes.Normal,
            },
        ],
        configOptions: {
            videoSource: {
                name: 'Video Source',
                type: 'select',
                possibleValues: () => {
                    const gstreamerStore = useGStreamerStore()
                    return Object.keys(gstreamerStore.producers)
                },
            },
            contrast: {
                name: 'High Contrast',
                type: 'boolean',
            },
            overlay: {
                name: 'Overlay',
                type: 'boolean',
            },
            controls: {
                name: 'Controls',
                type: 'boolean',
            },
        },
    },
    topicListenerWindow: {
        typeName: 'Topic Listener Window',
        component: TopicListenerWindow,
        icon: 'mdi-eye-outline',
        defaultShape: {
            w: 4,
            h: 15,
        },
        barControls: [
            {
                id: 'reload',
                name: 'Reload',
                icon: 'mdi-reload',
                mode: () => Modes.Normal,
            },
        ],
        configOptions: {
            topic: {
                name: 'Topic',
                type: 'select',
                possibleValues: () => {
                    const rosStore = useRosStore()
                    return Object.keys(rosStore.topics)
                },
            },
        },
    },
    serviceWindow: {
        typeName: 'Service Window',
        component: ServiceWindow,
        icon: 'mdi-broadcast',
        defaultShape: {
            w: 4,
            h: 15,
        },
        barControls: [
            {
                id: 'reload',
                name: 'Reload',
                icon: 'mdi-reload',
                mode: () => Modes.Normal,
            },
        ],
        configOptions: {
            service: {
                name: 'Service',
                type: 'select',
                possibleValues: () => {
                    const rosStore = useRosStore()
                    return rosStore.services
                },
            },
        },
    },
    virtualJoystickWindow: {
        typeName: 'Virtual Joystick',
        component: VirtualJoystickWindow,
        icon: 'mdi-controller',
        defaultShape: {
            w: 5,
            h: 20,
        },
        barControls: [],
        configOptions: {},
    },
}
