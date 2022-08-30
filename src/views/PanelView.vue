<script setup>
import AppBar from '@/components/AppBar'
import NavigationDrawer from '@/components/NavigationDrawer.vue'
import BatteryBar from '@/components/BatteryBar.vue'

import { useBatteryLevelStore } from '@/stores'
import EditDrawer from '@/components/EditDrawer.vue'
const { decreaseBattery, increaseBattery } = useBatteryLevelStore()
</script>
<template>
    <div>
        <AppBar />
        <NavigationDrawer />
        <BatteryBar />
        <EditDrawer />
        <v-main>
            <h1>
                {{ $route.params.variant }}
            </h1>
            <v-btn
                icon
                color="szafirowy"
                @click="increaseBattery()"
            >
                <v-icon>mdi-heart</v-icon>
            </v-btn>
            <v-btn
                icon
                color="morelowy"
                @click="decreaseBattery()"
            >
                <v-icon>mdi-heart</v-icon>
            </v-btn>
        </v-main>
    </div>
</template>
