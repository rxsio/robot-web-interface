<template>
  <div>
    <label>
      Keyboard control component.
    </label>
  </div>
</template>
<script>
    export default {
      name: "KeyboardControl",
      props: {
          'ws_address': String,
          'ros': Object,
      },
      mounted() {
        console.log(this.ws_address);
        console.log(this.ros);
      },
    };
</script>
