<template>
    <div id="mjpeg" class="viewport"></div>
</template>
<script>
export default {
    props: {
        ros: Object,
        webSocketHostname: String,
    },
    data() {
        return {
            videoPort: 8082,
        }
    },
    mounted() {
        // Read video server port
        // Create a Param object for the port
        let portParam = new window.ROSLIB.Param({
            ros: this.ros,
            name: '/web_video_server/port',
        })

        // Get the number of the port
        portParam.get(this.setPort)
    },
    methods: {
        setPort(value) {
            this.videoPort = value
            new window.MJPEGCANVAS.MultiStreamViewer({
                divID: 'mjpeg',
                host: this.webSocketHostname,
                port: this.videoPort,
                width: 640,
                height: 480,
                topics: [
                    '/camera/image_raw',
                    '/sirius/camera/image_raw',
                    '/sirius/camera/image_raw',
                ],
                labels: ['View1', 'View2', 'View3'],
            })
        },
    },
}
</script>
