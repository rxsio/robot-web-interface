<script setup>
import elements from '@/components/ControlWindow'
import { useRosStore } from '@/stores'
import { defineProps, ref, watch } from 'vue'

const props = defineProps(['extraConfig'])

const rosStore = useRosStore()

const component = ref(null)
const config = ref({})

watch(props, () => {
    config.value = JSON.parse(JSON.stringify(props.extraConfig))

    const strategy = config.value.movementStrategy
        ? config.value.movementStrategy.toLowerCase()
        : null
    const object = config.value.controlledObject
        ? config.value.controlledObject.toLowerCase()
        : null
    const mode = config.value.controlMode
        ? config.value.controlMode.toLowerCase()
        : null

    let element = strategy in elements ? elements[strategy] : {}
    if (object in element) element = element[object]
    if (mode in element) element = element[mode]

    // Check if the element is right vue component
    if (element._compiled !== undefined) component.value = element

    config.value.movementStrategy = undefined
    config.value.controlledObject = undefined
    config.value.controlMode = undefined
})
</script>

<template>
    <div>
        <component
            v-if="component"
            :is="component"
            :ros="rosStore.ws"
            :config="config"
        />
        <div
            v-else
            style="align-items: center; justify-content: center; display: flex"
        >
            Invalid choice. Choose the window type correctly.
        </div>
    </div>
</template>

<style scoped>
* {
    width: 100%;
    height: 100%;
}
</style>
