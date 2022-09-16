<script setup>
import LoadingScreen from '@/components/LoadingScreen.vue'
</script>
<template>
    <v-app>
        <LoadingScreen />
        <RouterView />
    </v-app>
</template>
