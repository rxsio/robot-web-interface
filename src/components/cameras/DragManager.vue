<template>
    <div ref="container" class="container">
        <OutlineDisplay
            :layout="currLayout"
            :rect="rect"
            :dragState="dragState"
        />
        <VideoDisplay :ros="ros" :host="host" :layout="layout" :rect="rect" />
    </div>
</template>
<script>
import OutlineDisplay from '@/components/cameras/OutlineDisplay.vue'
import VideoDisplay from '@/components/cameras/VideoDisplay.vue'
import {
    addToLayout,
    removeFromLayout,
} from '@/components/cameras/transformLayout'
export default {
    components: { OutlineDisplay, VideoDisplay },
    props: {
        ros: Object, // should be a global
        host: String, // should be a global
        layout: Object,
    },

    data() {
        return {
            dragState: null,
            rect: null,
        }
    },

    methods: {
        dragStart(evt) {
            const newStream = evt.detail
            // handle removing videos that were dragged out of the layout
            if (newStream.data.removeIndex !== undefined) {
                this.$emit(
                    'changeLayout',
                    removeFromLayout(this.layout, newStream.data.removeIndex)
                )
                delete newStream.data.removeIndex
            }
            // set the current stream as the main one (for the special outline)
            newStream.data.main = true
            // generate new id to avoid collisions
            newStream.data.id =
                Math.max(0, ...this.layout.streams.map((stream) => stream.id)) +
                1
            this.dragState = newStream

            document.addEventListener('mousemove', this.dragMove)
            document.addEventListener('touchmove', this.dragMove)
        },
        dragMove(evt) {
            this.dragState.x = evt.clientX || evt.targetTouches[0].pageX
            this.dragState.y = evt.clientY || evt.targetTouches[0].pageY
        },
        dragEnd() {
            // remove all special outlines
            this.currLayout.streams.forEach((stream) => delete stream.main)
            // confirm the created layout
            this.$emit('changeLayout', this.currLayout)
            this.dragState = null

            document.removeEventListener('mousemove', this.dragMove)
            document.removeEventListener('touchmove', this.dragMove)
        },
        updateRect() {
            // returns the current shape of the manager
            if (!this.$refs.container) return null
            let rect = this.$refs.container.getBoundingClientRect()
            this.rect = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
            }
        },
        relativeCursorLoc() {
            if (this.dragState === null) return { x: null, y: null }

            return {
                x: (this.dragState.x - this.rect.x) / this.rect.width,
                y: (this.dragState.y - this.rect.y) / this.rect.height,
            }
        },
    },

    computed: {
        cursorSector() {
            // determines which 1/9th of the manager is hovered over
            if (!this.dragState) return -2
            let isCursorOver =
                this.dragState &&
                document
                    .elementsFromPoint(this.dragState.x, this.dragState.y)
                    .includes(this.$refs.container)
            if (!isCursorOver) return -1

            let relativeLoc = this.relativeCursorLoc()
            let valueTo1dSector = (val) => {
                if (val < 0.3) return 0
                if (val > 0.7) return 2
                return 1
            }
            let sectX = valueTo1dSector(relativeLoc.x)
            let sectY = valueTo1dSector(relativeLoc.y)
            const sectArray = [
                [0, 1, 2],
                [7, 8, 3],
                [6, 5, 4],
            ]
            return sectArray[sectY][sectX]
        },
        currLayout() {
            // creates the new layout based on current drag state and cursor position

            // TO FIX: refreshes increadibly frequently, even though it doesn't need to
            if (this.cursorSector === -2) return { streams: [], variant: 0 }
            if (this.cursorSector === -1) return this.layout
            return addToLayout(
                this.layout,
                this.dragState.data,
                this.cursorSector
            )
        },
    },

    mounted() {
        document.addEventListener('siriusDragStart', this.dragStart)
        document.addEventListener('siriusDragEnd', this.dragEnd)

        window.addEventListener('resize', this.updateRect)
        this.updateRect()
    },

    beforeDestroy() {
        document.removeEventListener('siriusDragStart', this.dragStart)
        document.removeEventListener('siriusDragEnd', this.dragEnd)

        window.removeEventListener('resize', this.updateRect)
    },
}
</script>
<style scoped>
.container {
    user-select: none;
    flex-grow: 1;
}
</style>
