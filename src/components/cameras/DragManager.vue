<template>
    <div ref="container" style="height: 300px">
        <DragOutline
            v-if="dragState"
            :positionX="dragState.x"
            :positionY="dragState.y"
            :height="100"
            :width="100"
            :label="dragState.extraData.label"
            variant="drag"
        />
        <OutlineDisplay :layout="currLayout" :rect="rect" />
    </div>
</template>
<script>
import DragOutline from '@/components/cameras/DragOutline.vue'
import OutlineDisplay from '@/components/cameras/OutlineDisplay.vue'
export default {
    components: { DragOutline, OutlineDisplay },
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
            this.dragState = evt.detail

            document.addEventListener('mousemove', this.dragMove)
            document.addEventListener('touchmove', this.dragMove)
        },
        dragMove(evt) {
            this.dragState.x = evt.x
            this.dragState.y = evt.y
        },
        dragEnd() {
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
                [3, 4, 5],
                [6, 7, 8],
            ]
            return sectArray[sectY][sectX]
        },
        currLayout() {
            if (!this.dragState) return { streams: [], variant: 0 }
            let layout = JSON.parse(JSON.stringify(this.layout))
            return layout
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
