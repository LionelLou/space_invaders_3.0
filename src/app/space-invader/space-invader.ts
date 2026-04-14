import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { entity } from '../../types/entity';

@Component({
  selector: 'app-space-invader',
  imports: [],
  templateUrl: './space-invader.html',
  styleUrl: './space-invader.scss',
})
export class SpaceInvader implements OnInit, AfterViewInit {



  heroImage: HTMLImageElement = new Image()


  @ViewChild("canvas")
  canvasRef!: ElementRef<HTMLCanvasElement>
  canvas: HTMLCanvasElement | null = null

  @HostListener('window:keydown', ['$event'])
  getKey(event: KeyboardEvent) {
    let touche = event.key; //on récupère la valeur de la touche enfoncée 

    if ((touche == 'q' || touche == 'ArrowLeft') && this.heroXY.x > 2) {  //Déplacement vers la gauche et test si proche du bord


      this.heroXY.x -= this.heroXY.speed;
    }

    if ((touche == 'd' || touche == 'ArrowRight') && this.heroXY.x < (this.canvas!.width - this.heroWidth - 2)) {  // Déplacement vers la droite et test si proche du bord


      this.heroXY.x += this.heroXY.speed;

    }

    if (touche == 'p') {

      alert("Le jeu est en pause. Cliquez sur OK pour reprendre");

    }

    // if (touche == ' ') {   // Création d'un objet laser chaque fois que l'on appuye sur Espace


    //   addLaser(laserXY);


    // }

    // if (touche != '' && !isGameStarted) {

    //   startNewGame();

    // }
  }


  ctx: CanvasRenderingContext2D | null = null
  heroXY: entity = { x: 0, y: 0, speed: 0 }

  heroWidth: number = 16
  heroHeight: number = 16
  heroSpeed: number = 4


  gameStarted: Boolean = false;

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    if (this.canvasRef) {
      this.canvas = this.canvasRef?.nativeElement
      this.ctx = this.canvas.getContext('2d')
      console.log(this.ctx)
      console.log(this.canvas.width)
      console.log(this.canvas.height)


      this.heroImage.src = "assets/hero_sprite_sheet_1.png"


      this.heroXY.x = Math.round(this.canvas.width / 2) - this.heroWidth / 2
      this.heroXY.y = Math.round(this.canvas.height - this.heroHeight - 5)
      this.heroXY.speed = this.heroSpeed

    };
  }


  startNewGame() {

    if (!this.gameStarted) {

      this.gameStarted = true
      let frame = 0;


      setInterval(() => {
        this.ctx?.clearRect(0, 0, this.canvas!.width, this.canvas!.height)
        frame++
        if (frame === 60) {
          frame = 0;
        }

        this.animateHero(frame)


      }, 16)

    }
  }


  animateHero(frameCount: number) {

    let frame = frameCount % 4
    let spriteFrame = 0;

    switch (frame) {

      case 0:
        spriteFrame = 0;
        break;

      case 1:
        spriteFrame = 1;
        break;
      case 2:
        spriteFrame = 2;
        break;

      case 3:
        spriteFrame = 3;
        break;

      default:
        break;
    }

    this.ctx?.drawImage(this.heroImage, spriteFrame * this.heroWidth, 0, this.heroWidth, this.heroHeight, this.heroXY.x, this.heroXY.y, this.heroWidth, this.heroHeight)

  }

}

