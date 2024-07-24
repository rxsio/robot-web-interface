<script setup>
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import {
    useJoystickStore,
    useGstreamerStore,
    useRosStore,
    useSteeringStore,
} from '@/stores'
import LoadingScreen from '@/components/LoadingScreen.vue'

const rosStore = useRosStore()
const gstreamerStore = useGstreamerStore()
const joystickStore = useJoystickStore()
const steeringStore = useSteeringStore()

onMounted(() => {
    gstreamerStore.connect()
    rosStore.connect()
    joystickStore.start()
    steeringStore.start()
})

onUnmounted(() => {
    joystickStore.stop()
    steeringStore.stop()
})
</script>
<template>
    <v-app>
        <LoadingScreen />
        <RouterView />
    </v-app>
</template>
