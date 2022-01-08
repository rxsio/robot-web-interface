<template>
    <div>
        <DragOutline
            v-if="mainOutline"
            :positionX="mainOutline.x"
            :positionY="mainOutline.y"
            :height="mainOutline.height"
            :width="mainOutline.width"
            :label="mainOutline.data.label"
            variant="drag"
        />
        <DragOutline
            v-for="outline in previewOutlines"
            :key="outline.data.id"
            :positionX="outline.x"
            :positionY="outline.y"
            :width="outline.width"
            :height="outline.height"
            :label="outline.data.label + outline.data.id"
            variant="preview"
        />
    </div>
</template>
<script>
import DragOutline from '@/components/cameras/DragOutline.vue'
import layoutToCoords from '@/components/cameras/layoutToCoords'
export default {
    components: { DragOutline },
    props: {
        layout: Object,
        rect: Object,
        dragState: Object,
    },

    computed: {
        outlines() {
            return layoutToCoords(this.layout, this.rect)
        },
        previewOutlines() {
            return this.outlines.filter((outline) => !outline.data.main)
        },
        mainOutline() {
            const forceMainOutline = this.outlines.find(
                (outline) => outline.data.main
            )
            return (
                forceMainOutline ||
                (this.dragState && {
                    x: this.dragState.x - 50,
                    y: this.dragState.y - 50,
                    height: 100,
                    width: 100,
                    data: this.dragState.data,
                })
            )
        },
    },
}
</script>
