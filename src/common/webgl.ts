export const GLContext = WebGLRenderingContext
export type InputType = 'attribute' | 'uniform' | 'varying' | 'index'

export class InputData {
  name: string
  buffer: WebGLBuffer
  value: any
  type: string
  inputType: InputType
  indexArray: boolean
  drawType: number = GLContext.STATIC_DRAW
  options = {
    offset: 0,
    stride: 0,
    normalize: false,
    bindType: GLContext.FLOAT
  }
  constructor(name: string, value: any, indexArray = false) {
    this.name = name
    this.value = value
    this.indexArray = indexArray
  }
}

export class WebGL {
  gl: WebGLRenderingContext   = null
  shaderProgram: WebGLProgram = null
  vertexShader: WebGLShader   = null
  fragmentShader: WebGLShader = null
  vertices: Array<number>  = null
  colors: Array<number>    = null
  indices: Array<number>   = null
  inputs: Array<InputData> = []
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
    this.gl.clearDepth(1.0)
    this.gl.enable(GLContext.DEPTH_TEST)
    this.gl.depthFunc(GLContext.LEQUAL)
  }
  initShader(vsSrouce: string, fsSource: string) {
    this.vertexShader = WebGL.loadShader(this.gl, GLContext.VERTEX_SHADER, vsSrouce)
    this.fragmentShader = WebGL.loadShader(this.gl, GLContext.FRAGMENT_SHADER, fsSource)

    // build shader program
    this.shaderProgram = this.gl.createProgram()
    this.gl.attachShader(this.shaderProgram, this.vertexShader)
    this.gl.attachShader(this.shaderProgram, this.fragmentShader)
    this.gl.linkProgram(this.shaderProgram)

    if (!this.gl.getProgramParameter(this.shaderProgram, GLContext.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.shaderProgram));
      return null
    }
  }
  static loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    let shader = gl.createShader(type)

    // Send the source to the shader object
    gl.shaderSource(shader, source)

    // Compile the shader program
    gl.compileShader(shader)

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, GLContext.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader)
      return null
    }
    return shader
  }
  draw(inputData: Array<InputData>, callback: (gl: WebGLRenderingContext) => void) {
    this.inputs = []
    this.inputs = this.inputs.concat(...inputData)
    this.parseInput()
    this.gl.useProgram(this.shaderProgram)
    this.transData()
    callback(this.gl)
  }
  transData() {
    // parse
    this.inputs.forEach(input => {
      if (input.inputType === 'attribute') {
        input.buffer = this.gl.createBuffer()
        this.gl.bindBuffer(GLContext.ARRAY_BUFFER, input.buffer)
        this.gl.bufferData(GLContext.ARRAY_BUFFER, input.value, input.drawType)

        let location = this.gl.getAttribLocation(this.shaderProgram, input.name)
        this.gl.vertexAttribPointer(location, this.getSize(input.type), GLContext.FLOAT, input.options.normalize, 0, 0);
        this.gl.enableVertexAttribArray(location);
      } else if (input.inputType === 'uniform') {
        switch (input.type) {
          case 'vec4':
              this.gl.uniform4fv(this.gl.getUniformLocation(this.shaderProgram, input.name), input.value);
              break;
          case 'mat4':
              this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, input.name), false, input.value);
              break;
        }
      } else if (input.name === 'index') {
        input.buffer = this.gl.createBuffer()
        this.gl.bindBuffer(GLContext.ELEMENT_ARRAY_BUFFER, input.buffer)
        this.gl.bufferData(GLContext.ELEMENT_ARRAY_BUFFER, input.value, input.drawType)
      }
    })
  }

  parseInput() {
    let scripts = (this.gl.getShaderSource(this.vertexShader)
      + this.gl.getShaderSource(this.fragmentShader)).split('\n')
    const type: Array<InputType> = ['attribute', 'uniform', 'index']
    for (let i = 0; i < scripts.length; ++i) {
      let words = scripts[i].trim().replace(';', '').split(' ')
      let typeIndex = (type as string[]).indexOf(words[0])
      if (typeIndex > -1) {
        let targetInput = this.inputs.find(input => input.name === words[2])
        if (targetInput) {
          targetInput.inputType = type[typeIndex]
          targetInput.type = words[1]
        }
      } else {
        continue
      }
    }
  }
  getSize(type: string): number {
    return {
      vec3: 3,
      vec4: 4,
      float: 1,
    }[type]
  }
}
