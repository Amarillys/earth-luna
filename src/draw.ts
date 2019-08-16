import * as mat4 from 'gl-matrix/esm/mat4'
// import { mat4 } from 'gl-matrix'
import { WebGL as WebGLProgram, InputData, GLContext } from './common/webgl'
import generateCircle from './common/circle'
import Cache from './component/cache'
import { generateSphere, generateSphereLine } from './common/sphere'

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

const cache = new Cache()
export function draw(gl: WebGLRenderingContext, options) {
  gl.enable(GLContext.BLEND)
  gl.blendFunc(GLContext.SRC_ALPHA, GLContext.ONE_MINUS_SRC_ALPHA)
  let timing = 0

  let earthProgram = new WebGLProgram(gl)
  earthProgram.initShader(vsSource, fsSource)
  function drawEarth(transformMatrix: mat4, viewMatrix: mat4, earth, colors) {
    let position = new InputData('vertexPosition', earth.points)
    let index = new InputData('index', earth.indexes, true)
    let color = new InputData('vertexColor', colors)

    mat4.rotate(transformMatrix, transformMatrix, timing * 0.005, [1, 1, 1])
    let transform = new InputData('transFormMatrix', transformMatrix)
    let view = new InputData('viewMatrix', viewMatrix);
    earthProgram.draw([position, color, transform, view, index], (gl: WebGLRenderingContext) => {
      gl.drawElements(GLContext.TRIANGLE_STRIP, earth.indexes.length, GLContext.UNSIGNED_SHORT, 0)
    })
  }

  let earthLineProgram = new WebGLProgram(gl)
  earthLineProgram.initShader(vsSource, fsSource)
  function drawEarthLine(transformMatrix: mat4, viewMatrix: mat4, earthLine) {
    let position = new InputData('vertexPosition', earthLine.points)
    let index = new InputData('index', earthLine.indexes, true)
    let color = new InputData('vertexColor', earthLine.colors)

    mat4.rotate(transformMatrix, transformMatrix, timing * 0.005, [1, 1, 1])
    let transform = new InputData('transFormMatrix', transformMatrix)
    let view = new InputData('viewMatrix', viewMatrix);
    earthProgram.draw([position, color, transform, view, index], (gl: WebGLRenderingContext) => {
      gl.drawElements(GLContext.LINE_LOOP, earthLine.indexes.length, GLContext.UNSIGNED_SHORT, 0)
    })
  }

  let moonProgram = new WebGLProgram(gl)
  moonProgram.initShader(vsSource, fsSource)
  function drawMoon(transformMatrix: mat4, viewMatrix: mat4, moon, colors) {
    let position = new InputData('vertexPosition', moon.points)
    let index = new InputData('index', moon.indexes, true)
    let color = new InputData('vertexColor', colors)

    mat4.rotate(transformMatrix, transformMatrix, timing * 0.001, [0, 0, 1])
    let transform = new InputData('transFormMatrix', transformMatrix)
    let view = new InputData('viewMatrix', viewMatrix);
    moonProgram.draw([position, color, transform, view, index], (gl: WebGLRenderingContext) => {
      gl.drawElements(GLContext.TRIANGLE_STRIP, moon.indexes.length, GLContext.UNSIGNED_SHORT, 0)
    })
  }

  let traceProgram = new WebGLProgram(gl)
  traceProgram.initShader(vsSource, fsSource)
  const trace = generateCircle([0.0, 0.0, 0.0], 0.961, 128)
  const traceColor = new Float32Array(new Array(trace.points.length).fill(0.95))
  function drawTrace(transformMatrix: mat4, viewMatrix: mat4) {
    let position = new InputData('vertexPosition', trace.points)
    let color = new InputData('vertexColor', traceColor)

    let transform = new InputData('transFormMatrix', transformMatrix)
    let view = new InputData('viewMatrix', viewMatrix);
    traceProgram.draw([position, color, transform, view], (gl: WebGLRenderingContext) => {
      gl.drawArrays(GLContext.LINE_LOOP, 0, trace.points.length / 4)
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

    let earth = cache.get('earth', JSON.stringify({
      r: options.earthR,
      w: options.w,
      h: options.h
    }), status => generateSphere([0.0, 0.0, 0.0], status.r, status.w, status.h))
    let earthColors = cache.get('earthColor', JSON.stringify({
      w: options.w,
      h: options.h,
      R: options.R,
      G: options.G,
      B: options.B,
      A: options.A
    }), status => {
      let colors = new Float32Array(status.w * (status.h + 1) * 4)
      for (let i = 0; i < colors.length / 4; ++i) {
        colors[i * 4 + 0] = status.R
        colors[i * 4 + 1] = status.G
        colors[i * 4 + 2] = status.B
        colors[i * 4 + 3] = status.A
      }
      return colors
    })
    drawEarth(mat4.clone(transMatrix), mat4.clone(viewMatrix), earth, earthColors)

    let earthLine = {
      points: earth.points,
      indexes: cache.get('earthLineIndex', JSON.stringify({
        w: options.w,
        h: options.h
      }), status => generateSphereLine(status.w, status.h)),
      colors: Float32Array.from(new Array(earthColors.length).fill(0.85))
    }
    drawEarthLine(mat4.clone(transMatrix), mat4.clone(viewMatrix), earthLine)

    let moon = cache.get('moon', JSON.stringify({
      r: options.moonR,
      w: options.w,
      h: options.h
    }), status => generateSphere([0.961, 0.0, 0.0], status.r, status.w, status.h))
    let moonColors = cache.get('moonColors', JSON.stringify({
      w: options.w,
      h: options.h,
    }), status => {
      let colors = new Float32Array(status.w * (status.h + 1) * 4)
      for (let i = 0; i < colors.length / 4; ++i) {
        colors[i * 4 + 0] = 0.7
        colors[i * 4 + 1] = 0.8
        colors[i * 4 + 2] = 0.85
        colors[i * 4 + 3] = 0.95
      }
      return colors
    })
    drawMoon(mat4.clone(transMatrix), mat4.clone(viewMatrix), moon, moonColors)
    drawTrace(mat4.clone(transMatrix), mat4.clone(viewMatrix))
    window.requestAnimationFrame(update)
  }
  window.requestAnimationFrame(update)

  // register mouse event
  gl.canvas.addEventListener('wheel', event => {
    options.scale = options.scale + event.deltaY * -0.01 * 0.20
  }, { passive: true })

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
