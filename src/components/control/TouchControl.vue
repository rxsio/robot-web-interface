<template>
  <div style="padding-top: 25vh;">
    <joystick :size="250" :callback="this.joystickMovedCallback"/>
    <div class="slidecontainer">
      <input type="range" min="1" max="100" value="50" class="slider" id="linear_speed" v-model="linear_speed_percentage">
      <label class="sliderLabel"> Linear: {{this.linear_speed_percentage}}%</label>
    </div>
    <div class="slidecontainer">
      <input type="range" min="1" max="100" value="50" class="slider" id="angular_speed" v-model="angular_speed_percentage">
      <label class="sliderLabel"> Angular: {{this.angular_speed_percentage}}%</label>
    </div>
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
          message: null,
          commandInterval: null,
          max_linear_speed: 1,
          max_angular_speed: 1.57,
          linear_speed_percentage: 25,
          angular_speed_percentage: 25,
        }
      },
      methods: {
        joystickMovedCallback(stickData) {
          this.message.linear.x = parseFloat(stickData.y) * this.max_linear_speed * 0.01 * this.linear_speed_percentage,
          this.message.angular.z = -parseFloat(stickData.x) * this.max_angular_speed * 0.01 * this.angular_speed_percentage
        }
      },
      mounted() {
        this.topic = new window.ROSLIB.Topic({
        ros : this.ros,
        name : '/cmd_vel',
        messageType : 'geometry_msgs/Twist'
        });

        this.message = new window.ROSLIB.Message({
            linear : {
              x : 0,
              y : 0,
              z : 0
            },
            angular : {
              x : 0,
              y : 0,
              z : 0
            }
          });

        // Start sending messages to cmd_vel (10Hz)
        var self = this;
        this.commandInterval = window.setInterval(function(){
          self.topic.publish(self.message);
        }, 100)

        // Read previous percentage settings
        if (this.$cookies.isKey('linear-speed-percentage')) {
          this.linear_speed_percentage = this.$cookies.get('linear-speed-percentage');
          this.angular_speed_percentage = this.$cookies.get('angular-speed-percentage');
        }

        // Read maximum speed from ros params
        var base = "/web_interface/control"
        var maxLinearSpeedParam = new window.ROSLIB.Param({
          ros : this.ros,
          name :  base + '/linear/x/max_velocity'
        });
        maxLinearSpeedParam.get((value) => {
          console.log(value)
          if (value != null) {
            this.max_linear_speed = value;
          }
        });
        var maxAngularSpeedParam = new window.ROSLIB.Param({
          ros : this.ros,
          name :  base + '/angular/z/max_velocity'
        });
        maxAngularSpeedParam.get((value) => {
          console.log(value)
          if (value != null) {
            this.max_angular_speed = value;
          }
        });
      },
      beforeDestroy() {
        clearInterval(this.commandInterval)
        this.$cookies.set('linear-speed-percentage', this.linear_speed_percentage);
        this.$cookies.set('angular-speed-percentage', this.angular_speed_percentage);
        },
    };
</script>
