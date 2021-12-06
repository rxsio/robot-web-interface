<template>
    <div class="control">
        <h1>This is the control page.</h1>
        <keyboard-control
          :ws_address="this.ws_address"
          :ros="this.ros"/>
    </div>
</template>
<script>
    import KeyboardControl from '@/components/control/KeyboardControl.vue';
    export default {
        name: "Control",
        
        components: {
          KeyboardControl,
        },
        props: {
            'ws_address': String,
            'ros': Object,
        },

        mounted() {
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
