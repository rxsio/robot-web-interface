<template>
    <div class="cameras">
        <DragItem :extraData="{ target: 'test', label: 'Test' }">
            <div style="background-color: green">Text</div>
        </DragItem>
        <DragItem
            v-for="topic in topics"
            :key="topic"
            :extraData="{ topic, label: topic }"
        >
            <div style="background-color: green">{{ topic }}</div>
        </DragItem>
        <DragManager :layout="layout" />
        <VideoStream :ros="ros" :webSocketHostname="webSocketHostname" />
    </div>
</template>
<script>
import DragItem from '@/components/cameras/DragItem.vue'
import DragManager from '@/components/cameras/DragManager.vue'
import VideoStream from '@/components/cameras/VideoStream.vue'
import getImageTopics from '@/components/cameras/getImageTopics'
export default {
    components: { DragItem, DragManager, VideoStream },
    name: 'Cameras',

    props: {
        ws_address: String,
        ros: Object,
    },

    data() {
        return {
            layout: {
                streams: [
                    { id: 'video1', label: 'test1' },
                    { id: 'video2', label: 'test2' },
                    { id: 'video3', label: 'test3' },
                ],
                variant: 0,
            },
            topics: [],
        }
    },

    computed: {
        webSocketHostname() {
            return new URL(this.ws_address).hostname
        },
    },

    mounted() {
        // If ROS got disconnected, return to home
        if (this.ros == null) {
            this.$router.push({
                name: 'Home',
            })
        }

        getImageTopics(`http://${this.webSocketHostname}:8082`).then(
            (newTopics) => (this.topics = newTopics)
        )
    },
    beforeDestroy() {
        // Reloading page when going back
        window.location.reload()
    },
}
</script>
