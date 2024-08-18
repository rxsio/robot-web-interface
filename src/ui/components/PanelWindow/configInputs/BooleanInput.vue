<script setup>
import { defineProps, ref } from 'vue'

const props = defineProps(['configOptions', 'value'])
const value = ref(props.value)
</script>
<template>
    <v-switch
        :label="props.configOptions.name"
        :value="props.value"
        @change="(value) => $emit('input', value)"
        v-model="value"
        color="secondary"
    ></v-switch>
</template>
