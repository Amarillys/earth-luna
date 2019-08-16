export default function generateCircle(core: Array<number>, r: number, segments: number) {
  let points = new Float32Array(segments * 4)
  if (core[3] && core[3] !== 0.0) {
    core[0] /= core[3]
    core[1] /= core[3]
    core[2] /= core[3]
  }
  // push points
  for (let m = 0; m < segments; ++m) {
    let angle = 2 * Math.PI / segments * m
    points[m * 4 + 0] = floor(core[0] + r * Math.cos(angle))
    points[m * 4 + 1] = floor(core[1] + r * Math.sin(angle))
    points[m * 4 + 2] = core[2]
    points[m * 4 + 3] = 1.0
  }

  return {
    points
  }
}

function floor(num: number) {
  if (Math.abs(num) < 0.0001)
    return 0
  return num
}