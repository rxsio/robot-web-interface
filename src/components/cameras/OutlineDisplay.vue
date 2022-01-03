<template>
    <div ref="container">
        <DragOutline
            v-for="outline in outlines"
            :key="outline.data.id"
            :positionX="outline.x"
            :positionY="outline.y"
            :width="outline.width"
            :height="outline.height"
            :label="outline.data.id"
            variant="preview"
        />
    </div>
</template>
<script>
import DragOutline from '@/components/cameras/DragOutline.vue'
export default {
    components: { DragOutline },
    props: {
        layout: Object,
        rect: Object,
    },

    computed: {
        outlines() {
            let outlineData = this.layout.streams
            let variant = this.layout.variant

            // get all coordinates and mid points
            let rect = this.rect
            if (!rect) return []
            let x = [rect.x, rect.x + rect.width / 2]
            let y = [rect.y, rect.y + rect.height / 2]
            let width = [rect.width / 2, rect.width]
            let height = [rect.height / 2, rect.height]

            // definitions of all possible shapes
            // indexes mean which versions to choose of: x, y, width, height
            const outlineShapes = {
                full: [0, 0, 1, 1],
                top: [0, 0, 1, 0],
                bottom: [0, 1, 1, 0],
                left: [0, 0, 0, 1],
                right: [1, 0, 0, 1],
                topLeft: [0, 0, 0, 0],
                topRight: [1, 0, 0, 0],
                bottomLeft: [0, 1, 0, 0],
                bottomRight: [1, 1, 0, 0],
            }

            const layoutMap = {
                0: { 0: [] },
                1: { 0: ['full'] },
                2: {
                    0: ['left', 'right'],
                    1: ['top', 'bottom'],
                },
                3: {
                    0: ['left', 'topRight', 'bottomRight'],
                    1: ['top', 'bottomRight', 'bottomLeft'],
                    2: ['right', 'bottomLeft', 'topLeft'],
                    3: ['bottom', 'topLeft', 'topRight'],
                },
                4: {
                    0: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
                },
            }[outlineData.length][variant]

            return outlineData.map((streamData, index) => {
                let shape = outlineShapes[layoutMap[index]]
                return {
                    x: x[shape[0]],
                    y: y[shape[1]],
                    width: width[shape[2]],
                    height: height[shape[3]],
                    data: streamData,
                }
            })
        },
    },
}
</script>
