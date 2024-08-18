<script setup>
import { computed, defineProps, ref } from 'vue'

const props = defineProps(['configOptions', 'value'])

const possibleValues = computed(() => props.configOptions.possibleValues())
const value = ref(props.value)
</script>
<template>
    <v-select
        :label="props.configOptions.name"
        :value="props.value"
        @input="(value) => $emit('input', value)"
        :items="possibleValues"
        v-model="value"
        required
    ></v-select>
</template>
