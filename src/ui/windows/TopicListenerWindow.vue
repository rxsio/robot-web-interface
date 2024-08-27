<script setup>
import { useTopic } from '@/core/roslibExtensions'
import { useRosStore } from '@/stores'
import { defineProps, ref, watch } from 'vue'

const props = defineProps(['extraConfig'])

const rosStore = useRosStore()
const topic = ref(null)

watch(
    () => [props.extraConfig.topic],
    // eslint-disable-next-line no-unused-vars
    (oldVal, newVal, _) => {
        if (topic.value !== null) {
            topic.unsubscribe()
        }

        topic.value = useTopic(
            props.extraConfig.topic,
            rosStore.topics[props.extraConfig.topic]
        )
        topic.value.subscribe((msg) => {
            console.log('msg', msg)
        })
    }
)
</script>

<template>
    <div>
        TOPIC LISTENER: {{ props.extraConfig.topic }}
        <div
            v-if="!props.extraConfig.topic"
            color="error"
        >
            Topic not selected
        </div>
    </div>
</template>

<style scoped></style>
