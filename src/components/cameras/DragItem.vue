<template>
    <div class="drag-item" @mousedown="dragStart" @touchstart="dragStart">
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
            document.addEventListener('mouseup', this.dragEnd)
            document.addEventListener('touchend', this.dragEnd)

            let event = new CustomEvent('siriusDragStart', {
                detail: {
                    x: evt.clientX || evt.targetTouches[0].pageX,
                    y: evt.clientY || evt.targetTouches[0].pageY,
                    data: JSON.parse(JSON.stringify(this.extraData)),
                },
            })
            document.dispatchEvent(event)
        },
        dragEnd() {
            document.removeEventListener('mouseup', this.dragEnd)
            document.removeEventListener('touchend', this.dragEnd)

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
