export default class Sphere {
    points: Array<number> = []
    core: Array<number>
    length: number
    segments: number
    constructor(core: Array<number>, length: number, segments: number) {
        this.core = core
        this.length = length
        this.segments = segments
        if (core[3] && core[3] !== 0.0) {
            core[0] /= core[3]
            core[1] /= core[3]
            core[2] /= core[3]
        }
        // push points
        for (let m = 0; m <= this.segments; ++m) {
            let angle = 2 * Math.PI / this.segments * m
            this.points.push(
                floor(core[0] + this.length * Math.cos(angle)),
                floor(core[1] + this.length * Math.sin(angle)),
                core[2],
                1.0
            )
        }
    }
}

function floor(num: number) {
    if (Math.abs(num) < 0.0001)
        return 0
    return num
}