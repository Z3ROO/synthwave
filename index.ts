export interface IWaveConfig {
  canvasWidth: number
  canvasHeight: number
  xDots: number
  yDots: number
  spaceBetweenXDots?: number
  hollowDots?: number
  centerPosition?: number
  waveMaxHeight?: number
  horizonAngle?: number
  color?: string
  dotSize?: number
  waveDelay?: number
  wavePattern?: 'straight'|'outside-in'|'inside-out'
  repeat?: boolean
  frameQtd?: number
  frameCap?: number
}

export interface IDot extends WaveDot {}

export interface IDotConfig {
  dotSize: number
  xDots: number
  wavePattern: 'straight'|'outside-in'|'inside-out'
  waveDelay: number
  framesQtd: number
  waveMaxHeight: number
  horizonDecrementReversed: number[]
  color: string
  backwards?: boolean
}

class Wave{
  canvas: HTMLCanvasElement
  cw: number
  ch: number
  ctx: CanvasRenderingContext2D
  dots: IDot[]
  xDots: number
  yDots: number
  spaceBetweenXDots: number
  hollowDots: number
  centerPosition: number
  waveMaxHeight: number
  horizonAngle: number
  color: string
  dotSize: number
  waveDelay: number
  wavePattern: 'straight'|'outside-in'|'inside-out'
  repeat: boolean
  frameQtd: number
  frameLength: number
  lastFrame: number
  horizonDecrement: number[]
  horizonDecrementReversed: number[]

  constructor(canvas: HTMLCanvasElement, waveConfig: IWaveConfig) {
    this.canvas = canvas;
    this.cw = canvas.width = waveConfig.canvasWidth;
    this.ch = canvas.height = waveConfig.canvasHeight;
    this.ctx = canvas.getContext('2d');

    this.dots = [];
    this.xDots = waveConfig.xDots;
    this.yDots = waveConfig.yDots;
    this.spaceBetweenXDots = waveConfig.spaceBetweenXDots || 60;
    this.hollowDots = waveConfig.hollowDots+1 || (2)+1;
    this.centerPosition = waveConfig.centerPosition || .5;
    this.waveMaxHeight = waveConfig.waveMaxHeight || 100;
    this.horizonAngle = waveConfig.horizonAngle || 0;
    this.color = waveConfig.color || 'black';
    this.dotSize = waveConfig.dotSize || .3;
    
    this.waveDelay = waveConfig.waveDelay || 0;
    this.wavePattern = waveConfig.wavePattern || 'straight';

    this.repeat = waveConfig.repeat || true;
    this.frameQtd = waveConfig.frameQtd || 100;
    this.frameLength = 1000/(waveConfig.frameCap||30);
    this.lastFrame = Date.now()+this.frameLength;
    
    this.horizonDecrement = [0, ...this.#horizonScaleDown(this.yDots,true)];
    this.horizonDecrementReversed = [1, ...this.#horizonScaleDown(this.yDots,true).reverse()];

    this.watchResize();
  }

  init() {
    this.buildDots();
    this.drawWave();
  }

  buildLines() {
    const gridColor = 'rgba(220,0,0,.2)'
    for (let yDraw = 0; yDraw <= this.yDots; yDraw++) {
      const isHollowDot = yDraw % this.hollowDots != 0;
      if (isHollowDot)
        continue;
  
      const horizonDecrement = this.horizonDecrement[yDraw];
      const xCenter = (this.cw*this.centerPosition);
      const xPosition = (horizonDecrement+this.horizonAngle)*(this.xDots*this.spaceBetweenXDots);
      const yPosition = (this.ch-(this.ch*.3))*horizonDecrement+(this.ch*.15);
  
      this.ctx.beginPath();
      this.ctx.moveTo(xCenter-xPosition, yPosition);
      this.ctx.lineTo(xCenter+xPosition, yPosition);
      this.ctx.strokeStyle = gridColor
      this.ctx.lineWidth = 2
      this.ctx.stroke()
    }

    for (let xDraw = 0; xDraw <= this.xDots; xDraw++) {
      const isHollowDot = xDraw % this.hollowDots != 0;
      if (isHollowDot)
        continue;
      
      const xCenter = (this.cw*this.centerPosition);
      const xPosition1 = (0+this.horizonAngle)*(xDraw*this.spaceBetweenXDots);
      const xPosition2 = (1+this.horizonAngle)*(xDraw*this.spaceBetweenXDots);
      const yPosition1 = (this.ch-(this.ch*.3))*0+(this.ch*.15);
      const yPosition2 = (this.ch-(this.ch*.3))*1+(this.ch*.15);
  
      this.ctx.beginPath();
      this.ctx.moveTo(xCenter-xPosition1, yPosition1);
      this.ctx.lineTo(xCenter-xPosition2, yPosition2);
      this.ctx.strokeStyle = gridColor;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      if (xDraw > 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(xCenter+xPosition1, yPosition1);
        this.ctx.lineTo(xCenter+xPosition2, yPosition2);
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    }
  }

  buildDots() {
    this.dots = [];
    for(let xDraw = 0; xDraw <= this.xDots; xDraw++) {
      for (let yDraw = 0; yDraw <= this.yDots; yDraw++) {
        const isHollowDot = xDraw % this.hollowDots != 0 && yDraw % this.hollowDots != 0;
        if (isHollowDot)
          continue;
    
        const horizonDecrement = this.horizonDecrement[yDraw];
        const xCenter = (this.cw*this.centerPosition);
        const xPosition = (horizonDecrement+this.horizonAngle)*(xDraw*this.spaceBetweenXDots);
        const yPosition = (this.ch-(this.ch*.3))*horizonDecrement+(this.ch*.15);
        const yNth = this.yDots-yDraw;
        const xNth = this.xDots-xDraw;

        const dotConfig: IDotConfig = {          
          dotSize: this.dotSize,
          wavePattern: this.wavePattern,
          waveDelay: this.waveDelay,
          framesQtd: this.frameQtd,
          waveMaxHeight: this.waveMaxHeight,
          horizonDecrementReversed: this.horizonDecrementReversed,
          color: this.color,
          xDots: this.xDots
        };
    
        this.dots.push(new WaveDot(xCenter+xPosition, yPosition, yNth, xNth, this.ctx, dotConfig));
        if (xDraw != 0)
          this.dots.push(new WaveDot(xCenter-xPosition, yPosition, yNth, xNth, this.ctx, dotConfig));
      }
    }
  }

  drawWave() {
    if (Date.now() - this.lastFrame > this.frameLength) {
      this.ctx.clearRect(0, 0, this.cw, this.ch);
      this.buildLines();
      this.dots.forEach((dot, index) => dot.draw());
      this.lastFrame = Date.now();
    }

    if(this.repeat)
      window.requestAnimationFrame(this.drawWave.bind(this));
  }

  watchResize() {
    window.addEventListener('resize', () => {
      this.cw = this.canvas.width = this.canvas.offsetWidth;
      this.ch = this.canvas.height = this.canvas.offsetHeight;
      
      this.ctx.clearRect(0, 0, this.cw, this.ch);
      this.buildDots();
    });
  }

  #horizonScaleDown(qtd: number, reverse: boolean = false) {
    let arr = new Array(qtd).fill(100/qtd);
    arr.forEach((val, index) => {
      if (arr[index+1])
        this.#recurseScallingDown(arr, index, index+1);
    })
    if (reverse)
      arr = arr.reverse()
  
    arr = arr.map((mapVal, mapIndex) => (
      arr.reduce((reduceAcc, reduceVal, reduceIndex) => reduceIndex <= mapIndex ? reduceAcc + reduceVal : reduceAcc, 0)
    ))
  
    return arr.map(v => v/100)
  }
  
  #recurseScallingDown(arr:number[], baseIndex: number, incIndex: number){
    arr[baseIndex] += arr[incIndex]*.05
    arr[incIndex] -= arr[incIndex]*.05
    if (arr[incIndex+1])
      this.#recurseScallingDown(arr, baseIndex, incIndex+1);
    else
      return
  }
}

class WaveDot{
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  originalX: number
  originalY: number
  dotSize: number
  color: string
  holdAnimation: number
  framesQtd: number
  currentFrame: number
  motionDirection: 'forward'|'backward'
  waveCeiling: number
  frames: number[]

  constructor(x: number, y: number, yNth: number, xNth: number, ctx: CanvasRenderingContext2D, 
    {
      dotSize,
      waveDelay, 
      wavePattern,
      framesQtd, 
      backwards/* implement */, 
      waveMaxHeight, 
      horizonDecrementReversed,
      color,
      xDots
    }: IDotConfig) {

    this.ctx = ctx;

    this.x = x;
    this.y = y;
    this.originalX = x;
    this.originalY = y;

    const waveShapes = {
      'straight': yNth*waveDelay,
      'outside-in': yNth*waveDelay+xNth*(waveDelay*1.5),
      'inside-out': yNth*waveDelay+(xDots-xNth)*(waveDelay*1.5)
    };

    this.dotSize = Math.ceil(horizonDecrementReversed[yNth]*10)*dotSize;
    this.color = color;

    this.holdAnimation = waveShapes[wavePattern];
    this.framesQtd = framesQtd;
    this.currentFrame = backwards ? 99 : 0;
    this.motionDirection = backwards ? 'backward' : 'forward';

    this.waveCeiling = Math.ceil(waveMaxHeight*horizonDecrementReversed[yNth]);

    this.buildFrames();
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.dotSize, 0, Math.PI*2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.animationStep();
  }

  animationStep() {
    if (this.holdAnimation > 0)
      return this.holdAnimation--;

    if (this.motionDirection === 'forward' && this.currentFrame === this.framesQtd-1) {
      this.motionDirection = 'backward';
      this.holdAnimation = 10;
    }
    else if (this.motionDirection === 'backward' && this.currentFrame === 0) {
      this.motionDirection = 'forward';
      this.holdAnimation = 20;
    }

    //====|SMOTHER|//

    if (this.currentFrame < this.framesQtd*.01)
      this.holdAnimation += 8
    else if (this.currentFrame < this.framesQtd*.02)
      this.holdAnimation += 6
    else if (this.currentFrame < this.framesQtd*.03)
      this.holdAnimation += 4
    else if (this.currentFrame < this.framesQtd*.04)
      this.holdAnimation += 2
    else if (this.currentFrame < this.framesQtd*.05)
      this.holdAnimation += 1
    else if (this.currentFrame < this.framesQtd*.93)
      this.holdAnimation += 0
    else if (this.currentFrame < this.framesQtd*.94)
      this.holdAnimation += 2
    else if (this.currentFrame < this.framesQtd*.96)
      this.holdAnimation += 4
    else if (this.currentFrame < this.framesQtd*.98)
      this.holdAnimation += 6
    else if (this.currentFrame < this.framesQtd*.99)
      this.holdAnimation += 8
    else if (this.currentFrame < this.framesQtd*1)
      this.holdAnimation += 10

    //=============//

    this.y = this.originalY + this.frames[this.currentFrame];

    this.motionDirection === 'backward' ? this.currentFrame-- : this.currentFrame++;
  }

  buildFrames() {
    const preCalculatedDotPosition = Array(this.framesQtd)
      .fill(0)
      .map((frame, frameIndex) => {
        return -(this.waveCeiling/this.framesQtd*(frameIndex+1))
    })

    this.frames = preCalculatedDotPosition;
  }
}
