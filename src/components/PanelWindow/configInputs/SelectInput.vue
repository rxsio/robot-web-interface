<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps(['configOptions', 'value'])

const possibleValues = computed(() => props.configOptions.possibleValues())
</script>
<template>
    <v-select
        :label="props.configOptions.name"
        :value="props.value"
        @input="(value) => $emit('input', value)"
        :items="possibleValues"
        required
    ></v-select>
</template>
