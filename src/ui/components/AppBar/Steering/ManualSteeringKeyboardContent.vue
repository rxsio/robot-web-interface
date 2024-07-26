<script setup>
import { useKeyboardSteeringStore, useSteeringStore } from '@/stores'
import { defineProps } from 'vue'

import SteeringButtonGroup from './SteeringButtonGroup.vue'

const props = defineProps(['show'])

const steeringStore = useSteeringStore()
const keyboardSteeringStore = useKeyboardSteeringStore()
</script>
<template>
    <v-expand-transition>
        <div
            class="column"
            v-show="props.show"
            @click.stop="() => {}"
        >
            <SteeringButtonGroup
                v-model="keyboardSteeringStore.gear"
                :values="steeringStore.gears"
                :icons="steeringStore.gearIcons"
            />

            <div style="align-self: stretch">
                <span class="text-caption">Max linear speed</span>
                <v-slider
                    v-model="keyboardSteeringStore.config.linear"
                    hideDetails
                    thumb-label
                    :min="0"
                    :max="1"
                    :step="0.01"
                ></v-slider>
                <span class="text-caption">Max angular speed</span>
                <v-slider
                    v-model="keyboardSteeringStore.config.angular"
                    hideDetails
                    thumb-label
                    :min="0"
                    :max="1"
                    :step="0.01"
                ></v-slider>
            </div>
        </div>
    </v-expand-transition>
</template>
<style scoped>
.column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}
.selected {
    background-color: var(--v-primary-lighten1) !important;
}
</style>
