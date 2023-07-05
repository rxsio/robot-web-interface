<script setup>
import { defineProps } from 'vue'
import { useViewModeStore, useGstreamerStore } from '@/stores'

const props = defineProps(['show'])

const viewModeStore = useViewModeStore()
const gstreamerStore = useGstreamerStore()
const { editMode } = viewModeStore
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
                color="red"
                v-show="props.show"
            >
                <v-icon>mdi-microsoft-xbox-controller-off</v-icon>
            </v-btn>
        </v-fab-transition>
        <v-fab-transition leave-absolute>
            <v-btn
                icon
                :color="gstreamerStore.connected ? 'primary' : 'red'"
                v-show="props.show"
            >
                <v-icon v-if="!gstreamerStore.connected">mdi-video-off</v-icon>
                <v-icon v-if="gstreamerStore.connected">mdi-video</v-icon>
            </v-btn>
        </v-fab-transition>
        <v-fab-transition leave-absolute>
            <v-btn
                icon
                color="red"
                v-show="props.show"
            >
                <v-icon>mdi-api-off</v-icon>
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
