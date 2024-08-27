<script setup>
import { useTopic } from '@/core/roslibExtensions'
import { useRosStore } from '@/stores'
import { defineExpose, defineProps, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps(['extraConfig'])

const rosStore = useRosStore()

const topic = ref(null)
const result = ref(null)

const start = () => {
    if (topic.value !== null) {
        topic.value.unsubscribe()
    }

    topic.value = useTopic(
        props.extraConfig.topic,
        rosStore.topics[props.extraConfig.topic]
    )
    topic.value.subscribe((msg) => {
        result.value = msg
    })
}

const clear = () => {
    result.value = null
}

const control = (id) => {
    switch (id) {
        case 'reload':
            start()
            break
    }
}

watch(
    () => [props.extraConfig.topic, rosStore.ros],
    // eslint-disable-next-line no-unused-vars
    (oldVal, newVal, _) => {
        start()
    }
)

onBeforeUnmount(() => {
    if (topic.value !== null) {
        topic.value.unsubscribe()
    }
})

defineExpose({
    control,
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
                    block
                >
                    <v-icon>mdi-delete-outline</v-icon>
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
