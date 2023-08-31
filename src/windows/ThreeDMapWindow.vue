<script setup>
import { ref, defineProps, onMounted, watch, computed } from 'vue'

import * as THREE from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
    computeBoundsTree,
    disposeBoundsTree,
    acceleratedRaycast,
} from 'three-mesh-bvh'

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

import ROSLIB from 'roslib'
import { useRosStore } from '@/stores'
import { onRosConnected } from '@/misc/roslibExtensions'

const props = defineProps(['windowDimensions'])
const width = computed(() => props.windowDimensions.width)
const height = computed(() => props.windowDimensions.height)

const WebGLAvailable = WebGL.isWebGLAvailable()

const canvas = ref(null)

const scene = ref(null)
const renderer = ref(null)
const camera = ref(null)
const controls = ref(null)

const rosStore = useRosStore()
const transform = ref(null)

const robot = ref(null)
const map = ref(null)
const robotTransfrom = ref(null)
const snapToGround = ref(true)

const axes = ref(null)

const initializeTF2 = () => {
    var tfClient = new ROSLIB.TFClient({
        ros: rosStore.ros,
        fixedFrame: 'map',
        angularThres: 0.01,
        transThres: 0.01,
    })

    tfClient.subscribe('base_link', function (tf) {
        transform.value = tf
    })
}

const initScene = () => {
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1)

    scene.value = new THREE.Scene()
    camera.value = new THREE.PerspectiveCamera(
        60,
        width.value / height.value,
        0.1,
        1000
    )

    renderer.value = new THREE.WebGLRenderer({
        canvas: canvas.value,
        antialias: true,
    })
    renderer.value.setSize(width.value, height.value)

    controls.value = new OrbitControls(camera.value, renderer.value.domElement)
    controls.value.enableDamping = true
    controls.value.screenSpacePanning = false
    controls.value.zoomToCursor = true

    scene.value.useRightHandedSystem = true
    scene.value.background = new THREE.Color(0x263238)

    camera.value.position.x = -15
    camera.value.position.y = 15
    camera.value.position.z = 15
    camera.value.lookAt(0, 0, -10)
    controls.value.update()
}

const initLight = () => {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3)
    hemiLight.position.set(0, 0, 20)
    scene.value.add(hemiLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 2)
    dirLight.position.set(3, 10, 10)
    scene.value.add(dirLight)
}

const loadModels = () => {
    const loader = new THREE.TextureLoader()
    const texture = loader.load('/models/textures/topology_v2.png')
    texture.colorSpace = THREE.SRGBColorSpace
    texture.flipY = false

    new GLTFLoader().load(
        //'/models/marsyard_cleaned_v2.glb',
        '/models/marsyard_2022.glb',
        (gltf) => {
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    if (child.material.map) {
                        //child.material.map = texture
                        //child.material.map.needsUpdate = true
                    }
                    child.geometry.computeBoundsTree()
                }
            })

            gltf.scene.rotateX(Math.PI / 2)

            map.value = gltf.scene

            scene.value.add(gltf.scene)
        },
        undefined,
        (error) => {
            console.error(error)
        }
    )

    const axesHelper = new THREE.AxesHelper(3)
    scene.value.add(axesHelper)

    axes.value = axesHelper

    new GLTFLoader().load(
        '/models/sirius2.glb',
        (gltf) => {
            gltf.scene.rotateX(Math.PI / 2)
            gltf.scene.traverse((child) => {
                if (child.material) child.material.metalness = 0
                if (child.isMesh) {
                    child.rotateX(Math.PI / 2)
                    child.rotateY(Math.PI)
                }
            })

            robot.value = gltf.scene

            scene.value.add(gltf.scene)
        },
        undefined,
        (error) => {
            console.error(error)
        }
    )
}

const snapToMap = (position) => {
    if (!map.value) return position.z

    const raycaster = new THREE.Raycaster()
    raycaster.set(
        new THREE.Vector3(position.x, position.y, position.z + 100),
        new THREE.Vector3(0, 0, -1)
    )
    raycaster.firstHitOnly = true

    const intersections = raycaster.intersectObject(map.value, true)
    if (intersections.length === 0) return position.z

    const z = intersections[0].point.z + 0.2

    return z
}

watch([transform, robot], () => {
    if (transform.value && robot.value) {
        const tf = transform.value
        const newPosition = new THREE.Vector3(
            tf.translation.x,
            tf.translation.y,
            tf.translation.z
        )
        const newRotation = new THREE.Quaternion(
            tf.rotation.x,
            tf.rotation.y,
            tf.rotation.z,
            tf.rotation.w
        )

        const axis = new THREE.Vector3(0, 0, 1)
        const theta = -144.1 * THREE.MathUtils.DEG2RAD
        newPosition.applyAxisAngle(axis, theta)
        newRotation.multiplyQuaternions(
            new THREE.Quaternion().setFromAxisAngle(axis, theta),
            newRotation
        )

        if (snapToGround.value) {
            newPosition.z = snapToMap(robot.value.position)
        }

        robotTransfrom.value = {
            position: newPosition,
            rotation: newRotation,
        }
    }
})

const initializeThreeJS = () => {
    initScene()
    initLight()
    loadModels()

    renderer.value.render(scene.value, camera.value)

    const animate = () => {
        requestAnimationFrame(animate)

        if (robotTransfrom.value) {
            robot.value.position.lerp(robotTransfrom.value.position, 0.1)
            robot.value.quaternion.slerp(robotTransfrom.value.rotation, 0.1)
            axes.value.position = robotTransfrom.value.position
            axes.value.rotation.setFromQuaternion(robotTransfrom.value.rotation)

            controls.value.target = robot.value.position
        }
        controls.value.update()
        renderer.value.render(scene.value, camera.value)
    }
    animate()
}

onMounted(() => {
    initializeThreeJS()
    if (rosStore.connected) {
        initializeTF2()
    }
})

onRosConnected(() => {
    initializeTF2()
})

watch([width, height], () => {
    renderer.value.setSize(width.value, height.value, false)
    camera.value.aspect = width.value / height.value
    camera.value.updateProjectionMatrix()

    renderer.value.render(scene.value, camera.value)
})
</script>
<template>
    <div>
        <canvas
            v-if="WebGLAvailable"
            :width="width"
            :height="height"
            ref="canvas"
        />
        <span v-else>WebGL not available, you need a newer browser</span>
    </div>
</template>
<style scoped></style>
