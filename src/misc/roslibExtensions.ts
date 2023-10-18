import ROSLIB from 'roslib'
import { useRosStore } from '@/stores/ros'
import { computed, Ref, ref, watch } from 'vue'
import {
    CATEGORIES,
    DynamicReconfigureCategories,
    IDynamicReconfigureConfig,
    IDynamicReconfigureDataTypes,
    IDynamicReconfigureEmptyConfig,
    DynamicReconfigureMessage,
    IDynamicConfiguration,
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

export const parseDynamicReconfigureConfig = <
    TConfiguration extends IDynamicConfiguration
>(
    config: DynamicReconfigureMessage
): [TConfiguration, IDynamicReconfigureDataTypes] => {
    const result: IDynamicConfiguration = {}
    const dataTypes: IDynamicReconfigureDataTypes = {}

    for (const category in CATEGORIES) {
        for (const { name, value } of config[
            category as DynamicReconfigureCategories
        ]) {
            result[name] = value
            dataTypes[name] = category as DynamicReconfigureCategories
        }
    }

    return [result as TConfiguration, dataTypes]
}

export const setDynamicReconfigureParameters = async <TConfiguration>(
    serviceName: string,
    request: TConfiguration,
    dataTypes: IDynamicReconfigureDataTypes
): Promise<IDynamicReconfigureConfig> => {
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
        IDynamicReconfigureConfig,
        IDynamicReconfigureConfig
    >(serviceName, 'dynamic_reconfigure/Reconfigure', {
        config,
    })
}

export const getDynamicReconfigureParameters = async <
    TConfiguration extends IDynamicConfiguration
>(
    serviceName: string
): Promise<[TConfiguration, IDynamicReconfigureDataTypes]> => {
    const response = await callService<
        IDynamicReconfigureEmptyConfig,
        IDynamicReconfigureConfig
    >(serviceName, 'dynamic_reconfigure/Reconfigure', {
        config: {},
    })

    return parseDynamicReconfigureConfig<TConfiguration>(response.config)
}

export const useDynamicReconfigure = <
    TConfiguration extends IDynamicConfiguration
>(
    nodeName: string
): Ref<TConfiguration> => {
    const rosCache = ref<TConfiguration | null>(null) as Ref<TConfiguration>
    const mainCache = ref<TConfiguration | null>(null) as Ref<TConfiguration>
    const dataTypes = ref<IDynamicReconfigureDataTypes>({})

    useTopicSubscriber<DynamicReconfigureMessage>(
        `${nodeName}/parameter_updates`,
        'dynamic_reconfigure/Config',
        (newConfig) => {
            rosCache.value =
                parseDynamicReconfigureConfig<TConfiguration>(newConfig)[0]
        }
    )

    onRosConnected(async () => {
        const [params, types] =
            await getDynamicReconfigureParameters<TConfiguration>(
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
            setDynamicReconfigureParameters<TConfiguration>(
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

export const useTopic = <TMessage = ROSLIB.Message>(
    topicName: string,
    messageType: string
) => {
    const rosStore = useRosStore()

    return computed(() => {
        if (rosStore.ros) {
            return new ROSLIB.Topic<TMessage>({
                ros: rosStore.ros,
                name: topicName,
                messageType,
            })
        } else {
            return null
        }
    })
}

export const useTopicSubscriber = <TMessage = ROSLIB.Message>(
    topicName: string,
    messageType: string,
    callback: (message: TMessage) => void
) => {
    const topic = useTopic<TMessage>(topicName, messageType)

    watch(topic, (newTopic, oldTopic) => {
        if (oldTopic) {
            oldTopic.unsubscribe()
        }
        if (newTopic) {
            newTopic.subscribe(callback)
        }
    })
}
