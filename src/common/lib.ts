export function getPointOfCircle(value: number, cycle: number) {
    let angle = (value % cycle) / cycle * 2 * Math.PI
    let x = floor(Math.cos(angle))
    let y = floor(Math.sin(angle))
    return {
        x: x,
        y: y
    }
}

export function floor(num: number, accurate: number = 0.001) {
    if (Math.abs(num) < accurate)
        return 0
    return num
}