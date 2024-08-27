<script setup>
import ServiceParameter from '@/ui/windows/ServiceWindow/components/ServiceParameter.vue'
import { defineProps } from 'vue'

const props = defineProps(['parameters'])
</script>

<template>
    <div class="parameters">
        <div
            v-for="key in Object.keys(props.parameters)"
            :key="key.toString()"
            class="parameter"
        >
            <template v-if="typeof props.parameters[key] !== 'object'">
                <ServiceParameter
                    :name="key"
                    :type="props.parameters[key]"
                />
            </template>
            <template v-else>
                <div class="parameters-key">{{ key }}:</div>
                <ServiceParameters :parameters="props.parameters[key]" />
            </template>
        </div>
    </div>
</template>

<style scoped>
.parameters .parameters {
    margin-left: 16px;
}

.parameters-key {
    font-weight: bold;
}
span.parameters-key {
    padding-right: 4px;
}

.parameter {
    padding: 4px 0;
}
</style>
