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
        variant: String,
    },

    computed: {
        style() {
            let outlineColor = {
                drag: '0, 200, 150',
                preview: '0, 180, 200',
            }[this.variant]
            return {
                top: this.positionY + 'px',
                left: this.positionX + 'px',
                height: this.height + 'px',
                width: this.width + 'px',
                '--outline-color': outlineColor,
            }
        },
    },
}
</script>
<style scoped>
.outline {
    position: absolute;

    background-color: rgba(var(--outline-color), 0.2);

    padding: 10px;

    border: 5px solid rgba(var(--outline-color), 1);
    border-radius: 5px;

    /* transition: width 0.1s, height 0.1s, top 0.1s, left 0.1s; */
    transition: width 0.1s, height 0.1s, top 0.05s, left 0.05s;

    box-sizing: border-box;
}
</style>
