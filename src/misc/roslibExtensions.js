import ROSLIB from 'roslib'
import { useRosStore } from '@/stores/ros'
import { computed, watch } from 'vue'

export const callService = (serviceName, serviceType, request) =>
    new Promise((resolve, reject) => {
        const rosStore = useRosStore()

        if (!rosStore || !rosStore.ros) {
            reject(new Error('Not connected to ros'))
            return
        }
        const service = new ROSLIB.Service({
            ros: rosStore.ros,
            name: serviceName,
            serviceType,
        })

        service.callService(
            new ROSLIB.ServiceRequest(request),
            (response) => {
                resolve(response)
            },
            (error) => {
                reject(new Error(error))
            }
        )
    })

export const onRosConnected = (callback) => {
    const rosStore = useRosStore()
    watch(
        () => rosStore.ros,
        () => {
            if (rosStore.ros) {
                callback()
            }
        }
    )
}

export const onRosDisconnected = (callback) => {
    const rosStore = useRosStore()
    watch(
        () => rosStore.ros,
        () => {
            if (!rosStore.ros) {
                callback()
            }
        }
    )
}

export const useTopic = (topicName, messageType) => {
    const rosStore = useRosStore()
    const topic = computed(() => {
        if (rosStore.ros) {
            return new ROSLIB.Topic({
                ros: rosStore.ros,
                name: topicName,
                messageType,
            })
        } else {
            return null
        }
    })

    return topic
}

export const useTopicSubscriber = (topicName, messageType, callback) => {
    const topic = useTopic(topicName, messageType)

    watch(topic, (newTopic, oldTopic) => {
        if (oldTopic) oldTopic.unsubscribe()
        if (newTopic) newTopic.subscribe(callback)
    })

    return topic
}
