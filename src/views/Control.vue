<template>
    <div class="control">
        <touch-control v-if="this.isMobile()"
          :ws_address="this.ws_address"
          :ros="this.ros"/>
        <keyboard-control v-else
          :ws_address="this.ws_address"
          :ros="this.ros"/>
    </div>
</template>
<script>
    import KeyboardControl from '@/components/control/KeyboardControl.vue';
    import TouchControl from '@/components/control/TouchControl.vue';
    import { isMobile } from 'mobile-device-detect';

    export default {
        name: "Control",
        
        components: {
          KeyboardControl,
          TouchControl,
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

        methods: {
          isMobile() {
            console.log(isMobile);
            return true; // delete when done with testing
            //return isMobile;
          }
        },
    };
</script>
