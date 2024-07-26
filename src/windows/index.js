import { useGstreamerStore } from '@/stores'

import CameraWindow from './CameraWindow.vue'
import ControlWindow from './ControlWindow.vue'
import TestWindow from './TestWindow.vue'
import ThreeDMapWindow from './ThreeDMapWindow.vue'

export default {
    cameraWindow: {
        typeName: 'Camera Window',
        icon: 'mdi-camera-outline',
        component: CameraWindow,
        defaultShape: {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
        },
        configOptions: {
            videoSource: {
                name: 'Video Source',
                type: 'select',
                possibleValues: () => {
                    const gstreamerStore = useGstreamerStore()
                    return Object.keys(gstreamerStore.producers)
                },
            },
        },
    },
    ThreeDMapWindow: {
        typeName: '3D Map Window',
        icon: 'mdi-cube-outline',
        component: ThreeDMapWindow,
        defaultShape: {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
        },
        configOptions: {},
    },
    testWindow: {
        typeName: 'Test Window',
        icon: 'mdi-camera',
        component: TestWindow,
        defaultShape: {
            x: 0,
            y: 0,
            w: 2,
            h: 2,
        },
        configOptions: {
            videoSource: {
                name: 'Video Source',
                type: 'select',
                possibleValues: () => {
                    const gstreamerStore = useGstreamerStore()
                    return Object.keys(gstreamerStore.peers)
                },
            },
            textTest: {
                name: 'Text test',
                type: 'text',
            },
            numberTest: {
                name: 'Number test',
                type: 'number',
            },
            rangeTest: {
                name: 'Range test',
                type: 'range',
                range: () => ({ min: -0.2, max: 5, step: 0.1 }),
            },
            aaaa: {
                name: 'AAAAA',
                type: 'range',
                range: () => ({ min: -0.2, max: 5, step: 0.1 }),
            },
            bbbb: {
                name: 'BBBBBB',
                type: 'boolean',
            },
        },
    },
    controlWindow: {
        typeName: 'Control Window',
        component: ControlWindow,
        icon: 'mdi-controller',
        defaultShape: {
            x: 0,
            y: 0,
            w: 5,
            h: 3,
        },
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
