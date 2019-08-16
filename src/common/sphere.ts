import { floor } from './lib'

export function generateSphere(core: Array<number>, r: number, w: number, h: number) {
  let points: Float32Array = new Float32Array(w * (h + 1) * 4)
  // use UInt8Array if enough
  let indexesLength = (w * 2 + 2) * h
  let indexes: Uint16Array | Uint32Array
  if (points.length < 65535) {
    indexes = new Uint16Array(indexesLength)
  } else {
    indexes = new Uint32Array(indexesLength)
  }

  if (core[3] && core[3] !== 0.0) {
    core[0] /= core[3]
    core[1] /= core[3]
    core[2] /= core[3]
  }
  // push points
  for (let i = 0; i < w; ++i) {
    points[i * 4 + 0] = core[0]
    points[i * 4 + 1] = core[1] + r
    points[i * 4 + 2] = core[2]
    points[i * 4 + 3] = 1.0
  }
  for (let m = 1; m < h; ++m) {
    let yAngle = Math.PI / h * m
    let y = floor(Math.cos(yAngle) * r)
    let yr = Math.sin(yAngle) * r
    for (let n = 0; n < w; ++n) {
      let xAngle = Math.PI * 2 / w * n
      let offset = (w * m + n) * 4
      points[offset + 0] = core[0] + floor(yr * Math.cos(xAngle))
      points[offset + 1] = core[1] + y
      points[offset + 2] = core[2] + floor(yr * Math.sin(xAngle))
      points[offset + 3] = 1.0
    }
  }

  for (let i = 0; i < w; ++i) {
    let offset = (w * h + i) * 4
    points[offset + 0] = core[0]
    points[offset + 1] = core[1] - r
    points[offset + 2] = core[2]
    points[offset + 3] = 1.0
  }

  // push indexes
  for (let m = 0; m < h; ++m) {
    let offset = (w * 2 + 2) * m
    indexes[offset + 0] = (w * m)
    indexes[offset + 1] = (w * (m + 1))
    for (let n = 1; n < w; ++n) {
      if (w * m + n < w * (m + 1)) {
        indexes[offset + n * 2 + 0] = (w * m + n)
        indexes[offset + n * 2 + 1] = (w * (m + 1) + n)
      }
    }
    indexes[offset + w * 2 + 0] = (w * m)
    indexes[offset + w * 2 + 1] = (w * (m + 1))
  }

  return {
    points, indexes
  }
}

export function generateSphereLine(ws: number, hs: number) {
  let indexesLength = (ws * 3 + 1) * hs
  let indexes: Uint16Array | Uint32Array
  if (indexesLength < 65535) {
    indexes = new Uint16Array(indexesLength)
  } else {
    indexes = new Uint32Array(indexesLength)
  }

  let offset = 0
  for (let m = 1; m <= hs; ++m) {
    let circle = ws * m
    let lastCircle = circle - ws
    indexes[offset++] = circle
    indexes[offset++] = lastCircle
    for (let n = 1; n < ws; ++n) {
      indexes[offset++] = circle + n
      indexes[offset++] = lastCircle + n
    }
    indexes[offset++] = circle
    for (let w = 1; w < ws; ++w) {
      indexes[offset++] = circle + w
    }
    indexes[offset++] = circle
  }
  return indexes
}