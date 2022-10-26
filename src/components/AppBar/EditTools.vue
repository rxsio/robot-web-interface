<script setup>
import { defineProps } from 'vue'
import { useViewModeStore } from '@/stores'

const props = defineProps(['show'])

const viewModeStore = useViewModeStore()
const { normalMode, toggleEditDrawer } = viewModeStore
</script>
<template>
    <div>
        <v-fab-transition leave-absolute>
            <v-btn
                icon
                color="primary"
                @click.stop="normalMode()"
                v-show="props.show"
            >
                <v-icon>mdi-check</v-icon>
            </v-btn>
        </v-fab-transition>
        <v-fab-transition leave-absolute>
            <v-btn
                icon
                color="primary"
                @click.stop="toggleEditDrawer()"
                v-show="props.show"
            >
                <v-icon>mdi-plus-box</v-icon>
            </v-btn>
        </v-fab-transition>
    </div>
</template>
