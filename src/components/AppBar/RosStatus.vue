<script setup>
import { useRosStore } from '@/stores'

const rosStore = useRosStore()
</script>
<template>
    <div id="ros-status">
        <div
            class="container"
            v-for="container in rosStore.containers"
            :key="container.id"
        >
            {{ container.value.id }} - {{ container.value.connected }}
        </div>
    </div>
</template>
<style>
#ros-status {
    display: flex;
}
.container {
    float: left;
    border: 1px solid red;
    border-radius: 8px;
    padding: 8px;
    margin: 0 8px;
    color: white !important;
}
</style>
