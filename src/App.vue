<script setup>
//import LoadingScreen from '@/components/LoadingScreen.vue'
import { onMounted } from 'vue'
import { useRosStore, useGstreamerStore } from '@/stores'
const rosStore = useRosStore()
const gstreamerStore = useGstreamerStore()
onMounted(() => {
    rosStore.connect()
    gstreamerStore.connect()
})
</script>
<template>
    <v-app>
        <LoadingScreen />
        <RouterView />
    </v-app>
</template>
