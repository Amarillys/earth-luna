import { draw } from './src/draw'
import dat from 'dat.gui/src/dat'

const canvas: HTMLCanvasElement = document.querySelector('#universe')
const gl = canvas.getContext('webgl')

let options = {
  R: 0.45,
  G: 0.65,
  B: 0.85,
  A: 0.95,
  moonR: 0.00434,
  earthR: 0.01592,
  w: 64,
  h: 64,
  scale: 32
}
let gui = new dat.GUI({
  autoPlace: true
});
gui.add(options, 'w', 3, 128, 1)
gui.add(options, 'h', 3, 128, 1)
gui.add(options, 'R', 0, 1)
gui.add(options, 'G', 0, 1)
gui.add(options, 'B', 0, 1)
gui.add(options, 'A', 0, 1)
gui.add(options, 'earthR', 0, 0.1)
gui.add(options, 'scale', 0, 48)

if (!gl) {
  alert('Unable to initialize WebGL due to your browser or your machine maybe.')
} else {
  window.onload = () => draw(gl, options)
}
