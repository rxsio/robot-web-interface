<script setup>
import { defineProps } from 'vue'

const props = defineProps(['show', 'enabled', 'on', 'attrs'])
</script>
<template>
    <v-scale-transition
        origin="center"
        leave-absolute
    >
        <v-btn
            rounded
            :color="props.enabled ? 'primary' : 'secondary darken-1'"
            class="button"
            v-show="props.show"
            v-bind="props.attrs"
            v-on="props.on"
        >
            <span
                class="buttonContent"
                :class="
                    props.enabled
                        ? 'secondary--text'
                        : 'secondary--text text--lighten-2'
                "
            >
                <slot />
            </span>
        </v-btn>
    </v-scale-transition>
</template>
<style scoped>
.button {
    margin: 8px;
}
.buttonContent {
    display: flex;
    gap: 8px;
}
</style>
