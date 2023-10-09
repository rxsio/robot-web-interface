<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import {
    useGstreamerStore,
    useJoystickStore,
    useRosStore,
    useSteeringStore,
} from '@/stores'
import LoadingScreen from '@/components/LoadingScreen.vue'
import EncryptionErrorScreen from '@/components/EncryptionErrorScreen.vue'

const rosStore = useRosStore()
const gstreamerStore = useGstreamerStore()
const joystickStore = useJoystickStore()
const steeringStore = useSteeringStore()

const isReady = ref<boolean | null>(null)

const networkTest = async (): Promise<boolean> => {
    const protocol: string = window.location.protocol
    const address: string = window.location.host
    const href: string = window.location.href

    if (
        protocol === 'https:' ||
        'webpackHotUpdaterobot_web_interface' in window
    ) {
        isReady.value = true
        return true
    }

    return await fetch(`https://${address}/networkTest`, { method: 'POST' })
        .then(() => {
            window.location.replace(`https:${href.substring(protocol.length)}`)
            return true
        })
        .catch(() => {
            isReady.value = false
            return false
        })
}

onMounted(() => {
    networkTest().then((passed) => {
        if (passed) {
            gstreamerStore.connect()
            rosStore.connect()
            joystickStore.start()
            steeringStore.start()
        }
    })
})

onUnmounted(() => {
    joystickStore.stop()
    steeringStore.stop()
})
</script>
<template>
    <v-app>
        <LoadingScreen v-if="isReady" />
        <RouterView v-if="isReady" />
        <EncryptionErrorScreen
            v-if="!isReady"
            :showError="isReady === false"
        />
    </v-app>
</template>
