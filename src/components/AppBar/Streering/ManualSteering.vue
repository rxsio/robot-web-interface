<script setup>
import { useJoystickStore, useSteeringStore } from '@/stores'
import { computed, defineProps } from 'vue'

import ManualSteeringJoystickContent from './ManualSteeringJoystickContent.vue'
import ManualSteeringKeyboardContent from './ManualSteeringKeyboardContent.vue'
import SteeringPopupButton from './SteeringPopupButton.vue'

const props = defineProps(['show'])
const joystickStore = useJoystickStore()
const steeringStore = useSteeringStore()

const currentIcon = computed(
    () => steeringStore.modeIcons[steeringStore.currentMode]
)
</script>
<template>
    <v-menu
        offset-y
        open-on-hover
        :close-delay="100"
        :close-on-content-click="false"
        :nudge-left="100"
        :nudge-bottom="8"
        content-class="menu-content"
    >
        <template v-slot:activator="{ on, attrs }">
            <SteeringPopupButton
                :show="props.show"
                :enabled="steeringStore.enabled"
                :attrs="attrs"
                :on="on"
            >
                <v-icon
                    large
                    :style="{ margin: '-8px' }"
                >
                    {{ steeringStore.gearIcons[steeringStore.currentGear] }}
                </v-icon>
                <v-icon>{{ currentIcon }}</v-icon>
                <v-icon>mdi-car-shift-pattern</v-icon>
            </SteeringPopupButton>
        </template>
        <v-card class="overlay">
            <v-btn
                color="primary"
                class="text--secondary"
                rounded
                :disabled="steeringStore.enabled"
                @click.stop="steeringStore.takeOverControl"
            >
                <v-icon left>
                    {{
                        joystickStore.connected
                            ? 'mdi-controller'
                            : 'mdi-keyboard'
                    }}
                </v-icon>
                Take over control
            </v-btn>
            <ManualSteeringJoystickContent
                :show="steeringStore.enabled && joystickStore.connected"
            />
            <ManualSteeringKeyboardContent
                :show="steeringStore.enabled && !joystickStore.connected"
            />
            <v-expand-transition>
                <v-btn
                    color="red"
                    rounded
                    v-show="steeringStore.enabled"
                    @click="steeringStore.giveUpControl()"
                >
                    Give up control
                </v-btn>
            </v-expand-transition>
        </v-card>
    </v-menu>
</template>
<style scoped>
.menu-content {
    border-radius: 16px;
}
.overlay {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: 16px;
    width: 319px;
}
</style>
