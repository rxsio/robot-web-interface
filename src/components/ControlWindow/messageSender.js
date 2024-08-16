import { Message, Topic } from 'roslib'
import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useRoverSender(
    ros,
    elements,
    controllers,
    carMode,
    getCommands
) {
    const commandInterval = ref(null)
    const messageRate = 100 // [ms]

    onMounted(() => {
        // Start publishing steering informations
        const topic = new Topic({
            ros: ros,
            name: '/cmd_vel',
            messageType: 'geometry_msgs/Twist',
        })

        commandInterval.value = setInterval(() => {
            // Get raw user commands
            const commands = getCommands()

            // Include modifications
            commands.forEach((value, index) => {
                controllers.value[index].setCommand(value)
            })

            let message = new Message({
                linear: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                angular: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
            })

            message.linear.x =
                controllers.value[0].getResult() *
                0.01 *
                elements.value[0].speedPercentage
            if (carMode.value) {
                message.angular.z =
                    (message.linear.x / controllers.value[0].linearScale) *
                    controllers.value[1].linearScale *
                    Math.tan(
                        (Math.PI / 4) *
                            (controllers.value[1].getResult() /
                                controllers.value[1].linearScale) *
                            0.01 *
                            elements.value[1].speedPercentage
                    )
            } else {
                message.angular.z =
                    controllers.value[1].getResult() *
                    0.01 *
                    elements.value[1].speedPercentage
            }

            topic.publish(message)
        }, messageRate)
    })

    onBeforeUnmount(() => {
        clearInterval(commandInterval.value)
    })
}

export function useManipSender(ros, elements, controllers, getCommands) {
    const commandInterval = ref(null)
    const messageRate = 100 // [ms]

    onMounted(() => {
        // Start publishing steering informations
        const manipTopic = new Topic({
            ros: ros,
            name: '/cmd_manip',
            messageType: 'geometry_msgs/Twist',
        })
        const gripperTopic = new Topic({
            ros: ros,
            name: '/cmd_grip',
            messageType: 'std_msgs/Float64',
        })

        commandInterval.value = setInterval(() => {
            // Get raw user commands
            const commands = getCommands()

            // Include modifications
            commands.forEach((value, index) => {
                controllers.value[index].setCommand(value)
            })

            let manipMessage = new Message({
                linear: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                angular: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
            })
            let gripperMessage = new Message({
                data: 0,
            })

            ;[
                manipMessage.linear.x,
                manipMessage.linear.y,
                manipMessage.linear.z,
                manipMessage.angular.x,
                manipMessage.angular.y,
                gripperMessage.data,
            ] = controllers.value.map(
                (controller, index) =>
                    controller.getResult() *
                    0.01 *
                    elements.value[index].speedPercentage
            )

            manipTopic.publish(manipMessage)
            gripperTopic.publish(gripperMessage)
        }, messageRate)
    })

    onBeforeUnmount(() => {
        clearInterval(commandInterval.value)
    })
}
