<script setup>
import { computed, defineProps } from 'vue'

const props = defineProps(['showError'])

const encryptedPage = computed(
    () =>
        `https:${window.location.href.substring(
            window.location.protocol.length
        )}`
)
</script>
<template>
    <div class="backdrop">
        <v-card
            v-if="props.showError"
            max-width="600"
            class="card"
        >
            <v-card-title>
                <v-icon
                    large
                    left
                    color="primary"
                >
                    mdi-information
                </v-icon>
                <span class="title">Initial setup</span>
            </v-card-title>
            <v-card-text class="text-body-1 text--primary">
                <p>
                    Due to design requirements of web browsers, this web
                    interface requires an encrypted connection.
                </p>
                <p>
                    In order to proceed, you will have to install a so called
                    "CA certificate".
                    <br />
                    Here are instructions on how to do that with different
                    browsers and mobile operating systems:
                </p>
                <ul>
                    <li>
                        <a href="url">Firefox</a>
                    </li>
                    <li>
                        <a href="url">Chrome</a>
                    </li>
                    <li>
                        <a href="url">Safari</a>
                    </li>
                    <li>
                        <a href="url">Android</a>
                    </li>
                    <li>
                        <a href="url">iOS</a>
                    </li>
                </ul>
                <p></p>
                <div>
                    If you have done this already and think this is a mistake,
                    you can go to the encrypted page.
                </div>
            </v-card-text>
            <v-card-actions>
                <div class="actions">
                    <a :href="encryptedPage">
                        <v-btn
                            text
                            color="primary"
                        >
                            Go to encrypted page
                        </v-btn>
                    </a>
                    <a
                        href="/rxsioCA.pem"
                        download="rxsioCA.pem"
                    >
                        <v-btn
                            filled
                            color="primary"
                        >
                            Download CA certificate
                        </v-btn>
                    </a>
                </div>
            </v-card-actions>
        </v-card>
    </div>
</template>
<style scoped>
.backdrop {
    width: 100vw;
    height: 100vh;
    background-color: var(--v-secondary-base);

    display: flex;
    justify-content: center;
    align-items: center;
}
.card {
    flex-grow: 1;
}
.title {
    color: var(--v-primary-base);
}
.actions {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: right;
}
</style>
