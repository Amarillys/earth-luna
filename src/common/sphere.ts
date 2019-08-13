import { floor } from './lib'

export default class Sphere {
    points: Array<number> = []
    indexes: Array<number> = []
    core: Array<number>
    length: number
    widthSegments: number
    heightSegments: number
    constructor(core: Array<number>, length: number, widthSegments: number, heightSegments: number) {
        this.core = core
        this.length = length
        this.widthSegments = widthSegments
        this.heightSegments = heightSegments
        if (core[3] && core[3] !== 0.0) {
            core[0] /= core[3]
            core[1] /= core[3]
            core[2] /= core[3]
        }
        // push points
        for (let i = 0; i < this.widthSegments; ++i)
            this.points.push(core[0], this.length, core[2], 1.0)
        for (let m = 1; m < this.heightSegments; ++m) {
            let yAngle = Math.PI / this.heightSegments * m
            let y =  floor(Math.cos(yAngle) * length)
            let yr = Math.sin(yAngle) * length
            for (let n = 0; n < widthSegments; ++n) {
                let xAngle = Math.PI * 2 / widthSegments * n
                this.points.push(floor(yr * Math.cos(xAngle)) + core[0], y + core[1], floor(yr * Math.sin(xAngle) + core[2]), 1.0)
            }
        }
        for (let i = 0; i < widthSegments; ++i) {
            this.points.push(core[0], -length, core[2], 1.0)
        }

        // push indexes
        for (let m = 0; m < this.heightSegments; ++m) {
            this.indexes.push(widthSegments * m)
            this.indexes.push(widthSegments * (m + 1))
            for (let n = 0; n < this.widthSegments; ++n) {
                if (widthSegments * m + n + 1 < widthSegments * (m + 1)) {
                    this.indexes.push(widthSegments * m + n + 1)
                    this.indexes.push(widthSegments * (m + 1) + n + 1)
                }
            }
            this.indexes.push(widthSegments * m)
            this.indexes.push(widthSegments * (m + 1))
        }
    }
}
