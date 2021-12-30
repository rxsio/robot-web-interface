<template>
    <div class="cameras">
        <DragOutline
            v-if="dragState.outline"
            :positionX="dragState.outline.x"
            :positionY="dragState.outline.y"
            :height="dragState.outline.height"
            :width="dragState.outline.width"
            :label="dragState.data.label"
        />
        <DragItem
            :updateCurLoc="updateDragLoc"
            :dragStartCallback="
                () => {
                    this.dragState.data = { target: 'test', label: 'Test' }
                }
            "
        >
            <div style="background-color: green">Text</div>
        </DragItem>
        <div style="display: flex">
            <div
                class="dropTarget"
                style="background-color: aqua; width: 300px; height: 200px"
            />
            <div
                class="dropTarget"
                style="
                    background-color: red;
                    display: flex;
                    flex-grow: 1;
                    margin: 5px;
                "
            />
            <div
                class="dropTarget"
                style="
                    background-color: yellow;
                    display: flex;
                    flex-grow: 1;
                    margin: 5px;
                "
            />
            <div
                class="dropTarget"
                style="
                    background-color: purple;
                    display: flex;
                    flex-grow: 1;
                    margin: 5px;
                "
            />
        </div>
        <VideoStream :ros="ros" :webSocketHostname="webSocketHostname" />
    </div>
</template>
<script>
import DragOutline from '@/components/cameras/DragOutline.vue'
import DragItem from '@/components/cameras/DragItem.vue'
import VideoStream from '@/components/cameras/VideoStream.vue'
export default {
    components: { DragOutline, DragItem, VideoStream },
    name: 'Cameras',

    props: {
        ws_address: String,
        ros: Object,
    },

    data() {
        return {
            dragState: {
                outline: null,
                data: null,
            },
        }
    },

    computed: {
        webSocketHostname() {
            return new URL(this.ws_address).hostname
        },
    },

    mounted() {
        // If ROS got disconnected, return to home
        if (this.ros == null) {
            this.$router.push({
                name: 'Home',
            })
        }
    },
    methods: {
        updateDragLoc(x, y) {
            // if we get null for the input we know the drag has finished
            if (x === null && y === null) {
                this.endDrag()
                return
            }

            // find the element that is a drop target under the cursor
            // null if none of the elements under the cursor are a drop target
            let dropTarget =
                document
                    .elementsFromPoint(x, y)
                    .filter((element) =>
                        element.classList.contains('dropTarget')
                    )[0] || null

            if (dropTarget) {
                // get the bounding box of the target and set the outline to it
                let rect = dropTarget.getBoundingClientRect()
                this.dragState.outline = {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                }
            } else {
                // move the outline to the cursor otherwise
                this.dragState.outline = {
                    x: x - 50,
                    y: y - 50,
                    width: 100,
                    height: 100,
                }
            }
        },
        endDrag() {
            this.dragState.outline = null
            this.dragState.data = null
        },
    },
    beforeDestroy() {
        // Reloading page when going back
        window.location.reload()
    },
}
</script>
