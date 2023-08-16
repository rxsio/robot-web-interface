<script setup>
import { defineProps } from 'vue'
import SteeringButtonGroup from './SteeringButtonGroup.vue'
import { useSteeringStore } from '@/stores'

const props = defineProps(['show'])

const steeringStore = useSteeringStore()

const modeTooltips = {
    normal: 'Normal mode',
    car: 'Car mode',
    tank: 'Tank mode',

    forward: 'Forward kinematics',
    inverse: 'Inverse kinematics',
    inverseCylinder: 'Inverse kinematics cylindrical',
}
</script>
<template>
    <v-expand-transition>
        <div
            class="modes"
            v-show="props.show"
        >
            <div class="column">
                <SteeringButtonGroup
                    v-model="steeringStore.currentMode"
                    :values="steeringStore.drivingModes"
                    :icons="steeringStore.modeIcons"
                    :tooltips="modeTooltips"
                />
                <SteeringButtonGroup
                    v-model="steeringStore.drivingGear"
                    :values="steeringStore.gears"
                    :icons="steeringStore.gearIcons"
                />

                <div>
                    <span class="text-caption">Max speed</span>
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
            </div>

            <v-divider vertical />

            <div class="column">
                <SteeringButtonGroup
                    v-model="steeringStore.currentMode"
                    :values="steeringStore.manipModes"
                    :icons="steeringStore.modeIcons"
                    :tooltips="modeTooltips"
                />
                <SteeringButtonGroup
                    v-model="steeringStore.manipGear"
                    :values="steeringStore.gears"
                    :icons="steeringStore.gearIcons"
                />

                <div>
                    <span class="text-caption">Max speed</span>
                    <v-slider
                        hideDetails
                        thumb-label
                        max="100"
                        min="0"
                    ></v-slider>
                </div>
            </div>
        </div>
    </v-expand-transition>
</template>
<style scoped>
.modes {
    display: flex;
    flex-direction: row;
    gap: 8px;
}
.column {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.selected {
    background-color: var(--v-primary-lighten1) !important;
}
</style>
