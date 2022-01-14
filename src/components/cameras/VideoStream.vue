<template>
    <div
        :style="{
            left: stream.x + 'px',
            top: stream.y + 'px',
            width: stream.width + 'px',
            height: stream.height + 'px',
            'background-color': 'black',
            position: 'absolute',
        }"
    >
        <canvas ref="viewer" />
    </div>
</template>
<script>
export default {
    props: {
        ros: Object, // should be a global
        host: String, // should be a global
        stream: Object,
    },
    data() {
        return {
            videoPort: 8082,
            refreshRate: 10,
            image: null,
            drawIntervalHandle: null,
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
        portParam.get(this.initViewer)
    },
    beforeDestroy() {
        this.cleanViewer()
    },
    computed: {
        dimensions() {
            const aspectRatio = 640 / 480
            let { width, height } = this.stream

            // room for the border
            width -= 10
            height -= 10

            // calculate dimensions for maxed width or height
            let maxWidth = {
                width,
                height: width / aspectRatio,
            }
            let maxHeight = {
                width: height * aspectRatio,
                height,
            }

            // choose the one that will fit
            if (this.stream.height < maxWidth.height) {
                return maxHeight
            } else {
                return maxWidth
            }
        },
    },
    methods: {
        initViewer(port) {
            let drawInterval = (1 / this.refreshRate) * 1000

            this.image = new Image()
            let src = `http://${this.host}:${port}/stream?topic=${this.stream.data.topic}&type=ros_compressed&width=640&height=480`
            this.image.src = src

            this.drawIntervalHandle = setInterval(this.draw, drawInterval)
        },
        cleanViewer() {
            this.image.src = ''
            clearInterval(this.drawIntervalHandle)
        },
        draw() {
            let canvas = this.$refs.viewer
            canvas.width = this.stream.width
            canvas.height = this.stream.height
            let context = canvas.getContext('2d')
            // clear the canvas
            context.clearRect(0, 0, canvas.width, canvas.height)

            // check if we have a valid image
            if (this.image.width * this.image.height > 0) {
                // draw the image
                context.drawImage(
                    this.image,
                    (this.stream.width - this.dimensions.width) / 2 - 5,
                    (this.stream.height - this.dimensions.height) / 2 - 5,
                    this.dimensions.width,
                    this.dimensions.height
                )
            } else {
                // show a diconnected warning
                context.textAlign = 'center'
                context.font = '30px monospace'
                context.fillStyle = 'red'
                context.fillText(
                    'Disconnected',
                    this.stream.width / 2 - 5,
                    this.stream.height / 2 - 5
                )
            }

            // display the video label in the corner
            context.textAlign = 'left'
            context.font = '20px monospace'
            context.fillStyle = 'white'
            context.strokeStyle = 'black'
            context.lineWidth = 5
            context.strokeText(this.stream.data.label, 20, 40)
            context.fillText(this.stream.data.label, 20, 40)
        },
    },
}
</script>
<style scoped></style>
