<script setup>
import { callService } from '@/core/roslibExtensions'
import { useRosStore } from '@/stores'
import ServiceParameters from '@/ui/windows/ServiceWindow/components/ServiceParameters.vue'
import { defineExpose, defineProps, ref, watch } from 'vue'

const props = defineProps(['extraConfig'])

const rosStore = useRosStore()

const serviceType = ref(null)
const serviceRequestDetails = ref(null)
const request = ref({})
const requestResponse = ref(null)
const requestError = ref(null)

const call = () => {
    if (
        props.extraConfig.service &&
        serviceType.value !== null &&
        serviceRequestDetails.value !== null
    ) {
        requestError.value = null

        callService(props.extraConfig.service, serviceType.value, request.value)
            .then((serviceResponse) => {
                requestResponse.value = serviceResponse
            })
            .catch((error) => {
                requestError.value = error
            })
    }
}

const clear = () => {
    requestError.value = null
    requestResponse.value = null
}

const updateParameters = (value) => {
    request.value = value
}

const fetchServiceType = () => {
    serviceType.value = null
    request.value = null
    requestResponse.value = null

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

    if (serviceType.value === null) {
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
                <template
                    v-if="Object.keys(serviceRequestDetails).length !== 0"
                >
                    <div class="content-small">Request Details</div>
                    <code class="content-message">
                        <ServiceParameters
                            :parameters="serviceRequestDetails"
                            @update="(value) => updateParameters(value)"
                        />
                    </code>
                </template>
                <template v-else>
                    <div class="content-small">No request parameters</div>
                </template>

                <template v-if="requestResponse">
                    <div class="content-small">Response</div>
                    <pre
                        class="content-message"
                    ><code>{{ requestResponse }}</code></pre>
                </template>

                <template v-if="requestResponse">
                    <div class="content-small error">Error</div>
                    <pre
                        class="content-message error"
                    ><code>{{ requestError }}</code></pre>
                </template>
            </template>
            <template v-else>
                <div class="content-small">Fetching request details...</div>
            </template>
            
        </div>
            <v-btn
                @click="clear"
                color="error"
                block
                v-if="requestResponse || requestError"
                :disabled="!serviceType"
            >
                <v-icon>mdi-delete-outline</v-icon>
                Clear
            </v-btn>
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
