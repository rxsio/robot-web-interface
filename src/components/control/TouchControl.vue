<template>
  <div style="padding-top: 33vh;">
    <joystick :size="250" :callback="this.joystickMovedCallback"/>
  </div>
</template>
<script>
    import Joystick from "@/components/control/Joystick.vue"

    export default {
      name: "TouchControl",
      components: {
        Joystick,
      },
      props: {
          'ws_address': String,
          'ros': Object,
      },
      data () {
        return {
          topic: null,
        }
      },
      methods: {
        joystickMovedCallback(stickData) {
          console.log(stickData);
          var message = new window.ROSLIB.Message({
            linear : {
              x : parseFloat(stickData.y),
              y : 0,
              z : 0
            },
            angular : {
              x : 0,
              y : 0,
              z : parseFloat(stickData.x)
            }
          });
          this.topic.publish(message);
        }
      },
      mounted() {
        this.topic = new window.ROSLIB.Topic({
        ros : this.ros,
        name : '/cmd_vel',
        messageType : 'geometry_msgs/Twist'
        });
      },
    };
</script>
