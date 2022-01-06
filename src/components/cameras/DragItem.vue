<template>
    <div class="drag-item" @mousedown="dragStart" @touchdown="dragStart">
        <slot></slot>
    </div>
</template>
<script>
export default {
    props: {
        extraData: Object,
    },

    methods: {
        dragStart(evt) {
            console.log('dragging')
            document.addEventListener('mouseup', this.dragEnd)
            document.addEventListener('touchup', this.dragEnd)

            let event = new CustomEvent('siriusDragStart', {
                detail: {
                    x: evt.x,
                    y: evt.y,
                    data: this.extraData,
                },
            })
            document.dispatchEvent(event)
        },
        dragEnd() {
            console.log('not dragging')
            document.removeEventListener('mouseup', this.dragEnd)
            document.removeEventListener('touchup', this.dragEnd)

            let event = new CustomEvent('siriusDragEnd')
            document.dispatchEvent(event)
        },
    },
}
</script>
<style scoped>
.drag-item {
    user-select: none;
}
</style>
