<script setup>
import { defineProps } from 'vue'

const props = defineProps(['configOptions', 'value'])
</script>
<template>
    <v-switch
        :label="props.configOptions.name"
        :value="props.value"
        @change="(value) => $emit('input', value)"
        color="secondary"
    ></v-switch>
</template>
