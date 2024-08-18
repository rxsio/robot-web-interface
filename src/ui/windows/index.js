import { useGStreamerStore } from '@/stores'

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
        configOptions: {
            videoSource: {
                name: 'Video Source',
                type: 'select',
                possibleValues: () => {
                    const gstreamerStore = useGStreamerStore()
                    return Object.keys(gstreamerStore.producers)
                },
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
    controlWindow: {
        typeName: 'Control Window',
        component: ControlWindow,
        icon: 'mdi-controller',
        defaultShape: {
            w: 5,
            h: 20,
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
