<script setup>
import { useJoystickStore } from '@/stores'
import { computed, defineProps, ref } from 'vue'

const props = defineProps(['show'])

const joystickStore = useJoystickStore()
const currentSource = ref('Inverse kinematics')

const controllers = ref([
    { type: 'interface', name: 'Test1' },
    { type: 'interface', name: 'Test2' },
    { type: 'phone', name: 'Phone' },
    { type: 'direct', name: 'Joystick' },
])
const otherSources = ref([
    { type: 'kinematics', name: 'Inverse kinematics' },
    { type: 'autonomy', name: 'Autonomy' },
    { type: 'other', name: 'Keyboard twist' },
])

const sourceIcons = {
    interface: 'mdi-monitor-dashboard',
    phone: 'mdi-cellphone',
    direct: 'mdi-controller',

    kinematics: 'mdi-robot-industrial',
    autonomy: 'mdi-map-marker-path',
    other: 'mdi-console',
}

const controlCount = computed(() => controllers.value.length)
const currentColor = computed(() =>
    joystickStore.connected ? 'primary' : 'red'
)
const sections = computed(() => [
    { name: 'Controllers', values: controllers.value },
    { name: 'Other sources', values: otherSources.value },
])
</script>
<template>
    <v-menu
        offset-y
        open-on-hover
        :close-delay="100"
        :close-on-content-click="false"
        :nudge-left="96"
        :nudge-bottom="2"
        content-class="menu-content"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-fab-transition leave-absolute>
                <v-btn
                    icon
                    :color="currentColor"
                    v-show="props.show"
                    v-bind="attrs"
                    v-on="on"
                >
                    <v-badge
                        :color="currentColor"
                        bottom
                    >
                        <template v-slot:badge>
                            <span class="secondary--text">
                                {{ controlCount }}
                            </span>
                        </template>
                        <v-icon>
                            {{
                                joystickStore.connected
                                    ? 'mdi-controller'
                                    : 'mdi-controller-off'
                            }}
                        </v-icon>
                    </v-badge>
                </v-btn>
            </v-fab-transition>
        </template>
        <v-card class="overlay">
            <div
                v-if="!joystickStore.connected"
                class="title"
            >
                <span class="text-subtitle-1 red--text">
                    <v-icon
                        left
                        color="red"
                    >
                        mdi-alert-circle
                    </v-icon>
                    No controller detected!
                </span>
            </div>
            <div
                class="title"
                v-else
            >
                <span class="text-subtitle-1 primary--text">
                    <v-icon
                        left
                        color="primary"
                    >
                        mdi-check-bold
                    </v-icon>
                    Controller active!
                </span>
            </div>
            <div
                v-for="section in sections"
                :key="section.name"
            >
                <v-subheader class="subtitle">{{ section.name }}</v-subheader>
                <v-divider></v-divider>
                <div class="buttons">
                    <v-tooltip
                        v-for="source in section.values"
                        :key="source.name"
                        bottom
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                :color="
                                    source.name === currentSource
                                        ? 'primary'
                                        : 'gray darken-1'
                                "
                                class="control-button"
                                v-bind="attrs"
                                v-on="on"
                            >
                                <v-icon>{{ sourceIcons[source.type] }}</v-icon>
                            </v-btn>
                        </template>
                        <span>{{ source.name }}</span>
                    </v-tooltip>
                </div>
            </div>
        </v-card>
    </v-menu>
</template>
<style scoped>
.menu-content {
    border-radius: 16px;
}
.overlay {
    padding: 8px;
    display: flex;
    flex-direction: column;
    border-radius: 16px;
    width: 240px;
}
.title {
    padding: 4px;
    margin: auto;
}
.subtitle {
    height: auto;
    padding: 4px 16px;
}
.buttons {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
}
.control-button {
    min-width: 48px !important;
    height: 48px !important;
    padding: 0px !important;
    margin: 4px;
}
</style>
