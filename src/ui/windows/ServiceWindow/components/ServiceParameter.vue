<script setup>
import { defineProps } from 'vue'

const props = defineProps(['name', 'type'])
</script>

<template>
    <span>
        <span class="parameters-key">{{ props.name }}:</span>
        <input class="parameter-input" />
        {{ props.type }}
    </span>
</template>

<style scoped>
.parameters-key {
    font-weight: bold;
}
span.parameters-key {
    padding-right: 4px;
}
.parameter-input {
    border: 1px solid black;
    font-size: 0.8em;
    padding: 0.2em 0.8em;
    border-radius: 1em;
}
</style>
