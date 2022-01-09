<template>
    <div class="cameras">
        <TopicList
            :ros="ros"
            :layout="layout"
            @changeLayout="layout = $event"
        />
        <DragManager
            :ros="ros"
            :host="webSocketHostname"
            :layout="layout"
            @changeLayout="layout = $event"
        />
    </div>
</template>
<script>
import DragManager from '@/components/cameras/DragManager.vue'
import TopicList from '@/components/cameras/TopicList.vue'
export default {
    components: { DragManager, TopicList },
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
    },
    beforeDestroy() {
        // Reloading page when going back
        window.location.reload()
    },
}
</script>
<style scoped>
.cameras {
    height: 100vh;
    padding: 10px;

    position: relative;
    display: flex;
    flex-direction: column;

    box-sizing: border-box;
    overflow: hidden;
}
</style>
