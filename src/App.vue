<script setup>
import {
    useConfigurationStore,
    useGStreamerStore,
    useJoystickStore,
    useRosStore,
    useSteeringStore,
    useUserStore,
} from '@/stores'
import EncryptionErrorScreen from '@/ui/screens/EncryptionErrorScreen.vue'
import LoadingScreen from '@/ui/screens/LoadingScreen.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterView } from 'vue-router'

const userStore = useUserStore()
const rosStore = useRosStore()
const gstreamerStore = useGStreamerStore()
const joystickStore = useJoystickStore()
const steeringStore = useSteeringStore()
const configurationStore = useConfigurationStore()

const isReady = ref(null)

const networkTest = async () => {
    const protocol = window.location.protocol
    const address = window.location.host
    const href = window.location.href

    if (protocol === 'https:' || window.webpackHotUpdaterobot_web_interface) {
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

const onClick = () => {
    userStore.recordInteraction()
    document.removeEventListener('click', onClick)
}

onMounted(() => {
    networkTest().then((passed) => {
        if (passed) {
            gstreamerStore.connect()
            rosStore.connect()
            joystickStore.start()
            steeringStore.start()
            configurationStore.load()
        }
    })

    document.addEventListener('click', onClick)
})

onUnmounted(() => {
    joystickStore.stop()
    steeringStore.stop()
    document.removeEventListener('click', onClick)
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
