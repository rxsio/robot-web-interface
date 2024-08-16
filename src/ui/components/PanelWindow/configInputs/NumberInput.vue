<script setup>
import { defineProps } from 'vue'

const props = defineProps(['configOptions', 'value'])
</script>
<template>
    <v-text-field
        :label="props.configOptions.name"
        :value="props.value"
        @input="(value) => $emit('input', value)"
        required
        type="number"
    ></v-text-field>
</template>
