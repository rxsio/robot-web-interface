<script setup>
import { defineEmits, defineProps } from 'vue'

const props = defineProps(['value', 'values', 'icons', 'tooltips'])
const emit = defineEmits(['input'])

const setCurrentValue = (index) => {
    if (props.values[index]) emit('input', props.values[index])
}
</script>
<template>
    <v-btn-toggle
        dense
        color="primary"
        :value="props.values.indexOf(props.value)"
        @change="setCurrentValue"
        active-class="selected"
        :mandatory="props.values.includes(props.value)"
    >
        <template v-for="val in props.values">
            <v-tooltip
                :key="val"
                bottom
                v-if="props.tooltips && props.tooltips[val]"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon icons>
                            {{ props.icons[val] }}
                        </v-icon>
                    </v-btn>
                </template>
                <span>{{ props.tooltips[val] }}</span>
            </v-tooltip>
            <v-btn
                :key="val"
                v-else
            >
                <v-icon icons>
                    {{ props.icons[val] }}
                </v-icon>
            </v-btn>
        </template>
    </v-btn-toggle>
</template>
<style scoped>
.selected {
    background-color: var(--v-primary-lighten1) !important;
}
</style>
