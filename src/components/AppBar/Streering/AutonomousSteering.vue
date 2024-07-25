<script setup>
import { useSteeringStore } from '@/stores'
import { defineProps, ref } from 'vue'

import SteeringButtonGroup from './SteeringButtonGroup.vue'
import SteeringPopupButton from './SteeringPopupButton.vue'

const props = defineProps(['show'])

const steeringStore = useSteeringStore()

const gear = ref(2)
const enabled = ref(false)
</script>
<template>
    <v-menu
        offset-y
        open-on-hover
        :close-delay="100"
        :close-on-content-click="false"
        :nudge-left="56"
        :nudge-bottom="8"
        content-class="menu-content"
    >
        <template v-slot:activator="{ on, attrs }">
            <SteeringPopupButton
                :show="props.show"
                :enabled="enabled"
                :attrs="attrs"
                :on="on"
            >
                <v-icon
                    large
                    :style="{ margin: '-8px' }"
                >
                    {{ steeringStore.gearIcons[gear] }}
                </v-icon>
                <v-icon>mdi-map-marker-path</v-icon>
            </SteeringPopupButton>
        </template>
        <v-card class="overlay">
            <v-btn
                color="primary"
                class="text--secondary"
                rounded
                :disabled="enabled"
                @click="enabled = true"
            >
                Enable autonomy
            </v-btn>

            <v-expand-transition>
                <div
                    class="modes"
                    v-show="enabled"
                >
                    <SteeringButtonGroup
                        :style="{ margin: 'auto', 'margin-bottom': '8px' }"
                        v-model="gear"
                        :values="steeringStore.gears"
                        :icons="steeringStore.gearIcons"
                    />

                    <div class="text-caption">Max gear</div>
                    <v-slider
                        hideDetails
                        thumb-label
                        max="100"
                        min="0"
                    ></v-slider>
                    <span class="text-caption">Smoothness</span>
                    <v-slider
                        hideDetails
                        thumb-label
                        max="100"
                        min="0"
                    ></v-slider>
                </div>
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
    width: 200px;
}
.modes {
    display: flex;
    flex-direction: column;
}
.selected {
    background-color: var(--v-primary-lighten1) !important;
}
</style>
