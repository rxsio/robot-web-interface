import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBatteryLevelStore = defineStore('batteryLevel', () => {
    const percentage = ref(70)
    const voltage = ref(20.3)

    function setPercentage(newPercentege) {
        percentage.value = newPercentege
    }
    function setVoltage(newVoltage) {
        voltage.value = newVoltage
    }
    function increaseBattery() {
        percentage.value += 20
    }
    function decreaseBattery() {
        percentage.value -= 15
    }

    return {
        percentage,
        voltage,
        setPercentage,
        setVoltage,
        increaseBattery,
        decreaseBattery,
    }
})
