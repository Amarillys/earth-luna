import * as mat4 from 'gl-matrix/esm/mat4'
// import { mat4 } from 'gl-matrix'
import { WebGL as WebGLProgram, InputData, GLContext } from './common/webgl'
import Circle from './common/circle'
import { Sphere, generateSphereLine } from './common/sphere'

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

export function draw(gl: WebGLRenderingContext, options) {
  gl.enable(GLContext.BLEND)
  gl.blendFunc(GLContext.SRC_ALPHA, GLContext.ONE_MINUS_SRC_ALPHA)
  let timing = 0

  let earthProgram = new WebGLProgram(gl)
  earthProgram.initShader(vsSource, fsSource)
  function drawEarth(transformMatrix: mat4, viewMatrix: mat4, earth) {
    let position = new InputData('vertexPosition', earth.points, Float32Array)
    let index = new InputData('index', earth.indexes, Float32Array, true)
    let color = new InputData('vertexColor', earth.colors, Float32Array)

    mat4.rotate(transformMatrix, transformMatrix, timing * 0.005, [1, 1, 1])
    let transform = new InputData('transFormMatrix', transformMatrix ,Float32Array)
    let view = new InputData('viewMatrix', viewMatrix, Float32Array);
    earthProgram.draw([position, color, transform, view, index], (gl: WebGLRenderingContext) => {
      gl.drawElements(GLContext.TRIANGLE_STRIP, earth.indexes.length, GLContext.UNSIGNED_SHORT, 0)
    })
  }

  let earthLineProgram = new WebGLProgram(gl)
  earthLineProgram.initShader(vsSource, fsSource)
  function drawEarthLine(transformMatrix: mat4, viewMatrix: mat4, earthLine) {
    let position = new InputData('vertexPosition', earthLine.points, Float32Array)
    let index = new InputData('index', earthLine.indexes, Float32Array, true)
    let color = new InputData('vertexColor', earthLine.colors, Float32Array)

    mat4.rotate(transformMatrix, transformMatrix, timing * 0.005, [1, 1, 1])
    let transform = new InputData('transFormMatrix', transformMatrix ,Float32Array)
    let view = new InputData('viewMatrix', viewMatrix, Float32Array);
    earthProgram.draw([position, color, transform, view, index], (gl: WebGLRenderingContext) => {
      gl.drawElements(GLContext.LINE_LOOP, earthLine.indexes.length, GLContext.UNSIGNED_SHORT, 0)
    })
  }

  let moonProgram = new WebGLProgram(gl)
  moonProgram.initShader(vsSource, fsSource)
  function drawMoon(transformMatrix: mat4, viewMatrix: mat4, moon) {
    let position = new InputData('vertexPosition', moon.points, Float32Array)
    let index = new InputData('index', moon.indexes, Float32Array, true)
    let color = new InputData('vertexColor', moon.colors, Float32Array)

    mat4.rotate(transformMatrix, transformMatrix, timing * 0.001, [0, 0, 1])
    let transform = new InputData('transFormMatrix', transformMatrix ,Float32Array)
    let view = new InputData('viewMatrix', viewMatrix, Float32Array);
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
  function drawTrace(transformMatrix: mat4, viewMatrix: mat4) {
    let position = new InputData('vertexPosition', trace.points, Float32Array)
    let color = new InputData('vertexColor', traceColor, Float32Array)

    let transform = new InputData('transFormMatrix', transformMatrix ,Float32Array)
    let view = new InputData('viewMatrix', viewMatrix, Float32Array);
    traceProgram.draw([position, color, transform, view], (gl: WebGLRenderingContext) => {
      gl.drawArrays(GLContext.LINE_LOOP, 0, trace.points.length)
    })
  }

  let translate = {
    movementX: 0,
    movementY: 0,
    set moveX (x: number) {
      let result = this.movementX + x
      if (result >= -Math.PI && result <= Math.PI) {
        this.movementX = result
      }
    },
    set moveY (y: number) {
      let result = this.movementY + y
      if (result >= -1 && result <= 1) {
        this.movementY = result
      }
    }
  }
  function update() {
    timing++

    // common matrix - view matrix and transform matrix
    let viewMatrix = mat4.create()
    mat4.lookAt(viewMatrix,
      [0.0, 0.0, 0.0],
      [0.0, 0.0, -1.0], [0.0, 1.0, 0.0])

    let transMatrix = mat4.create()
    mat4.scale(transMatrix,
      transMatrix,
      [gl.canvas.height / gl.canvas.width * options.scale, options.scale, options.scale])
    mat4.rotate(transMatrix, transMatrix, timing * 0.0002, [1, 0.5, 1])

    gl.clear(GLContext.COLOR_BUFFER_BIT | GLContext.DEPTH_BUFFER_BIT);

    let earth = new Sphere([0.0, 0.0, 0.0], options.earthR, options.w, options.h)
    for (let i = 0, len = earth.points.length / 4; i < len; ++i) {
      earth.colors.push(options.R, options.G, options.B, options.A)
    }
    drawEarth(mat4.clone(transMatrix), mat4.clone(viewMatrix), earth)
    
    let earthLine = {
      points: earth.points,
      indexes: generateSphereLine(options.w, options.h),
      colors: new Array(earth.colors.length).fill(0.85)
    }
    drawEarthLine(mat4.clone(transMatrix), mat4.clone(viewMatrix), earthLine)
    
    let moon = new Sphere([0.961, 0.0, 0.0], options.moonR, options.w, options.h)
    for (let i = 0, len = moon.points.length / 4; i < len; ++i) {
      moon.colors.push(0.7, 0.8, 0.85, 0.95)
    }
    drawMoon(mat4.clone(transMatrix), mat4.clone(viewMatrix), moon)
    drawTrace(mat4.clone(transMatrix), mat4.clone(viewMatrix))
    window.requestAnimationFrame(update)
  }
  window.requestAnimationFrame(update)

  // register mouse event
  gl.canvas.addEventListener('wheel', event => {
    options.scale = options.scale + event.deltaY * -0.01 * 0.20
  })

  let draggabel = false
  gl.canvas.addEventListener('mousemove', event => {
    if (!draggabel) {
      return
    }
    translate.moveX = event.movementX / 200
    translate.moveY = event.movementY / 200
    event.preventDefault()
  })

  gl.canvas.addEventListener('mousedown', event => {
    draggabel = true
    event.preventDefault()
  })

  document.addEventListener('mouseup', () => draggabel = false)
}
