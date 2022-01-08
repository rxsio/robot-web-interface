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
        <DragManager
            :ros="ros"
            :host="webSocketHostname"
            :layout="layout"
            @changeLayout="layout = $event"
        />
    </div>
</template>
<script>
import DragItem from '@/components/cameras/DragItem.vue'
import DragManager from '@/components/cameras/DragManager.vue'
import getImageTopics from '@/components/cameras/getImageTopics'
export default {
    components: { DragItem, DragManager },
    name: 'Cameras',

    props: {
        ws_address: String,
        ros: Object,
    },

    data() {
        return {
            layout: {
                streams: [],
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

        getImageTopics(this.ros).then((newTopics) => (this.topics = newTopics))
    },
    beforeDestroy() {
        // Reloading page when going back
        window.location.reload()
    },
}
</script>
