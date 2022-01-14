export const addToLayout = (layout, newStream, cursorSector) => {
    const streamData = layout.streams
    const variant = layout.variant

    if (streamData.length === 0) {
        return { streams: [newStream], variant: 0 }
    }
    if (streamData.length === 1) {
        const [a] = streamData
        switch (cursorSector) {
            case 1:
                return { streams: [newStream, a], variant: 1 }
            case 3:
                return { streams: [a, newStream], variant: 0 }
            case 5:
                return { streams: [a, newStream], variant: 1 }
            case 7:
                return { streams: [newStream, a], variant: 0 }
        }
    }
    if (streamData.length === 2) {
        if (cursorSector === 8) return layout

        let [a, b] = streamData
        let variantOffset = 0

        // if horizontal, rotate by 90 degrees clockwise and mirror to match vertical
        // decreasing the offset by 1 to remember to rotate back
        if (variant === 1) {
            cursorSector += 2
            cursorSector %= 8
            variantOffset -= 1
            ;[a, b] = [b, a]
        }

        // if the sector is in the bottom half, it's equivalent to
        // the top variant rotated and mirrored
        if (cursorSector >= 4) {
            cursorSector -= 4
            variantOffset += 2
            ;[a, b] = [b, a]
        }

        let result = null
        switch (cursorSector) {
            case 0:
                result = { streams: [b, a, newStream], variant: 1 }
                break
            case 1:
                result = { streams: [newStream, b, a], variant: 4 }
                break
            case 2:
                result = { streams: [a, newStream, b], variant: 3 }
                break
            default:
                return layout
        }

        // undo rotations from the beginning
        result.variant += variantOffset
        result.variant %= 4
        return result
    }
    if (streamData.length === 3) {
        if (cursorSector === 8) return layout

        // reduce all variants to the one 0th one
        cursorSector -= variant * 2
        cursorSector += 8
        cursorSector %= 8

        const [a, b, c] = streamData
        let result = null
        switch (cursorSector) {
            case 0:
                result = { streams: [newStream, a, b, c], variant: 0 }
                break
            case 2:
                result = { streams: [a, newStream, b, c], variant: 0 }
                break
            case 4:
                result = { streams: [a, b, newStream, c], variant: 0 }
                break
            case 6:
                result = { streams: [c, a, b, newStream], variant: 0 }
                break
            default:
                return layout
        }

        // undo the rotation from the beginning
        for (let i = 0; i < variant; i++) {
            result.streams.unshift(result.streams.pop())
        }
        return result
    }
    if (streamData.length === 4) {
        return layout
    }
    return layout
}

export const removeFromLayout = (layout, removeIndex) => {
    const streamData = layout.streams
    const variant = layout.variant

    if (streamData.length === 1) {
        return { streams: [], variant: 0 }
    }
    if (streamData.length === 2) {
        return { streams: [streamData[(removeIndex + 1) % 2]], variant: 0 }
    }
    if (streamData.length === 3) {
        const [a, b, c] = streamData
        let result = null
        switch (removeIndex) {
            case 0:
                result = { streams: [c, b], variant: variant % 2 }
                break
            case 1:
                result = { streams: [a, c], variant: (variant + 1) % 2 }
                break
            case 2:
                result = { streams: [a, b], variant: (variant + 1) % 2 }
                break
        }

        // fix variants 1 and 2 which are upside-down which makes the result mirrored
        if (variant == 1 || variant == 2) {
            result.streams.unshift(result.streams.pop())
        }
        return result
    }
    if (streamData.length === 4) {
        // arbitrarily choose vertical neighbours
        const [a, b, c, d] = streamData
        switch (removeIndex) {
            case 0:
                return { streams: [d, b, c], variant: 3 }
            case 1:
                return { streams: [c, d, a], variant: 1 }
            case 2:
                return { streams: [b, d, a], variant: 1 }
            case 3:
                return { streams: [a, b, c], variant: 3 }
        }
    }
    return layout
}
