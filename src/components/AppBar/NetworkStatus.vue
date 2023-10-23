<script setup>
import { useNetworkStore } from '@/stores/network'

const networkStatus = useNetworkStore()
</script>
<template>
    <div id="network-status">
        <v-icon>mdi-wifi-strength-{{ networkStatus.strength }}</v-icon>
        {{ networkStatus.ping }}
    </div>
</template>
<style>
#network-status {
    color: white !important;
}

#network-status .v-icon {
    color: white !important;
}
</style>
