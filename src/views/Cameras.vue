<template>
    <div class="cameras">
        <DragOutline
            :positionX="outlinePos.x"
            :positionY="outlinePos.y"
            :height="outlinePos.height"
            :width="outlinePos.width"
        />
        <div></div>
        <div id="mjpeg" class="viewport"></div>
    </div>
</template>
<script>
import DragOutline from '@/components/cameras/DragOutline.vue'
export default {
    components: { DragOutline },
    name: 'Cameras',

    props: {
        ws_address: String,
        ros: Object,
    },

    data() {
        return {
            port: 8082,
            Ros: this.ros,
            animInterval: null,
            animState: 0,
            outlinePos: {
                x: 100,
                y: 100,
                height: 100,
                width: 100,
            },
        }
    },

    computed: {
        video_address() {
            return this.ws_address.slice(5, -5)
        },
    },

    mounted() {
        // If ROS got disconnected, return to home
        if (this.ros == null) {
            this.$router.push({
                name: 'Home',
            })
        }

        // Read vidoe server port
        // Create a Param object for the port
        var portParam = new window.ROSLIB.Param({
            ros: this.Ros,
            name: '/web_video_server/port',
        })

        // Get the number of the port
        portParam.get(this.setPort)

        // testing the outline animations
        this.animInterval = setInterval(() => {
            switch (this.animState) {
                case 0:
                    this.outlinePos = {
                        x: 100,
                        y: 100,
                        height: 100,
                        width: 100,
                    }
                    break
                case 1:
                    this.outlinePos = {
                        x: 1000,
                        y: 300,
                        height: 50,
                        width: 200,
                    }
                    break
                case 2:
                    this.outlinePos = {
                        x: 0,
                        y: 0,
                        height: 1080,
                        width: 1920,
                    }
                    break
            }
            this.animState++
            this.animState %= 3
        }, 500)
    },
    methods: {
        setPort(value) {
            this.port = value
            new window.MJPEGCANVAS.MultiStreamViewer({
                divID: 'mjpeg',
                host: this.video_address,
                port: this.port,
                width: 640,
                height: 480,
                topics: [
                    '/sirius/camera/image_raw',
                    '/sirius/camera/image_raw',
                    '/sirius/camera/image_raw',
                ],
                labels: ['View1', 'View2', 'View3'],
            })
        },
    },
    beforeDestroy() {
        // Reloading page when going back
        window.location.reload()

        clearInterval(this.animInterval)
    },
}
</script>
