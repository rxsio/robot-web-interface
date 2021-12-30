<template>
    <div :style="style" class="outline">
        {{ label }}
    </div>
</template>
<script>
export default {
    name: 'DragOutline',

    props: {
        positionX: Number,
        positionY: Number,
        width: Number,
        height: Number,
        label: String,
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

    background-color: rgba(0, 200, 150, 0.2);

    padding: 10px;

    border: 5px solid rgba(0, 200, 150, 1);
    border-radius: 5px;

    transition: width 0.1s, height 0.1s, top 0.1s, left 0.1s;

    box-sizing: border-box;
}
</style>
