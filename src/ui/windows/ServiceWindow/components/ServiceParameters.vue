<script setup>
import ServiceParameter from '@/ui/windows/ServiceWindow/components/ServiceParameter.vue'
import { defineEmits, defineProps, ref } from 'vue'

const props = defineProps(['parameters'])
const emit = defineEmits(['update'])

const result = ref({})

const update = (key, value) => {
    result[key] = value
    emit('update', result)
}

/*
    @TODO: Dodaj budowanie odpowiedzi przez zejscie w dol i kaskade callbackow do gory
    @TODO: Ostatni poziom (ServiceWindow) powinno być w stanie otrzymywać budowany obiekt
    @TODO: Zbuduj pierwotny, jako pusty
    @TODO:  - przy zmianach w inputach dodawaj te klucze do obiektu
    @TODO:  - w przypadku grup niech zwracaja obiekty
 */
</script>

<template>
    <div class="parameters">
        <div
            v-for="key in Object.keys(props.parameters).map((value) =>
                value.substring(1)
            )"
            :key="key.toString()"
            class="parameter"
        >
            <template v-if="typeof props.parameters[key] !== 'object'">
                <ServiceParameter
                    :name="key"
                    :type="props.parameters['_' + key]"
                    @update="(value) => update(key, value)"
                />
            </template>
            <template v-else>
                <div class="parameters-key">{{ key }}:</div>
                <ServiceParameters
                    :parameters="props.parameters['_' + key]"
                    @update="(value) => update(key, value)"
                />
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
