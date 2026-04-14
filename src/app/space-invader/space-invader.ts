import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { entity } from '../../types/entity';

@Component({
  selector: 'app-space-invader',
  imports: [],
  templateUrl: './space-invader.html',
  styleUrl: './space-invader.scss',
})
export class SpaceInvader implements OnInit, AfterViewInit {


  @ViewChild("canvas")
  canvasRef!: ElementRef<HTMLCanvasElement>
  canvas: HTMLCanvasElement | null = null
  ctx: CanvasRenderingContext2D | null = null

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

    if (touche == ' ') {   // Création d'un objet laser chaque fois que l'on appuye sur Espace
      this.addLaser();
    }

    // if (touche != '' && !isGameStarted) {

    //   startNewGame();

    // }
  }


  heroImage: HTMLImageElement = new Image()

  heroXY: entity = { x: 0, y: 0, speed: 0 }
  heroWidth: number = 16
  heroHeight: number = 16
  heroSpeed: number = 4

  laserImage = new Image();

  laserList: entity[] = []
  laserWidth = 2;
  laserHeight = 10;



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
      this.laserImage.src = "assets/laser_sprite.png";



      this.heroXY.x = Math.round(this.canvas.width / 2) - this.heroWidth / 2;
      this.heroXY.y = Math.round(this.canvas.height - this.heroHeight - 5);
      this.heroXY.speed = this.heroSpeed;

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

        this.animateHero(frame);

        this.animateLasers(frame);

      }, 16)

    }
  }


  addLaser() {
    if (this.laserList.length < 3) { // maximum capé à 3 projectiles pour plus de difficulté
      // audioLaser.play(); // Bruit d'un tir de laser 

      this.laserList.push({  // on crée un objet laser que l'on stocke dans un tableau regroupant les lasers
        x: this.heroXY.x + (this.heroWidth / 2) - 1,
        y: this.heroXY.y,
        speed: 2
      });
    }
  }

  animateLasers(frame: number) {

    let index = 0; // compteur pour la boucle while pour les indexes
    let hit = null; // permet de recupérer l'index du monstre qui est touché, reste négatif tant que aucun monstres n'est touché
    let numberOfLasers = this.laserList.length; // on stocke le nombre de lasers avant opérations 

    //Boucle for pour faire avancer les lasers

    while (index < numberOfLasers) {

      // hit = collisionDetection(this.laserList[index], monsterXY); // on detecte s'il y colision entre laser et monstres

      if ((this.laserList[index].y + this.laserHeight) <= 0) { // Gestion du cas où le laser dépasse le plafond

        this.laserList.splice(index, 1);
        numberOfLasers = this.laserList.length;

        // } else if (hit != null) { //gestion en cas de colision avec un laser 


        //   audioHit.play(); // Son du monstre touché par un tir de laser 

        //   ctx.clearRect(monsterXY[hit].X, monsterXY[hit].Y, monsterWidth, monsterHeight);
        //   ctx.clearRect(laserXY[index].X, laserXY[index].Y, laserWidth, laserHeight);

        //   state.score += 100;
        //   barSetup(state.life, state.stage, state.score);

        //   laserXY.splice(index, 1);
        //   monsterXY.splice(hit, 1);
        //   hit = null;


      } else { // déplacement classique des lasers si aucune perturbation


        this.laserList[index].y -= this.laserList[index].speed; //vitesse de déplacement des lasers

        console.log("DRAWING LASER")

        this.ctx?.drawImage(this.laserImage, this.laserList[index].x, this.laserList[index].y);

        numberOfLasers = this.laserList.length; // on récupère le nombre de lasers restants après opération
        index++;

      }
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

