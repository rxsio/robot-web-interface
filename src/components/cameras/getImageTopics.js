import { zip } from '@/components/cameras/utils'

export default async (ros) => {
    // connect to the rosapi topic service
    const topicService = new window.ROSLIB.Service({
        ros: ros,
        name: '/rosapi/topics',
        serviceType: 'rosapi/Topics',
    })

    const request = new window.ROSLIB.ServiceRequest({})

    // using async and promises for simple callbacks
    return new Promise((resolve, reject) => {
        topicService.callService(
            request,
            (result) => {
                resolve(
                    zip(result.topics, result.types) // combine topic names with types
                        .filter((res) => res[1] === 'sensor_msgs/Image') // leave only image topics
                        .map((res) => res[0]) // leave only the names
                )
            },
            reject
        )
    })
}
