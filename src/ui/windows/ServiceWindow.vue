<script setup>
import { defineProps } from 'vue'

const props = defineProps(['extraConfig'])

const call = () => {
    alert('Call service')
}
</script>

<template>
    <div class="content">
        <div
            v-if="!props.extraConfig.service"
            class="content-error"
        >
            <v-icon>mdi-magnify</v-icon>
            Service not selected
        </div>
        <div v-if="props.extraConfig.service">
            <div class="content-name">
                {{ props.extraConfig.service || 'Unknown' }}
            </div>
            <v-btn
                @click="call"
                color="primary"
            >
                <v-icon>mdi-broadcast</v-icon>
                Call
            </v-btn>
        </div>
    </div>
</template>

<style scoped src="@/styles/topics.css"></style>
