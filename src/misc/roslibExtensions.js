import ROSLIB from 'roslib'
import { useRosStore } from '@/stores/ros'

export const callService = ({ name, serviceType, request }) =>
    new Promise((resolve, reject) => {
        const rosStore = useRosStore()

        if (!rosStore || !rosStore.ros) {
            reject(new Error('Not connected to ros'))
            return
        }
        const service = new ROSLIB.Service({
            ros: rosStore.ros,
            name,
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
