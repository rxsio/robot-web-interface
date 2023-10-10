import ROSLIB from 'roslib'
import { useRosStore } from '@/stores/ros'
import { computed, ref, watch } from 'vue'
import {
    CATEGORIES,
    DynamicReconfigureCategories,
    DynamicReconfigureConfig,
    DynamicReconfigureDataTypes,
    DynamicReconfigureEmptyConfig,
    DynamicReconfigureMessage,
    DynamicReconfigureValues,
} from '@/misc/roslibTypes'

export const callService = <TServiceRequest, TServiceResponse = any>(
    serviceName: string,
    serviceType: string,
    request: TServiceRequest
): Promise<TServiceResponse> =>
    new Promise((resolve, reject) => {
        const rosStore = useRosStore()

        if (!rosStore || !rosStore.ros) {
            reject(new Error('Not connected to ros'))
            return
        }

        const service = new ROSLIB.Service<
            ROSLIB.ServiceRequest,
            TServiceResponse
        >({
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

export const parseDynamicReconfigureConfig = (
    config: DynamicReconfigureMessage
): [DynamicReconfigureValues, DynamicReconfigureDataTypes] => {
    const result: DynamicReconfigureValues = {}
    const dataTypes: DynamicReconfigureDataTypes = {}

    for (const category in CATEGORIES) {
        for (const { name, value } of config[
            category as DynamicReconfigureCategories
        ]) {
            result[name] = value
            dataTypes[name] = category as DynamicReconfigureCategories
        }
    }

    return [result, dataTypes]
}

export const setDynamicReconfigureParameters = async (
    serviceName: string,
    request: DynamicReconfigureValues,
    dataTypes: DynamicReconfigureDataTypes
): Promise<DynamicReconfigureConfig> => {
    const config: DynamicReconfigureMessage = {
        bools: [],
        ints: [],
        strs: [],
        doubles: [],
        groups: [],
    }

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

        config[type as DynamicReconfigureCategories].push({ name, value })
    }

    return await callService<
        DynamicReconfigureConfig,
        DynamicReconfigureConfig
    >(serviceName, 'dynamic_reconfigure/Reconfigure', {
        config,
    })
}

export const getDynamicReconfigureParameters = async (
    serviceName: string
): Promise<[DynamicReconfigureValues, DynamicReconfigureDataTypes]> => {
    const response = await callService<
        DynamicReconfigureEmptyConfig,
        DynamicReconfigureConfig
    >(serviceName, 'dynamic_reconfigure/Reconfigure', {
        config: {},
    })

    return parseDynamicReconfigureConfig(response.config)
}

export const useDynamicReconfigure = (nodeName: string) => {
    const rosCache = ref<DynamicReconfigureValues>({})
    const mainCache = ref<DynamicReconfigureValues>({})
    const dataTypes = ref<DynamicReconfigureDataTypes>({})

    useTopicSubscriber(
        `${nodeName}/parameter_updates`,
        'dynamic_reconfigure/Config',
        (newConfig) => {
            rosCache.value = parseDynamicReconfigureConfig(
                newConfig as DynamicReconfigureMessage
            )[0]
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
            if (JSON.stringify(newValue) === JSON.stringify(rosCache.value)) {
                return
            }

            /* @TODO: Check if await is necessary */
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

export const onRosConnected = (callback: () => void) => {
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

export const onRosDisconnected = (callback: () => void) => {
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

export const useTopic = (topicName: string, messageType: string) => {
    const rosStore = useRosStore()

    return computed(() => {
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
}

export const useTopicSubscriber = (
    topicName: string,
    messageType: string,
    callback: (message: ROSLIB.Message) => void
) => {
    const topic = useTopic(topicName, messageType)

    watch(topic, (newTopic, oldTopic) => {
        if (oldTopic) {
            oldTopic.unsubscribe()
        }
        if (newTopic) {
            newTopic.subscribe(callback)
        }
    })
}
