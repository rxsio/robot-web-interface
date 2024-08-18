<script setup></script>

<template>
    <div class="overlay">
        <div class="rotate rotate-left"></div>
        <div class="restart"><v-icon>mdi-reload</v-icon></div>
        <div class="rotate rotate-right"></div>
    </div>
</template>

<style scoped>
.overlay {
    z-index: 100;
    position: absolute;
    width: 100%;
    height: 100%;
    border: 24px solid transparent;
    --camera-controls-base-color: #888;
}

.rotate {
    cursor: pointer;
    position: absolute;
    top: 50%;
    width: 20px;
    height: 20px;
    border: 0 solid var(--camera-controls-base-color);
    transform: translateY(-50%) rotate(45deg);
    transition: all 250ms ease;
}
.rotate:hover {
    border-color: black;
}
.rotate-left {
    left: 0;
    border-left-width: 3px;
    border-bottom-width: 3px;
}
.rotate-right {
    right: 0;
    border-right-width: 3px;
    border-top-width: 3px;
}

.restart {
    cursor: pointer;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}
.restart .v-icon {
    color: var(--camera-controls-base-color);
}
.restart:hover .v-icon {
    color: black;
}
</style>
