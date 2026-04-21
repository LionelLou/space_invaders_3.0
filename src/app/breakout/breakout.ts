import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { entity } from '../../types/entity';
import { breakout_ball } from '../../types/breakout_ball';
import { breakout_brick } from '../../types/breakout_brick';

@Component({
  selector: 'app-breakout',
  imports: [],
  templateUrl: './breakout.html',
  styleUrl: './breakout.scss',
})
export class Breakout implements AfterViewInit, OnInit, OnDestroy {


  gameInterval: ReturnType<typeof setInterval> | null = null


  statsLifes = signal(3);
  statsScore = signal(0);
  statsRound = signal(1);


  gameStarted: boolean = false;
  gameOver: boolean = false;
  roundWin: boolean = false;

  leftPressed: boolean = false;
  rightPressed: boolean = false;


  @HostListener('window:keydown', ['$event'])
  getKey(event: KeyboardEvent) {
    let touche = event.key; //on récupère la valeur de la touche enfoncée 

    if (touche == 'q' || touche == 'ArrowLeft') {  //Déplacement vers la gauche et test si proche du bord
      this.leftPressed = true;
    }

    if (touche == 'd' || touche == 'ArrowRight') {  // Déplacement vers la droite et test si proche du bord
      this.rightPressed = true;
    }

    if (touche == 'p') {
      alert("Le jeu est en pause. Cliquez sur OK pour reprendre");
    }
  }

  @HostListener('window:keyup', ['$event'])
  getKeyUp(event: KeyboardEvent) {
    if (event.key === 'q' || event.key === 'ArrowLeft') {
      this.leftPressed = false;
    }

    if (event.key == 'd' || event.key == 'ArrowRight') {
      this.rightPressed = false;
    }
  }


  @ViewChild("canvas")
  canvasRef!: ElementRef<HTMLCanvasElement>
  canvas: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  canvasWidth: number = 480;


  padelImage = new Image();
  padelImageSrc = "/assets/sprites/breakout/padel.png";
  padelXY: entity = {
    x: 0,
    y: 0,
    speed: 200
  }
  padelWidth = 32;
  padelHeight = 10;


  ballImage = new Image();
  ballImageSrc = "/assets/sprites/breakout/ball.png";
  ballXY: breakout_ball = {
    x: 0,
    y: 0,
    dx: -200,
    dy: -200,
    speed: 200
  }
  ballWidth = 5;
  ballHeight = 5;

  greenBrickImage = new Image();
  redBrickImage = new Image();
  blueBrickImage = new Image();
  greenBrickSrc = "/assets/sprites/breakout/green_tile.png"
  blueBrickSrc = "/assets/sprites/breakout/blue_tile.png"
  redBrickSrc = "/assets/sprites/breakout/red_tile.png"
  brickImageList: HTMLImageElement[] = []
  brickWidth = 20
  brickHeight = 10
  brickList: breakout_brick[] = []


  ngAfterViewInit(): void {
    if (this.canvasRef) {
      this.canvas = this.canvasRef?.nativeElement
      this.canvas.width = this.canvasWidth
      this.canvas.height = this.canvasWidth / 2
      this.ctx = this.canvas.getContext('2d')

      this.padelImage.src = this.padelImageSrc;
      this.ballImage.src = this.ballImageSrc;

      this.redBrickImage.src = this.redBrickSrc;
      this.greenBrickImage.src = this.greenBrickSrc;
      this.blueBrickImage.src = this.blueBrickSrc;

      this.brickImageList = [this.blueBrickImage, this.greenBrickImage, this.redBrickImage]

      console.log(this.brickImageList)


      this.padelXY.x = Math.round(this.canvas!.width / 2) - this.padelWidth / 2
      this.padelXY.y = Math.round(this.canvas.height - this.padelHeight - 3);

      this.ballXY.x = this.padelXY.x
      this.ballXY.y = this.padelXY.y - 5
    }
  }

  ngOnInit(): void {


  }




  startNewGame() {
    // this.ctx?.drawImage(this.padelImage, 0, 0, this.padelWidth, this.padelHeight, this.padelXY.x, this.padelXY.y, this.padelWidth, this.padelHeight)
    // this.ctx?.drawImage(this.ballImage, 0, 0, this.ballWidth, this.ballHeight, this.canvasWidth / 2, this.canvasWidth / 8, this.ballWidth, this.ballHeight)

    const deltaTime = 16.66 / 1000; // 0.016 sec 

    if (!this.gameStarted) {
      this.ctx?.clearRect(0, 0, this.canvas!.width, this.canvas!.height)
      this.padelXY.x = Math.round(this.canvas!.width / 2) - this.padelWidth / 2
      this.gameStarted = true;
      this.gameOver = false;
      this.roundWin = false;
      this.resetInputs();
      this.initializeBricks()

      // this.initialize bricks;


      this.gameInterval = setInterval(() => {
        // const now = performance.now();


        if (this.gameOver) {
          if (this.statsLifes() === 0) {
            clearInterval(this.gameInterval!)
            alert("Sadge :( , essaye encore !")
            this.gameStarted = false
            this.statsLifes.set(3);
            this.statsScore.set(0);
            this.statsRound.set(1);
          } else {
            this.statsLifes.set(this.statsLifes() - 1);
          }

          // this.gameOverSound.currentTime = 0
          // this.gameOverSound.play();
        }

        if (this.roundWin) {
          // this.winSound.currentTime = 0;
          // this.winSound.play();
          this.statsRound.set(this.statsRound() + 1);

          this.statsScore.set(this.statsScore() + 10000);
          clearInterval(this.gameInterval!);
          alert("GG, on continue ?");
          this.gameStarted = false
        }

        this.ctx?.clearRect(0, 0, this.canvas!.width, this.canvas!.height)

        this.drawBricks();

        this.update(deltaTime)

        this.animateHero();

        // this.animateBall();

        this.drawBall()

        // this.animateMonsters();

        // this.animateLasers(deltaTime);

      }, 16)
    }
  }


  update(deltaTime: number) {

    if (this.leftPressed && this.padelXY.x > 2) {
      this.padelXY.x -= this.padelXY.speed * deltaTime;
    }

    if (this.rightPressed && this.padelXY.x < (this.canvas!.width - this.padelWidth - 2)) {
      this.padelXY.x += this.padelXY.speed * deltaTime;
    }



    this.ballXY.x += this.ballXY.dx * deltaTime
    this.ballXY.y += this.ballXY.dy * deltaTime


    if (this.ballXY.x <= 0 || this.ballXY.x >= this.canvas?.width!) {
      this.ballXY.dx *= -1
    }

    if (this.ballXY.y <= 0 || this.ballXY.y >= this.canvas?.height!) {
      this.ballXY.dy *= -1
    }

    if (this.ballXY.y < this.padelXY.y + this.padelHeight && this.ballXY.y + this.ballHeight > this.padelXY.y) {

      if (this.ballXY.x < this.padelXY.x + this.padelWidth && this.ballXY.x + this.ballWidth > this.padelXY.x) {

        let hitpoint = (this.ballXY.x - this.padelXY.x) / this.padelWidth;

        let angle = (hitpoint - 0.5) * Math.PI / 2

        this.ballXY.dx = this.ballXY.speed * Math.sin(angle)
        this.ballXY.dy = -this.ballXY.speed * Math.cos(angle)

      }
    }

    for (let i = 0; i < this.brickList.length; i++) {

      let brick = this.brickList[i]
      if (this.ballXY.y < brick.y + this.brickHeight && this.ballXY.y + this.ballHeight > brick.y) {

        if (this.ballXY.x < brick.x + this.brickWidth && this.ballXY.x + this.ballWidth > brick.x) {

          this.ballXY.dy *= -1;

          if (brick.health == 0) {
            this.brickList.splice(i, 1)
          }

          if (brick.health > 0) {
            this.brickList[i].health -= 1
          }
        }
      }
    }
  }



  initializeBricks() {
    let bricksPerLine = Math.floor(this.canvas?.width! / this.brickWidth)

    let numberOfLines = Math.floor((this.canvas?.height! / 3) / this.brickHeight);

    for (let j = 0; j < numberOfLines; j++) {
      for (let i = 0; i < bricksPerLine; i++) {
        this.brickList.push({
          x: i * this.brickWidth,
          y: j * this.brickHeight,
          health: Math.round(Math.random() * 2)
        })
      }
    }
  }

  drawBricks() {
    for (let i = 0; i < this.brickList.length; i++) {
      this.drawBrick(this.brickList[i])
    }
  }

  drawBrick(brick: breakout_brick) {

    this.ctx?.drawImage(this.brickImageList[brick.health], 0, 0, this.brickWidth, this.brickHeight, brick.x, brick.y, this.brickWidth, this.brickHeight)
  }


  animateHero() {
    this.ctx?.drawImage(this.padelImage, 0, 0, this.padelWidth, this.padelHeight, this.padelXY.x, this.padelXY.y, this.padelWidth, this.padelHeight)
  }

  drawBall() {
    this.ctx?.drawImage(this.ballImage, 0, 0, this.ballWidth, this.ballHeight, this.ballXY.x, this.ballXY.y, this.ballWidth, this.ballHeight);
  }


  ngOnDestroy(): void {

  }

  resetInputs() {
    this.leftPressed = false;
    this.rightPressed = false;
  }


}
