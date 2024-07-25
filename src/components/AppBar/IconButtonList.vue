<script setup>
import { defineProps, ref, watch } from 'vue'

import InputListPopupButton from './InputListPopupButton.vue'

const props = defineProps(['show', 'buttons'])

const canClick = ref(true)

watch(props, () => {
    canClick.value = false
    setTimeout(() => {
        canClick.value = true
    }, 300)
})
</script>
<template>
    <div
        class="button-container"
        :style="{
            'pointer-events': canClick ? 'auto' : 'none',
        }"
    >
        <div
            v-for="button in props.buttons"
            :key="button.icon"
        >
            <v-divider
                class="divider"
                vertical
                v-show="props.show"
                v-if="button.type === 'divider'"
            />
            <v-tooltip
                bottom
                v-if="button.type === 'icon'"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-fab-transition leave-absolute>
                        <v-btn
                            icon
                            :color="button.color"
                            @click="button.onClick()"
                            v-show="props.show"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <v-icon>{{ button.icon }}</v-icon>
                        </v-btn>
                    </v-fab-transition>
                </template>
                <span>{{ button.tooltip }}</span>
            </v-tooltip>
            <v-tooltip
                bottom
                v-if="button.type === 'fileUpload'"
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-fab-transition leave-absolute>
                        <v-btn
                            icon
                            :color="button.color"
                            v-show="props.show"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <label>
                                <v-icon>{{ button.icon }}</v-icon>
                                <input
                                    type="file"
                                    hidden
                                    accept=".json"
                                    @change="button.onClick"
                                />
                            </label>
                        </v-btn>
                    </v-fab-transition>
                </template>
                <span>{{ button.tooltip }}</span>
            </v-tooltip>
            <InputListPopupButton
                v-if="button.type === 'inputList'"
                :show="props.show"
            />
        </div>
    </div>
</template>
<style scoped>
.button-container {
    display: flex;
    flex-direction: row;
    flex-shrink: 1;
}
.divider {
    margin: 0px 4px;
    border-color: rgba(255, 255, 255, 0.12);
}
</style>
