<script setup>
import { defineProps, ref } from 'vue'
import { useLayoutStore } from '@/stores'
const props = defineProps(['type', 'name'])

const layoutStore = useLayoutStore()
//const viewModeStore = useViewModeStore()

const mouseXY = ref({ x: 0, y: 0 })
const dragPos = ref({ x: 0, y: 0 })

const windowDrag = (e) => {
    mouseXY.value.x = e.clientX
    mouseXY.value.y = e.clientY
}
const dragstart = () => {
    console.log('dragstart')
    document.addEventListener('dragover', windowDrag)
    //viewModeStore.toggleEditDrawer()
}
const drag = () => {
    console.log('drag')
    if (!layoutStore.panelContainer) return

    let parentRect = layoutStore.panelContainer.getBoundingClientRect()
    let mouseInGrid = false
    if (
        mouseXY.value.x > parentRect.left &&
        mouseXY.value.x < parentRect.right &&
        mouseXY.value.y > parentRect.top &&
        mouseXY.value.y < parentRect.bottom
    ) {
        mouseInGrid = true
    }
    if (
        mouseInGrid === true &&
        layoutStore.layout.shape.findIndex((item) => item.i === 'drop') === -1
    ) {
        layoutStore.layout.shape.push({
            x:
                (layoutStore.layout.shape.length * 2) %
                (layoutStore.panelGrid.colNum || 12),
            y:
                layoutStore.layout.shape.length +
                (layoutStore.panelGrid.colNum || 12), // puts it at the bottom
            w: 2,
            h: 2,
            i: 'drop',
        })
    }
    let index = layoutStore.layout.shape.findIndex((item) => item.i === 'drop')
    if (index !== -1) {
        let el = layoutStore.panelGrid.$children[index]
        el.dragging = {
            top: mouseXY.value.y - parentRect.top,
            left: mouseXY.value.x - parentRect.left,
        }
        let new_pos = el.calcXY(
            mouseXY.value.y - parentRect.top,
            mouseXY.value.x - parentRect.left
        )
        if (mouseInGrid === true) {
            layoutStore.panelGrid.dragEvent(
                'dragstart',
                'drop',
                new_pos.x,
                new_pos.y,
                2,
                2
            )
            dragPos.value.x = layoutStore.layout.shape[index].x
            dragPos.value.y = layoutStore.layout.shape[index].y
        }
        if (mouseInGrid === false) {
            layoutStore.panelGrid.dragEvent(
                'dragend',
                'drop',
                new_pos.x,
                new_pos.y,
                2,
                2
            )
            layoutStore.layout.shape = layoutStore.layout.shape.filter(
                (obj) => obj.i !== 'drop'
            )
        }
    }
}
const dragend = () => {
    console.log('dragend')
    document.removeEventListener('dragover', windowDrag)
    // viewModeStore.toggleEditDrawer()

    let parentRect = layoutStore.panelContainer.getBoundingClientRect()
    let mouseInGrid = false
    if (
        mouseXY.value.x > parentRect.left &&
        mouseXY.value.x < parentRect.right &&
        mouseXY.value.y > parentRect.top &&
        mouseXY.value.y < parentRect.bottom
    ) {
        mouseInGrid = true
    }
    if (mouseInGrid === true) {
        layoutStore.panelGrid.dragEvent(
            'dragend',
            'drop',
            dragPos.value.x,
            dragPos.value.y,
            2,
            2
        )
        layoutStore.layout.shape = layoutStore.layout.shape.filter(
            (obj) => obj.i !== 'drop'
        )

        const windowId = layoutStore.nextLayoutId()
        layoutStore.layout.shape.push({
            x: dragPos.value.x,
            y: dragPos.value.y,
            w: 2,
            h: 2,
            i: windowId,
        })
        layoutStore.layout.windows[windowId] = {
            type: props.type,
            name: props.name,
            config: {},
        }
        layoutStore.panelGrid.dragEvent(
            'dragend',
            windowId,
            dragPos.value.x,
            dragPos.value.y,
            2,
            2
        )
    }
}
</script>
<template>
    <v-list-item
        @dragstart="dragstart"
        @drag="drag"
        @dragend="dragend"
        draggable="true"
        unselectable="on"
    >
        <v-list-item-content>
            <v-list-item-title>{{ props.name }}</v-list-item-title>
        </v-list-item-content>
    </v-list-item>
</template>
<style scoped></style>
