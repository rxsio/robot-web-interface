<template>
    <form class="form-group" @submit.prevent="onSubmit">
        <div>
          <label for="address-input">
            ROSBridge websocket server address
          </label>
          <div>
            <input
              type="text"
              id="address-input"
              name="address"
              autocomplete="off"
              v-model.lazy.trim="address"
              class="input__lg"
            />
            <button type="submit"
              class="btn btn-primary">
              Connect
            </button>
          </div>
        </div>
    </form>
</template>
<script>
    export default {
      name: "ConnectionForm",
      methods: {
        onSubmit() {
          this.$emit('form-submitted', this.address);   
        }
      },
      data () {
        return {
        address: "ws://0.0.0.0:8081",
        }
      }
    };
</script>

