import * as mat4 from 'gl-matrix/esm/mat4'
// import { mat4 } from 'gl-matrix'
import Slider from './component/slider'
import { WebGL as WebGLProgram, InputData, GLContext } from './common/webgl'
import Sphere from './common/sphere'
import Circle from './common/circle'

const vsSource = `
  attribute vec4 vertexPosition;
  attribute vec4 vertexColor;

  uniform mat4 viewMatrix;
  uniform mat4 transFormMatrix;
  varying lowp vec4 vColor;

  void main(void) {
    gl_Position = viewMatrix * transFormMatrix * vertexPosition;
    vColor = vertexColor;
  }
`;

const fsSource = `
  precision mediump float;
  varying lowp vec4 vColor;

  void main() {
    gl_FragColor = vColor;
  }
`;

const earth = new Sphere([0.0, 0.0, 0.0], 0.01593, 32, 32)
const earthColors = [];
for (let i = 0, len = earth.points.length / 4; i < len; ++i) {
  if (i > len / 3 || i % 6 == 0) {
    earthColors.push(Math.random() * 0.45, Math.random() * 0.45, 0.87, 0.95)
  } else {
    earthColors.push(Math.random() * 0.05, Math.random() * 0.05, 0.7, 0.92)
  }
}

export function draw(gl: WebGLRenderingContext) {
  gl.enable(GLContext.BLEND)
  gl.blendFunc(GLContext.SRC_ALPHA, GLContext.ONE_MINUS_SRC_ALPHA)
  const rate = gl.canvas.width / gl.canvas.height
  let timing = 0

  let earthProgram = new WebGLProgram(gl)
  earthProgram.initShader(vsSource, fsSource)
  function drawEarth() {
    let position = new InputData('vertexPosition', earth.points, Float32Array)
    let index = new InputData('index', earth.indexes, Float32Array, true)
    let color = new InputData('vertexColor', earthColors, Float32Array)

    let viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix, [0.0, 0.0, 0.0], [0.0, 0.0, -1.0], [0.0, 1.0, 0.0])
    let view = new InputData('viewMatrix', viewMatrix ,Float32Array)

    let transMatrix = mat4.create()
    mat4.scale(transMatrix, transMatrix, [gl.canvas.height / gl.canvas.width, 1, 1])
    mat4.rotate(transMatrix, transMatrix, timing * 0.005, [1, 1, 1])
    let transform = new InputData('transFormMatrix', transMatrix ,Float32Array)
    earthProgram.draw([position, color, transform, view, index], (gl: WebGLRenderingContext) => {
      gl.drawElements(GLContext.TRIANGLE_STRIP, earth.indexes.length, GLContext.UNSIGNED_SHORT, 0)
    })
  }

  let moonProgram = new WebGLProgram(gl)
  moonProgram.initShader(vsSource, fsSource)
  const moon = new Sphere([0.961, 0.0, 0.0], 0.00434, 32, 32)
  const moonColors = [];
    for (let i = 0, len = moon.points.length / 4; i < len; ++i) {
      moonColors.push(0.8, 0.95, 0.95, 0.98)
  }
  function drawMoon() {
    let position = new InputData('vertexPosition', moon.points, Float32Array)
    let index = new InputData('index', moon.indexes, Float32Array, true)
    let color = new InputData('vertexColor', moonColors, Float32Array)

    let viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix, [0.0, 0.0, 0.0], [0.0, 0.0, -1.0], [0.0, 1.0, 0.0])
    let view = new InputData('viewMatrix', viewMatrix ,Float32Array)

    let transMatrix = mat4.create()
    mat4.scale(transMatrix, transMatrix, [gl.canvas.height / gl.canvas.width, 1, 1])
    mat4.rotate(transMatrix, transMatrix, timing * 0.002, [0, 0, 1])
    let transform = new InputData('transFormMatrix', transMatrix ,Float32Array)
    moonProgram.draw([position, color, transform, view, index], (gl: WebGLRenderingContext) => {
      gl.drawElements(GLContext.TRIANGLE_STRIP, moon.indexes.length, GLContext.UNSIGNED_SHORT, 0)
    })
  }

  let traceProgram = new WebGLProgram(gl)
  traceProgram.initShader(vsSource, fsSource)
  const trace = new Circle([0.0, 0.0, 0.0], 0.961, 128)
  const traceColor = [];
    for (let i = 0, len = trace.points.length / 4; i < len; ++i) {
      traceColor.push(0.95, 0.95, 0.95, 0.98)
  }
  function drawTrace() {
    let position = new InputData('vertexPosition', trace.points, Float32Array)
    let color = new InputData('vertexColor', traceColor, Float32Array)

    let viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix, [0.0, 0.0, 0.0], [0.0, 0.0, -1.0], [0.0, 1.0, 0.0])
    let view = new InputData('viewMatrix', viewMatrix ,Float32Array)

    let transMatrix = mat4.create()
    mat4.scale(transMatrix, transMatrix, [gl.canvas.height / gl.canvas.width, 1, 1])
    let transform = new InputData('transFormMatrix', transMatrix ,Float32Array)
    traceProgram.draw([position, color, transform, view], (gl: WebGLRenderingContext) => {
      gl.drawArrays(GLContext.LINE_LOOP, 0, trace.points.length)
    })
  }
  function update() {
    timing++
    gl.clear(GLContext.COLOR_BUFFER_BIT | GLContext.DEPTH_BUFFER_BIT);
    drawEarth()
    drawMoon()
    drawTrace()
    window.requestAnimationFrame(update)
  }
  window.requestAnimationFrame(update)
}
