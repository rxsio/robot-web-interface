import { useTopicSubscriber } from '@/core/roslibExtensions'
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBatteryLevelStore = defineStore('batteryLevel', () => {
    const percentage = ref(0)
    const voltage = ref(0)

    useTopicSubscriber(
        '/battery_state',
        'sensor_msgs/BatteryState',
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
