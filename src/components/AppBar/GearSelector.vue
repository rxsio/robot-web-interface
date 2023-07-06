<script setup>
import { defineProps } from 'vue'

const props = defineProps(['show'])
</script>
<template>
    <v-scale-transition
        origin="center"
        leave-absolute
    >
        <v-btn
            rounded
            color="primary"
            class="content"
            v-show="props.show"
        >
            <h2 class="content">3</h2>
            <v-icon color="secondary">mdi-car-shift-pattern</v-icon>
        </v-btn>
    </v-scale-transition>
</template>
<style scoped>
.content {
    color: var(--v-secondary-base);
}
</style>
