<template>
    <div>
        <DragItem
            v-for="(stream, index) in streams"
            :key="stream.data.id"
            :extraData="{ ...stream.data, removeIndex: index }"
        >
            <div
                :style="{
                    left: stream.x + 'px',
                    top: stream.y + 'px',
                    width: stream.width + 'px',
                    height: stream.height + 'px',
                    'background-color': 'lightgray',
                    border: '5px solid black',
                    position: 'absolute',
                    'box-sizing': 'border-box',
                }"
            >
                {{ stream.data.topic }}
            </div>
        </DragItem>
    </div>
</template>
<script>
import layoutToCoords from '@/components/cameras/layoutToCoords'
import DragItem from '@/components/cameras/DragItem.vue'
export default {
    components: {
        DragItem,
    },
    props: {
        layout: Object,
        rect: Object,
    },

    computed: {
        streams() {
            return layoutToCoords(this.layout, this.rect)
        },
    },
}
</script>
