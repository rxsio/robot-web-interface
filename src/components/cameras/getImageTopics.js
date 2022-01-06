import { zip } from '@/components/cameras/utils'

export default async (ros) => {
    const topicService = new window.ROSLIB.Service({
        ros: ros,
        name: '/rosapi/topics',
        serviceType: 'rosapi/Topics',
    })

    const request = new window.ROSLIB.ServiceRequest({})

    return new Promise((resolve, reject) => {
        topicService.callService(
            request,
            (result) => {
                resolve(
                    zip(result.topics, result.types)
                        .filter((res) => res[1] === 'sensor_msgs/Image')
                        .map((res) => res[0])
                )
            },
            reject
        )
    })
}
