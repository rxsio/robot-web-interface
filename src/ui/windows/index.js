import { Modes, useGStreamerStore, useRosStore } from '@/stores'
import ServiceWindow from '@/ui/windows/ServiceWindow.vue'
import TopicListenerWindow from '@/ui/windows/TopicListenerWindow.vue'

import CameraWindow from './CameraWindow.vue'
import ControlWindow from './ControlWindow.vue'

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
        barControls: [],
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
        barControls: [],
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
    controlWindow: {
        typeName: 'Control Window',
        component: ControlWindow,
        icon: 'mdi-controller',
        defaultShape: {
            w: 5,
            h: 20,
        },
        barControls: [],
        configOptions: {
            movementStrategy: {
                name: 'Movement Strategy',
                type: 'select',
                possibleValues: () => {
                    return ['Position', 'Velocity']
                },
            },
            controlledObject: {
                name: 'Controlled Object',
                type: 'select',
                possibleValues: () => {
                    return ['Rover', 'Manipulator']
                },
            },
            controlMode: {
                name: 'Control Mode',
                type: 'select',
                possibleValues: () => {
                    return ['Keyboard', 'Touch']
                },
            },
            maxLinearSpeed: {
                name: 'Max Linear Velocity [m/s]',
                type: 'number',
            },
            maxAngularSpeed: {
                name: 'Max Angular Velocity [rad/s]',
                type: 'number',
            },
            maxEffort: {
                name: 'Max Effort [Nm]',
                type: 'number',
            },
            shapeCoefficient: {
                name: 'Shape Coefficient (1.0 - linear)',
                type: 'number',
            },
            deadzone: {
                name: 'Deadzone (0 - 1)',
                type: 'number',
            },
            inertia: {
                name: 'Inertia (0 - 1)',
                type: 'number',
            },
        },
    },
}
