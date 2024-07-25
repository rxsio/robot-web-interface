import KeyboardControl from '@/components/ControlWindow/KeyboardControl.vue'
import ManipKeyboardControl from '@/components/ControlWindow/ManipKeyboardControl.vue'
import ManipTouchControl from '@/components/ControlWindow/ManipTouchControl.vue'
import PositionSteering from '@/components/ControlWindow/PositionSteering.vue'
import TouchControl from '@/components/ControlWindow/TouchControl.vue'

export default {
    position: PositionSteering,
    velocity: {
        rover: {
            keyboard: KeyboardControl,
            touch: TouchControl,
        },
        manipulator: {
            keyboard: ManipKeyboardControl,
            touch: ManipTouchControl,
        },
    },
}
