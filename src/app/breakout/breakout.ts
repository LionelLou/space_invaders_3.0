import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-breakout',
  imports: [],
  templateUrl: './breakout.html',
  styleUrl: './breakout.scss',
})
export class Breakout implements AfterViewInit, OnInit, OnDestroy {


  gameInterval: ReturnType<typeof setInterval> | null = null


  leftPressed: boolean = false;
  rightPressed: boolean = false;
  spacePressed: boolean = false;

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
  canvas: HTMLCanvasElement | null = null
  ctx: CanvasRenderingContext2D | null = null
  canvasWidth: number = 480;


  ngAfterViewInit(): void {
    if (this.canvasRef) {
      this.canvas = this.canvasRef?.nativeElement
      this.canvas.width = this.canvasWidth
      this.canvas.height = this.canvasWidth / 2
      this.ctx = this.canvas.getContext('2d')
    }
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }




  startNewGame() {

  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

}
