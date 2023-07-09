<script setup>
import { computed, defineProps, ref } from 'vue'
import SteeringPopupButton from './SteeringPopupButton.vue'
import SteeringButtonGroup from './SteeringButtonGroup.vue'

const props = defineProps(['show'])

const speeds = [1, 2, 3]
const speedIcons = {
    1: 'mdi-numeric-1',
    2: 'mdi-numeric-2',
    3: 'mdi-numeric-3',
}

const drivingModes = ['normal', 'car', 'tank']
const manipModes = ['forward', 'inverse', 'inverseCylinder']

const modeIcons = {
    normal: 'mdi-arrow-decision',
    car: 'mdi-car-side',
    tank: 'mdi-tank',

    forward: 'mdi-robot-industrial',
    inverse: 'mdi-axis-arrow',
    inverseCylinder: 'mdi-axis-z-rotate-clockwise',
}
const modeTooltips = {
    normal: 'Normal mode',
    car: 'Car mode',
    tank: 'Tank mode',

    forward: 'Forward kinematics',
    inverse: 'Inverse kinematics',
    inverseCylinder: 'Inverse kinematics cylindrical',
}

const currentIcon = computed(() => modeIcons[mode.value])
const currentSpeed = computed(() => {
    if (drivingModes.includes(mode.value)) return drivingSpeed.value
    if (manipModes.includes(mode.value)) return manipSpeed.value
    return 0
})

const mode = ref('normal')
const enabled = ref(false)
const drivingSpeed = ref(1)
const manipSpeed = ref(1)
</script>
<template>
    <v-menu
        offset-y
        open-on-hover
        :close-delay="100"
        :close-on-content-click="false"
        :nudge-left="100"
        :nudge-bottom="8"
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
                    {{ speedIcons[currentSpeed] }}
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
                :disabled="enabled"
                @click="enabled = true"
            >
                Take over control
            </v-btn>

            <v-expand-transition>
                <div
                    class="modes"
                    v-show="enabled"
                >
                    <div class="column">
                        <SteeringButtonGroup
                            v-model="mode"
                            :values="drivingModes"
                            :icons="modeIcons"
                            :tooltips="modeTooltips"
                        />
                        <SteeringButtonGroup
                            v-model="drivingSpeed"
                            :values="speeds"
                            :icons="speedIcons"
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
                            v-model="mode"
                            :values="manipModes"
                            :icons="modeIcons"
                            :tooltips="modeTooltips"
                        />
                        <SteeringButtonGroup
                            v-model="manipSpeed"
                            :values="speeds"
                            :icons="speedIcons"
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
        </v-card>
    </v-menu>
</template>
<style scoped>
.overlay {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: 16px;
    width: 319px;
}
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
