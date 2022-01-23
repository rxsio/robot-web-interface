<template>
    <div>
        <label class="success">Success!</label>
        <div id="disconnect">
            <label style="margin-right: 15px;">
                Connected to <b>{{this.ws_address}}</b>
            </label>
        <button class="btn-alt" @click="$emit('disconnect')">Disconnect</button>
        </div>
        <div id="button-group" style="margin-top: 5vh;">
            <button @click="this.goToControl">
                Control
            </button>
            <button @click="this.goToCameras">
                Science
            </button>
            <button @click="this.goToVisualization">
                Visualization
            </button>
            <button @click="this.goToCameras">
                Cameras
            </button>
        </div>
    </div>
</template>
<script>
    export default {
        name: "HomeConnected",
        props: {
            'ws_address': String,
            'ros': Object,
        },
        methods: {
            goToControl () {
                this.$router.push({
                name: 'Control',
                params: {
                    'ws_address': this.ws_address,
                    'ros': this.ros,
                    },
                });
            },
            goToScience () {
                this.$router.push({
                name: 'Science',
                params: {
                    'ws_address': this.ws_address,
                    'ros': this.ros,
                    },
                });
            },
            goToVisualization () {
                this.$router.push({
                name: 'Visualization',
                params: {
                    'ws_address': this.ws_address,
                    'ros': this.ros,
                    },
                });
            },
            goToCameras () {
                this.$router.push({
                name: 'Cameras',
                params: {
                    'ws_address': this.ws_address,
                    'ros': this.ros,
                    },
                });
            },
        }
    };
</script>

