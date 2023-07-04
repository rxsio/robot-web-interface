<script setup>
import { computed } from 'vue'
import { useBatteryLevelStore } from '@/stores'
import colors from 'vuetify/lib/util/colors'

const batteryLevelStore = useBatteryLevelStore()
const coverLevel = computed(() => 100 - batteryLevelStore.percentage + '%')

let batteryColor = colors.teal.lighten2
if (batteryLevelStore.percentage < 75) batteryColor = colors.green.base
if (batteryLevelStore.percentage < 50) batteryColor = colors.amber.base
if (batteryLevelStore.percentage < 25) batteryColor = colors.red.base
if (batteryLevelStore.percentage < 10) batteryColor = colors.pink.base
const batteryBackgroundColor = colors.blueGrey.darken2
</script>
<template>
    <v-navigation-drawer
        clipped
        app
        fixed
        width="24"
        right
        permanent
        class="battery"
    >
        <div class="battery-level"></div>
    </v-navigation-drawer>
</template>
<style scoped>
.battery {
    background-color: v-bind(batteryColor);
}
.battery-level {
    height: v-bind(coverLevel);
    transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    background-color: v-bind(batteryBackgroundColor);
}
</style>
