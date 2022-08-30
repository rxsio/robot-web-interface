<script setup>
import { computed } from 'vue'
import { useBatteryLevelStore } from '@/stores'

const batteryLevelStore = useBatteryLevelStore()
const coverLevel = computed(() => 100 - batteryLevelStore.percentage + '%')
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
    background: var(--v-miętowy-base);
    background: linear-gradient(
        180deg,
        var(--v-miętowy-base) 0%,
        var(--v-słoneczny-base) 75%,
        var(--v-morelowy-base) 100%
    );
}
.battery-level {
    height: v-bind(coverLevel);
    transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    background-color: var(--v-mokka-base);
}
</style>
