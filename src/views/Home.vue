<template>
  <div class="home">
    <img alt="SKA logo" src="../assets/SKAR_logo_EN_color-cropped.svg" style="margin-top: 110px; margin-bottom: 30px; width:300px;">
    <h1>Sirius II Control Panel</h1>
    <ConnectionForm v-if="!this.connected" @form-submitted="connect($event)"/>
    <HomeConnected v-else 
      @disconnect="disconnect()"
      :ws_address="this.ws_address"
      :ros="this.ros"
      />
    <label class="warning" v-if="this.connection_error">
      Could not connect
      <details class="help">
        <summary>Help</summary>
        <ul>
          <li>Ensure ROSBridge server is running</li>
          <li>Ensure you typed in correct websocket address</li>
          <li>Check if you are connected to the same network as the rover</li>
        </ul>
      </details>
    </label>
    <label class="warning" v-if="this.address_error">
      Invalid websocket address
      <details class="help">
        <summary>Help</summary>
        <ul>
          <li>Valid address should look similiar to this: <i>ws://192.168.21.37:9090</i></li>
        </ul>
      </details>
    </label>
  </div>
</template>

<script>
// @ is an alias to /src
import Vue from "vue"
import ConnectionForm from '@/components/home/ConnectionForm.vue'
import HomeConnected from '@/components/home/HomeConnected.vue'
import VueCookies from 'vue-cookies'
Vue.use(VueCookies);

export default {
  name: 'Home',
  components: {
    ConnectionForm,
    HomeConnected,
  },
  data () {
    return {
      connected: false,
      ros: null,
      ws_address: 'ws://192.21.37.115:9090',
      connection_error: false,
      address_error: false,
    };
  },
  mounted() {
    if(this.$cookies.isKey('previous-ws-address')) {
      this.connect(this.$cookies.get('previous-ws-address'));
    }
  },
  methods: {
    connect(address) {
      if (this.ros != null) return;
      this.address_error = false;
      this.connection_error = false;
      const ROSLIB = window.ROSLIB;
      console.log("Connecting to rosbridge server...");
      this.ws_address = address;
      try {
        this.ros = new ROSLIB.Ros({
          url: this.ws_address,
        });
      }
      catch (error) {
        console.log('Invalid websocket address.', error);
        this.ros = null;
        this.address_error = true;
        return;
      }
      this.ros.on('connection', () => {
        this.connected = true;
        console.log('Connected!');
        this.$cookies.set('previous-ws-address', address);
      });
      this.ros.on('error', (error) => {
        console.log('Error connecting to websocket server.', error);
        this.connection_error = true;
      });
      this.ros.on('close', () => {
        this.connected = false;
        this.ros = null;
        console.log('Connection to websocket server closed.');
      });
    },
    disconnect: function() {
      this.ros.close();
      this.ros = null;
      console.log("Disconnecting...");
      this.$cookies.remove('previous-ws-address');
    },
  },
}
</script>
