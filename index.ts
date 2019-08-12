import { draw } from './src/draw'

const canvas: HTMLCanvasElement = document.querySelector('#universe')
const gl = canvas.getContext('webgl')

if (!gl) {
    alert('Unable to initialize WebGL due to your browser or your machine maybe.')
} else {
    window.onload = () => draw(gl)
}
