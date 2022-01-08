export default (layout, rect) => {
    let streamData = layout.streams
    let variant = layout.variant

    // get all coordinates and mid points
    if (!rect) return []
    let x = [rect.x, rect.x + rect.width / 2]
    let y = [rect.y, rect.y + rect.height / 2]
    let width = [rect.width / 2, rect.width]
    let height = [rect.height / 2, rect.height]

    // definitions of all possible shapes
    // indexes mean which versions to choose of: x, y, width, height
    const outlineShapes = {
        full: [0, 0, 1, 1],
        top: [0, 0, 1, 0],
        bottom: [0, 1, 1, 0],
        left: [0, 0, 0, 1],
        right: [1, 0, 0, 1],
        topLeft: [0, 0, 0, 0],
        topRight: [1, 0, 0, 0],
        bottomLeft: [0, 1, 0, 0],
        bottomRight: [1, 1, 0, 0],
    }

    // definitions of variants of item layouts
    // specifically chosen orders, that allow easy rotations
    const layoutMap = {
        0: { 0: [] },
        1: { 0: ['full'] },
        2: {
            0: ['left', 'right'],
            1: ['top', 'bottom'],
        },
        3: {
            0: ['top', 'bottomRight', 'bottomLeft'],
            1: ['right', 'bottomLeft', 'topLeft'],
            2: ['bottom', 'topLeft', 'topRight'],
            3: ['left', 'topRight', 'bottomRight'],
        },
        4: {
            0: ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'],
        },
    }[streamData.length][variant]

    // create final coordinate data and add stream information
    return streamData.map((stream, index) => {
        let shape = outlineShapes[layoutMap[index]]
        return {
            x: x[shape[0]],
            y: y[shape[1]],
            width: width[shape[2]],
            height: height[shape[3]],
            data: stream,
        }
    })
}
