<script setup>
import { defineProps } from 'vue'

const props = defineProps(['type', 'extraConfig'])
</script>
<template>
    <div class="content">
        <v-icon
            x-large
            color="red"
        >
            mdi-alert-circle
        </v-icon>
        <h3 class="red--text">Invalid window type!</h3>
        <code>{{ props.type }}</code>
    </div>
</template>
<style scoped>
.content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--v-error-lighten4);
}
</style>
