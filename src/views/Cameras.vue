<template>
    <div class="cameras">
        <div>
        </div>
        <div id="mjpeg" class="viewport"></div>
    </div>
</template>
<script>
    export default {
        name: "Cameras",
        
        props: {
            'ws_address': String,
            'ros': Object,
        },

        data () {
          return {
          port: 8082,
          Ros: this.ros,
          };
        },

        computed: {
          video_address() {
          return this.ws_address.slice(5, -5);
          },
        },

        mounted() {
          // If ROS got disconnected, return to home
          if (this.ros==null) {
            this.$router.push({
              name: "Home",
            });
          }

          // Read vidoe server port
          // Create a Param object for the port
          var portParam = new window.ROSLIB.Param({
            ros : this.Ros,
            name :  '/web_video_server/port'
          });

          // Get the number of the port
          portParam.get(this.setPort);
        },
        methods: {
          setPort(value) {
            this.port = value;
            new window.MJPEGCANVAS.MultiStreamViewer({
            divID : 'mjpeg',
            host : this.video_address,
            port : this.port,
            width : 640,
            height : 480,
            topics : [ '/sirius/camera/image_raw', '/sirius/camera/image_raw',
              '/sirius/camera/image_raw' ],
            labels : [ 'View1', 'View2', 'View3' ]
            });
          },
        },
        beforeDestroy() {
          // Reloading page when going back
          window.location.reload();
        },
    };
</script>
