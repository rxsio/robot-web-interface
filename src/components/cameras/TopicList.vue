<template>
    <div class="container">
        <DragItem :extraData="{ topic: 'test', label: 'Test' }">
            <div class="list-element" style="background-color: pink">Test</div>
        </DragItem>
        <DragItem
            v-for="topic in topics"
            :key="topic"
            :extraData="{ topic, label: topic }"
        >
            <div class="list-element">{{ topic }}</div>
        </DragItem>
    </div>
</template>
<script>
import getImageTopics from '@/components/cameras/getImageTopics'
import DragItem from '@/components/cameras/DragItem'
export default {
    components: { DragItem },
    props: {
        ros: Object, // should be a global
    },
    data() {
        return {
            topics: [],
        }
    },
    mounted() {
        getImageTopics(this.ros).then((newTopics) => (this.topics = newTopics))
    },
}
</script>
<style scoped>
.container {
    display: flex;
    flex-direction: row;
}
.list-element {
    margin: 10px;
    background-color: lightblue;
    padding: 10px;
}
</style>
