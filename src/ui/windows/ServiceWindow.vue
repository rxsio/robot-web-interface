<script setup>
import { defineProps } from 'vue'

const props = defineProps(['extraConfig'])
</script>

<template>
    <div>
        SERVICE WINDOW: {{ props.extraConfig.service }}
        <div
            v-if="!props.extraConfig.service"
            color="error"
        >
            Service not selected
        </div>
    </div>
</template>

<style scoped></style>
