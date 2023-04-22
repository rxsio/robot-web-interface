export const createController = (
    linscale,
    shape,
    deadzone = 0,
    inertia = 0,
    accuracy = 0.01
) => {
    return {
        linearScale: linscale,
        shapeCoefficient: shape,
        deadzone: deadzone,
        inertia: inertia,
        accuracy: accuracy,
        value: 0,
        setCommand: function (command) {
            command =
                Math.abs(command) < this.deadzone
                    ? 0
                    : (command - Math.sign(command) * this.deadzone) /
                      (1.0 - this.deadzone)

            this.value =
                this.value * this.inertia + (1.0 - this.inertia) * command

            if (Math.abs(this.value) < this.accuracy) this.value = 0
        },
        getResult: function () {
            return (
                Math.sign(this.value) *
                Math.pow(Math.abs(this.value), this.shapeCoefficient) *
                this.linearScale
            )
        },
    }
}
