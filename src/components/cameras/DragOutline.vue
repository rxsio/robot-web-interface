<template>
    <div :style="style" class="outline"></div>
</template>
<script>
export default {
    name: 'DragOutline',

    props: {
        positionX: Number,
        positionY: Number,
        width: Number,
        height: Number,
    },

    computed: {
        style() {
            return {
                top: this.positionY + 'px',
                left: this.positionX + 'px',
                height: this.height + 'px',
                width: this.width + 'px',
            }
        },
    },
}
</script>
<style scoped>
.outline {
    position: absolute;

    border: 5px solid rgba(0, 200, 150, 1);
    background-color: rgba(0, 200, 150, 0.2);
    border-radius: 5px;

    transition: width 0.5s, height 0.5s, top 0.5s, left 0.5s;
}
</style>
