<script setup>
import { defineProps } from 'vue'

const props = defineProps(['extraConfig'])
</script>
<template>
    <div>
        <p>Test window</p>
        <code>{{ JSON.stringify(props.extraConfig) }}</code>
    </div>
</template>
