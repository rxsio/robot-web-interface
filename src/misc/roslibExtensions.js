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

export const parseDynamicReconfigureConfig = (config) => {
    const result = {}
    for (const category of ['bools', 'ints', 'strs', 'doubles']) {
        for (const { name, value } of config[category]) {
            result[name] = value
        }
    }
    return result
}

export const setDynamicReconfigureParameters = async (serviceName, request) => {
    const config = { bools: [], ints: [], strs: [], doubles: [], groups: [] }

    for (const [name, value] of Object.entries(request)) {
        switch (typeof value) {
            case 'string':
                config.strs.push({ name, value })
                break
            case 'boolean':
                config.bools.push({ name, value })
                break
            case 'number':
                if (Number.isInteger(value)) {
                    config.ints.push({ name, value })
                } else {
                    config.doubles.push({ name, value })
                }
                break
        }
    }

    return await callService(serviceName, 'dynamic_reconfigure/Reconfigure', {
        config,
    })
}

export const getDynamicReconfigureParameters = async (serviceName) => {
    const response = await callService(
        serviceName,
        'dynamic_reconfigure/Reconfigure',
        {
            config: {},
        }
    )

    return parseDynamicReconfigureConfig(response.config)
}

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
