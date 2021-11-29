<template>
    <div class="control">
        <h1>This is the control page.</h1>
        <div>
            <label>
                Connected to {{this.ws_address}}
            </label>
            <label>
                Gamepad API supported: {{this.gamepadAPIallowed}}
            </label>
            <label>
                Gamepads: {{JSON.stringify(this.gamepads)}}
            </label>
            <label>
            </label>
        </div>
    </div>
</template>
<script>
    export default {
        name: "Control",
        
        props: {
            'ws_address': String,
            'ros': Object,
        },

        data ()  {
          return {
            gamepadAPIallowed: (navigator.getGamepads != null),
            gamepads: (navigator.getGamepads()),
          }
        },

        mounted() {
          console.log(navigator.getGamepads);
          
          // If ROS got disconnected, return to home
          if (this.ros==null) {
            this.$router.push({
              name: "Home",
            });
          }
        },

        beforeDestroy() {

          // Reloading page when going back
          window.location.reload();
        },
    };
</script>
