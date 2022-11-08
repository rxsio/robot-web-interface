<script setup>
//import LoadingScreen from '@/components/LoadingScreen.vue'
import { onMounted } from 'vue'
import { useRosStore } from './stores/ros'
const rosStore = useRosStore()
onMounted(() => {
    rosStore.connect()
})
</script>
<template>
    <v-app>
        <!--<LoadingScreen />-->
        <RouterView />
    </v-app>
</template>
