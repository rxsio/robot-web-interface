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
                <span class="text-caption">Max speed</span>
                <v-slider
                    max-width
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
