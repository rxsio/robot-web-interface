<script setup>
import { useTopic } from '@/core/roslibExtensions'
import { useRosStore } from '@/stores'
import { defineProps, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps(['extraConfig'])

const rosStore = useRosStore()
const topic = ref(null)
const result = ref(JSON.stringify({ a: { b: 3 }, c: 'test' }, null, 2))

const clear = () => {
    result.value = null
}

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
            result.value = msg
        })
    }
)

onBeforeUnmount(() => {
    if (topic.value !== null) {
        topic.unsubscribe()
    }
})
</script>

<template>
    <div class="content">
        <div
            v-if="!props.extraConfig.topic"
            class="content-error"
        >
            <v-icon>mdi-magnify</v-icon>
            Topic not selected
        </div>
        <div v-if="props.extraConfig.topic">
            <div class="content-name">
                {{ props.extraConfig.topic || 'Unknown' }}
            </div>

            <div v-if="result">
                <pre class="content-message"><code>{{ result }}</code></pre>
                <br />
                <v-btn
                    @click="clear"
                    color="error"
                >
                    <v-icon>mdi-broadcast</v-icon>
                    Clear
                </v-btn>
            </div>

            <div
                class="content-small"
                v-if="!result"
            >
                Waiting for message...
            </div>
        </div>
    </div>
</template>

<style scoped src="@/styles/topics.css"></style>
