import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useTopicSubscriber } from '@/misc/roslibExtensions'

export const useBatteryLevelStore = defineStore('batteryLevel', () => {
    const percentage = ref(0)
    const voltage = ref(0)

    useTopicSubscriber(
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
