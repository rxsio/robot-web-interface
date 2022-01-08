<template>
    <div class="container">
        <DragItem :extraData="{ topic: 'test', label: 'Test' }">
            <div class="list-element" style="background-color: pink">Test</div>
        </DragItem>
        <DragItem
            v-for="topic in topics"
            :key="topic"
            :extraData="{ topic, label: topic }"
        >
            <div class="list-element">{{ topic }}</div>
        </DragItem>
        <div style="flex-grow: 1" />
        <button @click="exportConfig">Export layout</button>

        <button>
            <label htmlFor="test">
                Import layout
                <input
                    id="test"
                    type="file"
                    hidden
                    accept=".json"
                    @change="importConfig"
                />
            </label>
        </button>
    </div>
</template>
<script>
import getImageTopics from '@/components/cameras/getImageTopics'
import DragItem from '@/components/cameras/DragItem'
export default {
    components: { DragItem },
    props: {
        ros: Object, // should be a global
        layout: Object,
    },
    data() {
        return {
            topics: [],
        }
    },
    methods: {
        exportConfig() {
            let dataStr =
                'data:text/json;charset=utf-8,' +
                encodeURIComponent(JSON.stringify(this.layout))

            let downloadAnchorNode = document.createElement('a')
            downloadAnchorNode.setAttribute('href', dataStr)
            downloadAnchorNode.setAttribute(
                'download',
                'siriusCameraConfig.json'
            )
            document.body.appendChild(downloadAnchorNode)
            downloadAnchorNode.click()
            downloadAnchorNode.remove()
        },
        importConfig(evt) {
            const func = async () => {
                if (evt.target?.files?.[0]) {
                    const newLayout = JSON.parse(
                        await evt.target.files[0].text()
                    )

                    this.$emit('changeLayout', newLayout)
                }
            }
            func()
        },
    },
    mounted() {
        getImageTopics(this.ros).then((newTopics) => (this.topics = newTopics))
    },
}
</script>
<style scoped>
.container {
    display: flex;
    flex-direction: row;
}
.list-element {
    margin: 10px;
    background-color: lightblue;
    padding: 10px;
}
</style>
