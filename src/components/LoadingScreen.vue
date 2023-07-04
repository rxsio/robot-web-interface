<script setup>
const paths = [
    'm49.077 95.256-47.993-.0078.00186 26.903 32.99-.004-32.986 19.777-.00214 28.498',
    'm56.38 94.708v75.424',
    'm96.85 95.416-32.135 74.894.001323-75.107',
    'm64.717 95.216 30.187.0027c10.778.000964 20.204 9.947 20.204 21.991s-8.1868 22.197-19.752 22.199l-17.337.003',
    'm94.841 139.55 19.974 30.914',
    'm158.11 94.662c20.242 0 34.251 18.917 34.251 37.964s-15.004 37.411-34.525 37.26-34.259-18.146-34.362-37.552 14.394-37.673 34.636-37.673z',
    'm132.33 107.18 24.897 62.686',
    'm202.61 111.96c3.2859-10.012 12.422-16.122 22.466-15.98 11.084.15678 19.861 7.3818 19.701 19.277-.14134 10.562-8.01 19.352-15.455 26.761l-27.918 27.782 45.447-.0123',
    'm223.09 169.36 19.458-44.59',
]
</script>
<template>
    <div class="wrapper">
        <svg
            viewBox="0 0 252.73 81.094"
            class="loader"
        >
            <g
                transform="translate(1.5616 -92.017)"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="5.2917"
            >
                <path
                    v-for="(path, index) in paths"
                    :key="`path${index}`"
                    :id="`path${index}`"
                    :d="path"
                    :style="{
                        'stroke-dashoffset': '101px',
                        'stroke-dasharray': '101px',
                        animation: `loader-draw 1s ease forwards ${
                            index * 0.15
                        }s`,
                    }"
                    pathLength="100"
                />
            </g>
        </svg>
    </div>
</template>
<style scoped>
.wrapper {
    width: 100vw;
    height: 100vh;
    background-color: var(--v-secondary-base);
    position: absolute;
    z-index: 1000;

    animation: loader-disappear 1s ease-in-out forwards 2s;
    visibility: visible;
    opacity: 1;
}
.loader {
    max-width: 50vw;
    max-height: 50vh;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    fill: transparent;
    stroke: var(--v-primary-base);
    stroke-width: 5px;
}
</style>
<style>
@keyframes loader-draw {
    to {
        stroke-dashoffset: 0px;
    }
}
@keyframes loader-disappear {
    to {
        opacity: 0;
        visibility: hidden;
    }
}
</style>
