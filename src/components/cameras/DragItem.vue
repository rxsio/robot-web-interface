<template>
    <div class="drag-item" @mousedown="dragStart" @touchdown="dragStart">
        <slot></slot>
    </div>
</template>
<script>
export default {
    props: {
        dragStartCallback: Function,
        updateCurLoc: Function,
    },

    data() {
        return {
            dragging: false,
            startX: null,
            startY: null,
        }
    },

    methods: {
        dragStart(evt) {
            console.log('dragging')
            document.addEventListener('mouseup', this.dragEnd)
            document.addEventListener('mousemove', this.dragMove)
            document.addEventListener('touchup', this.dragEnd)
            document.addEventListener('touchmove', this.dragMove)

            this.dragging = true
            this.updateCurLoc(evt.x, evt.y)
            this.dragStartCallback()
        },
        dragMove(evt) {
            this.updateCurLoc(evt.x, evt.y)
        },
        dragEnd() {
            console.log('not dragging')
            document.removeEventListener('mouseup', this.dragEnd)
            document.removeEventListener('mousemove', this.dragMove)
            document.removeEventListener('touchup', this.dragEnd)
            document.removeEventListener('touchmove', this.dragMove)

            this.dragging = false
            this.updateCurLoc(null, null)
        },
    },
}
</script>
<style scoped>
.drag-item {
    user-select: none;
}
</style>
