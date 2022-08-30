<script setup>
import { defineProps } from 'vue'
import { useViewStateStore } from '@/stores'

const props = defineProps(['show'])

const viewStateStore = useViewStateStore()
const { editMode } = viewStateStore
</script>
<template>
    <div>
        <v-fab-transition leave-absolute>
            <v-btn
                icon
                color="primary"
                @click.stop="editMode()"
                v-show="props.show"
            >
                <v-icon>mdi-application-edit</v-icon>
            </v-btn>
        </v-fab-transition>
        <v-fab-transition leave-absolute>
            <v-btn
                icon
                color="primary"
                v-show="props.show"
            >
                <v-icon>mdi-cellphone-off</v-icon>
            </v-btn>
        </v-fab-transition>
        <v-fab-transition leave-absolute>
            <v-btn
                icon
                color="primary"
                v-show="props.show"
            >
                <v-icon>mdi-microsoft-xbox-controller</v-icon>
            </v-btn>
        </v-fab-transition>
        <v-fab-transition leave-absolute>
            <v-btn
                icon
                color="primary"
                v-show="props.show"
            >
                <v-icon>mdi-alert</v-icon>
            </v-btn>
        </v-fab-transition>
    </div>
</template>
