<template>
    <div ref="container" style="height: 600px">
        <OutlineDisplay
            :layout="currLayout"
            :rect="rect"
            :dragState="dragState"
        />
        <VideoDisplay :layout="layout" :rect="rect" />
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
            if (evt.detail.data.removeIndex !== undefined) {
                this.$emit(
                    'changeLayout',
                    removeFromLayout(this.layout, evt.detail.data.removeIndex)
                )
                delete evt.detail.data.removeIndex
            }
            this.dragState = evt.detail
            this.dragState.data.main = true
            this.dragState.data.id =
                Math.max(...this.layout.streams.map((stream) => stream.id)) + 1

            document.addEventListener('mousemove', this.dragMove)
            document.addEventListener('touchmove', this.dragMove)
        },
        dragMove(evt) {
            this.dragState.x = evt.x
            this.dragState.y = evt.y
        },
        dragEnd() {
            this.currLayout.streams.forEach((stream) => delete stream.main)
            this.$emit('changeLayout', this.currLayout)
            this.dragState = null

            document.removeEventListener('mousemove', this.dragMove)
            document.removeEventListener('touchmove', this.dragMove)
        },
        updateRect() {
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
            if (!this.dragState) return { streams: [], variant: 0 }
            if (this.cursorSector !== -1) {
                return addToLayout(
                    this.layout,
                    this.dragState.data,
                    this.cursorSector
                )
            }
            return this.layout
        },
    },

    updated() {
        /*console.log(JSON.parse(JSON.stringify(this.layout)))
        console.log(JSON.parse(JSON.stringify(this.currLayout)))
        console.log(this.cursorSector)*/
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
