<template>
  <div>
    <label>
      Touch control component.
    </label>
  </div>
</template>
<script>
    export default {
      name: "TouchControl",
      props: {
          'ws_address': String,
          'ros': Object,
      },
      mounted() {
        console.log("Opened using mobile device - touch mode");
      },
    };
</script>
