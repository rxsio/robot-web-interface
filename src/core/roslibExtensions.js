import { useRosStore } from '@/stores/ros'
import ROSLIB from 'roslib'
import { computed, ref, watch } from 'vue'

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
    const result = {},
        dataTypes = {}
    for (const category of ['bools', 'ints', 'strs', 'doubles']) {
        for (const { name, value } of config[category]) {
            result[name] = value
            dataTypes[name] = category
        }
    }
    return [result, dataTypes]
}

export const setDynamicReconfigureParameters = async (
    serviceName,
    request,
    dataTypes
) => {
    const config = { bools: [], ints: [], strs: [], doubles: [], groups: [] }

    for (const [name, value] of Object.entries(request)) {
        let type = ''
        if (Object.prototype.hasOwnProperty.call(dataTypes, name)) {
            type = dataTypes[name]
        } else {
            switch (typeof value) {
                case 'string':
                    type = 'strs'
                    break
                case 'boolean':
                    type = 'bools'
                    break
                case 'number':
                    if (Number.isInteger(value)) {
                        type = 'ints'
                    } else {
                        type = 'doubles'
                    }
                    break
            }
        }

        config[type].push({ name, value })
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

export const useDynamicReconfigure = (nodeName) => {
    const rosCache = ref({})
    const mainCache = ref({})
    const dataTypes = ref({})

    useTopicSubscriber(
        `${nodeName}/parameter_updates`,
        'dynamic_reconfigure/Config',
        (newConfig) => {
            rosCache.value = parseDynamicReconfigureConfig(newConfig)[0]
        }
    )

    onRosConnected(async () => {
        const [params, types] = await getDynamicReconfigureParameters(
            `${nodeName}/set_parameters`
        )
        rosCache.value = params
        dataTypes.value = types
    })

    watch(rosCache, (newValue) => {
        mainCache.value = { ...newValue }
    })

    watch(
        mainCache,
        (newValue) => {
            if (JSON.stringify(newValue) === JSON.stringify(rosCache.value))
                return

            setDynamicReconfigureParameters(
                `${nodeName}/set_parameters`,
                newValue,
                dataTypes.value
            )
        },
        { deep: true }
    )

    return mainCache
}

export const onRosConnected = (callback) => {
    const rosStore = useRosStore()
    watch(
        () => rosStore.connected,
        () => {
            if (rosStore.connected) {
                callback()
            }
        }
    )
}

export const onRosDisconnected = (callback) => {
    const rosStore = useRosStore()
    watch(
        () => rosStore.connected,
        () => {
            if (!rosStore.connected) {
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
