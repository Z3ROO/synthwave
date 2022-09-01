
### Usage example:
const canvas: HTMLCanvasElement = document.querySelector('#canvas')
const wave = new Wave(canvas, {
  canvasWidth: canvas.offsetWidth,
  canvasHeight: canvas.offsetHeight,
  xDots: 114, 
  yDots: 102,
  color: 'red',
  centerPosition:.5,
  frameQtd: 35,
  waveDelay: 4,
  wavePattern: 'inside-out',
  frameCap: 30,
  horizonAngle: .15,
  waveMaxHeight: 50
});
wave.init();