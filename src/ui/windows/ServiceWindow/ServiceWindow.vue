<script setup>
import { callService } from '@/core/roslibExtensions'
import { useRosStore } from '@/stores'
import ServiceParameters from '@/ui/windows/ServiceWindow/components/ServiceParameters.vue'
import { defineExpose, defineProps, ref, watch } from 'vue'

const props = defineProps(['extraConfig'])

const rosStore = useRosStore()

const serviceType = ref(null)
const serviceRequestDetails = ref(null)

const call = () => {
    if (
        props.extraConfig.service &&
        serviceType.value !== null &&
        serviceRequestDetails.value !== null
    ) {
        // verify and collect

        callService(props.extraConfig.service, serviceType.value)
    }
}

const fetchServiceType = () => {
    serviceType.value = null

    if (rosStore.ros === null) {
        return
    }

    rosStore.ros.getServiceType(
        props.extraConfig.service,
        (newServiceType) => {
            serviceType.value = newServiceType
        },
        (error) => {
            console.warn(
                'Cannot get service type. Service name: ',
                props.extraConfig.service,
                ', error: ',
                error
            )
        }
    )
}

const fetchServiceRequestDetails = () => {
    serviceRequestDetails.value = null

    if (rosStore.ros === null) {
        return
    }

    rosStore.ros.getServiceRequestDetails(
        serviceType.value,
        (requestDetails) => {
            serviceRequestDetails.value = rosStore.ros.decodeTypeDefs(
                requestDetails.typedefs
            )
        },
        (error) => {
            console.warn(
                'Cannot get service request details. Service type: ',
                serviceType.value,
                ', error: ',
                error
            )
        }
    )
}

const control = (id) => {
    switch (id) {
        case 'reload':
            fetchServiceType()
            break
    }
}

watch(
    () => [props.extraConfig.service, rosStore.ros],
    // eslint-disable-next-line no-unused-vars
    (oldValue, newValue, onCleanup) => {
        fetchServiceType()
    }
)

watch(
    () => [serviceType.value],
    // eslint-disable-next-line no-unused-vars
    (oldValue, newValue, onCleanup) => {
        fetchServiceRequestDetails()
    }
)

defineExpose({
    control,
})
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
                <br />
                <div class="content-small">
                    Type: {{ serviceType || 'Unknown' }}
                </div>
            </div>
            <template v-if="serviceRequestDetails">
                <div class="content-small">Request</div>
                <code class="content-message">
                    <ServiceParameters :parameters="serviceRequestDetails" />
                </code>
            </template>
            <template v-else>
                <div class="content-small">Fetching request...</div>
            </template>
            <v-btn
                @click="call"
                color="primary"
                block
                :disabled="!serviceType"
            >
                <v-icon>mdi-broadcast</v-icon>
                Call
            </v-btn>
        </div>
    </div>
</template>

<style scoped src="@/styles/topics.css"></style>
