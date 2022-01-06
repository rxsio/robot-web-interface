<template>
    <div class="cameras">
        <DragItem :extraData="{ topic: 'test', label: 'Test' }">
            <div style="background-color: green">Text</div>
        </DragItem>
        <DragItem
            v-for="topic in topics"
            :key="topic"
            :extraData="{ topic, label: topic }"
        >
            <div style="background-color: green">{{ topic }}</div>
        </DragItem>
        <DragManager :layout="layout" @changeLayout="layout = $event" />
        <!-- <VideoStream :ros="ros" :webSocketHostname="webSocketHostname" /> -->
    </div>
</template>
<script>
import DragItem from '@/components/cameras/DragItem.vue'
import DragManager from '@/components/cameras/DragManager.vue'
//import VideoStream from '@/components/cameras/VideoStream.vue'
//import getImageTopics from '@/components/cameras/getImageTopics'
export default {
    components: { DragItem, DragManager /*VideoStream*/ },
    name: 'Cameras',

    props: {
        ws_address: String,
        ros: Object,
    },

    data() {
        return {
            layout: {
                streams: [
                    { topic: 'video1', label: 'video1', id: 0 },
                    { topic: 'video2', label: 'video2', id: 1 },
                    { topic: 'video3', label: 'video3', id: 2 },
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

        /*
        getImageTopics(`http://${this.webSocketHostname}:8082`).then(
            (newTopics) => (this.topics = newTopics)
        )
        */
    },
    beforeDestroy() {
        // Reloading page when going back
        window.location.reload()
    },
}
</script>
