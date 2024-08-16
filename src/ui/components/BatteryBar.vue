<script setup>
import { useBatteryLevelStore } from '@/stores'
import { computed } from 'vue'
import colors from 'vuetify/lib/util/colors'

const batteryLevelStore = useBatteryLevelStore()

const coverLevel = computed(() => {
    return 100 - batteryLevelStore.percentage + '%'
})

const batteryColor = computed(() => {
    if (batteryLevelStore.percentage < 10) {
        return colors.pink.base
    }

    if (batteryLevelStore.percentage < 25) {
        return colors.red.base
    }

    if (batteryLevelStore.percentage < 50) {
        return colors.amber.base
    }

    if (batteryLevelStore.percentage < 75) {
        return colors.green.base
    }

    return colors.teal.lighten2
})

const batteryBackgroundColor = colors.blueGrey.darken2
</script>
<template>
    <v-navigation-drawer
        app
        class="battery"
        clipped
        fixed
        permanent
        right
        width="24"
    >
        <div class="battery-level"></div>
    </v-navigation-drawer>
</template>
<style scoped>
.battery {
    background-color: v-bind(batteryColor);
}

.battery-level {
    width: 100%;
    height: v-bind(coverLevel);
    transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: v-bind(batteryBackgroundColor);
}
</style>
