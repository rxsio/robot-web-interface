<template>
    <div class="science">
        <h1>This is the science page.</h1>
        <div>
            <label>
                Connected to {{this.ws_address}}
            </label>
        </div>
    </div>
</template>
<script>
    export default {
        name: "Science",
        
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
