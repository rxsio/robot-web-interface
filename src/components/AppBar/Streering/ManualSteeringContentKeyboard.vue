<script setup>
import { defineProps } from 'vue'
import SteeringButtonGroup from './SteeringButtonGroup.vue'
import { useSteeringStore } from '@/stores'

const props = defineProps(['show'])

const steeringStore = useSteeringStore()
</script>
<template>
    <v-expand-transition>
        <div
            class="column"
            v-show="props.show"
            @click.stop="() => {}"
        >
            <SteeringButtonGroup
                v-model="steeringStore.keyboardGear"
                :values="steeringStore.gears"
                :icons="steeringStore.gearIcons"
            />

            <div style="align-self: stretch">
                <span class="text-caption">Max linear speed</span>
                <v-slider
                    v-model="steeringStore.keyboardConfig.linear"
                    hideDetails
                    thumb-label
                    :min="0"
                    :max="1"
                    :step="0.01"
                ></v-slider>
                <span class="text-caption">Max angular speed</span>
                <v-slider
                    v-model="steeringStore.keyboardConfig.angular"
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
