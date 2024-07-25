<script setup>
import windows from '@/windows'
import { computed, defineProps, ref, watch } from 'vue'

import configInputs from './configInputs'

const props = defineProps(['isOpen', 'config'])

const windowTypes = Object.entries(windows).map(([type, window]) => ({
    text: window.typeName,
    value: type,
}))
const configOptions = computed(() =>
    tempConfig.value.type in windows
        ? Object.entries(windows[tempConfig.value.type].configOptions)
        : []
)

const tempConfig = ref(JSON.parse(JSON.stringify(props.config)))
watch(props, () => {
    tempConfig.value = JSON.parse(JSON.stringify(props.config))
})
</script>
<template>
    <v-dialog
        :value="props.isOpen"
        @input="$emit('close')"
        max-width="600px"
    >
        <v-card>
            <v-card-title>
                <span class="text-h5">Window configuration</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <span class="text-subtitle1">General configuration</span>
                    <v-divider />
                    <v-container>
                        <v-select
                            v-model="tempConfig.type"
                            :items="windowTypes"
                            label="Type"
                            required
                        ></v-select>
                        <v-text-field
                            v-model="tempConfig.name"
                            label="Name"
                            required
                        ></v-text-field>
                    </v-container>

                    <span class="text-subtitle1">Additional configuration</span>
                    <v-divider />
                    <v-container>
                        <component
                            v-for="[name, options] in configOptions"
                            :key="name"
                            :is="configInputs[options.type]"
                            :configOptions="options"
                            v-model="tempConfig.extraConfig[name]"
                        ></component>
                    </v-container>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary darken-1"
                    text
                    @click="$emit('close', null)"
                >
                    Close
                </v-btn>
                <v-btn
                    color="primary darken-1"
                    @click="
                        $emit('close', JSON.parse(JSON.stringify(tempConfig)))
                    "
                >
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style scoped></style>
