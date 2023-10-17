import { useTopicSubscriber } from '@/misc/roslibExtensions'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface IBatteryMessage {
    battery_percentage: number
    battery_voltage: number
}

export const useBatteryLevelStore = defineStore('batteryLevel', () => {
    const percentage = ref<number>(0)
    const voltage = ref<number>(0)

    useTopicSubscriber<IBatteryMessage>(
        '/power_status',
        'canbus_modules/PowerStatus',
        (status) => {
            percentage.value = status.battery_percentage
            voltage.value = status.battery_voltage
        }
    )

    return {
        percentage,
        voltage,
    }
})
