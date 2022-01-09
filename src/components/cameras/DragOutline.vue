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
            const options = {
                drag: {
                    outlineColor: '0, 200, 150',
                    zIndex: 1001,
                },
                preview: {
                    outlineColor: '0, 180, 200',
                    zIndex: 1000,
                },
            }[this.variant]
            return {
                top: this.positionY + 'px',
                left: this.positionX + 'px',
                height: this.height + 'px',
                width: this.width + 'px',
                '--outline-color': options.outlineColor,
                '--z-index': options.zIndex,
            }
        },
    },
}
</script>
<style scoped>
.outline {
    position: absolute;
    z-index: var(--z-index);

    background-color: rgba(var(--outline-color), 0.2);

    padding: 10px;

    border: 5px solid rgba(var(--outline-color), 1);
    border-radius: 5px;

    /*transition: width 0.2s, height 0.2s, top 0.2s, left 0.2s;*/
    transition: width 0.1s, height 0.1s, top 0.05s, left 0.05s;

    box-sizing: border-box;
}
</style>
