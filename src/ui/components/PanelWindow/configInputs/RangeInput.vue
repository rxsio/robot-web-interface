<script setup>
import { computed, defineProps, ref } from 'vue'

const props = defineProps(['configOptions', 'value'])

const range = computed(() => props.configOptions.range())
const value = ref(props.value)
</script>
<template>
    <v-slider
        :label="props.configOptions.name"
        :value="props.value"
        @input="(value) => $emit('input', value)"
        v-model="value"
        thumb-label
        color="secondary"
        track-color="secondary"
        :min="range.min"
        :max="range.max"
        :step="range.step"
    ></v-slider>
</template>
