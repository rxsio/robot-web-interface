<script setup>
import { defineProps, ref } from 'vue'

const props = defineProps(['configOptions', 'value'])
const value = ref(props.value)
</script>
<template>
    <v-text-field
        :label="props.configOptions.name"
        :value="props.value"
        @input="(value) => $emit('input', value)"
        v-model="value"
        required
    ></v-text-field>
</template>
