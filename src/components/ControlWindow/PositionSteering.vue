<script setup>
import { Message, Service, ServiceRequest, Topic } from 'roslib'
import { defineProps, onBeforeMount, ref } from 'vue'

const props = defineProps(['ros'])

const elements = ref([{ text: 'X' }, { text: 'Y' }, { text: 'Z' }])

const topic = ref(null)
const message = ref(null)
const cartesianMode = ref(false)
const switching = ref(false)

function moveToPosition() {
    ;[message.value.point.x, message.value.point.y, message.value.point.z] =
        elements.value.map((value) => parseFloat(value.position))
    let secs = new Date().getTime() / 1000
    message.value.header.stamp = {
        secs: Math.floor(secs),
        nsecs: Math.floor(1e9 * (secs - Math.floor(secs))),
    }
    topic.value.publish(message.value)
}

function toggleMode() {
    let service = new Service({
        ros: props.ros,
        name: '/manip_controller/toggle_mode',
        serviceType: 'std_srvs/Empty',
    })
    let request = new ServiceRequest({})
    switching.value = true
    service.callService(request, () => {
        console.log('Switched position control mode!')
        switching.value = false
    })
}

onBeforeMount(() => {
    // Start publishing steering informations
    topic.value = new Topic({
        ros: props.ros,
        name: '/cmd_manip_pos',
        messageType: 'geometry_msgs/PointStamped',
    })
    let secs = new Date().getTime() / 1000
    message.value = new Message({
        header: {
            stamp: {
                secs: Math.floor(secs),
                nsecs: Math.floor(1e9 * (secs - Math.floor(secs))),
            },
        },
        point: {
            x: 0,
            y: 0,
            z: 0,
        },
    })
    elements.value.forEach((value, index) => {
        value['position'] = 0
        value['id'] = index
    })
})
</script>
<template>
    <div class="control">
        <div style="border: 1px solid #666; border-radius: 15px">
            <p style="font-size: 16pt; margin: 10px 0">Set position</p>
            <v-divider style="border-color: #bbb"></v-divider>
            <v-list style="flex-flow: row; display: flex; border-radius: 15px">
                <v-list-item
                    v-for="element in elements"
                    :key="element.id"
                    style="place-content: space-between"
                >
                    <label
                        :for="element.id"
                        style="display: flex; flex-grow: 1; margin-right: 10px"
                    >
                        {{ element.text }}:
                    </label>
                    <input
                        :id="element.id"
                        type="number"
                        min="-1.0"
                        max="1.0"
                        step="0.01"
                        style="
                            border: 1px solid #666;
                            border-radius: 5px;
                            display: flex;
                            justify-content: right;
                            width: 70px;
                            padding-left: 2px;
                        "
                        v-model="element.position"
                    />
                </v-list-item>
            </v-list>
        </div>
        <button
            @click="moveToPosition()"
            style="width: 200px; margin-top: 20px; font-size: 16pt"
        >
            Move to point
        </button>
        <v-container
            style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 200px;
            "
        >
            <v-switch
                color="var(--control-secondary)"
                v-model="cartesianMode"
                inset
                :disabled="switching"
                :loading="switching"
                @change="toggleMode()"
            ></v-switch>
            <v-label>
                {{ cartesianMode ? 'Line movement' : 'Arc movement' }}
            </v-label>
        </v-container>
    </div>
</template>
<style scoped>
@import '@/styles/control-styles.css';
</style>
