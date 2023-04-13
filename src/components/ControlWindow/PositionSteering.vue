<script setup>
import { defineProps } from 'vue'

const props = defineProps(['ros'])
</script>
<template>
    <div>
        <p>Here will be a position steering block.</p>
        <p>{{ props.ros }}</p>
    </div>
</template>
<style scoped>
@import '@/styles/control-styles.css';
</style>
