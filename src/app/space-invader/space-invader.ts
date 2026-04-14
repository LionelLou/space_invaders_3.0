import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { entity } from '../../types/entity';

@Component({
  selector: 'app-space-invader',
  imports: [],
  templateUrl: './space-invader.html',
  styleUrl: './space-invader.scss',
})
export class SpaceInvader implements OnInit, AfterViewInit {

  leftPressed = false;
  rightPressed = false;
  spacePressed = false;


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

    if (touche == ' ') {   // Création d'un objet laser chaque fois que l'on appuye sur Espace
      this.spacePressed = true
    }
    // if (touche != '' && !isGameStarted) {
    //   startNewGame();
    // }
  }

  @HostListener('window:keyup', ['$event'])
  getKeyUp(event: KeyboardEvent) {
    if (event.key === 'q' || event.key === 'ArrowLeft') {
      this.leftPressed = false;
    }

    if (event.key == 'd' || event.key == 'ArrowRight') {
      this.rightPressed = false;
    }

    if (event.key == ' ') {
      this.spacePressed = false;
    }
  }

  @ViewChild("canvas")
  canvasRef!: ElementRef<HTMLCanvasElement>
  canvas: HTMLCanvasElement | null = null
  ctx: CanvasRenderingContext2D | null = null
  canvasWidth: number = 480;

  heroImage: HTMLImageElement = new Image()
  heroImageSrc: string = "assets/hero_sprite_sheet_1.png"
  heroXY: entity = { x: 0, y: 0, speed: 0 }
  heroWidth: number = 16
  heroHeight: number = 16
  heroSpeed: number = 200


  heroAnimTime: number = 0;
  heroFrame: number = 0;
  heroFrameSpeed: number = 0.025;

  laserImage = new Image();
  laserImageSrc = "assets/laser_sprite.png";
  laserList: entity[] = []
  laserWidth = 2;
  laserHeight = 10;


  lastShootTime: number = 0;
  shootCooldown: number = 100;
  maxLasers: number = 10


  gameStarted: Boolean = false;

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    if (this.canvasRef) {
      this.canvas = this.canvasRef?.nativeElement
      this.canvas.width = this.canvasWidth
      this.canvas.height = this.canvasWidth * (window.innerHeight / window.innerWidth)
      this.ctx = this.canvas.getContext('2d')

      this.heroImage.src = this.heroImageSrc
      this.laserImage.src = this.laserImageSrc


      this.heroXY.x = Math.round(this.canvas.width / 2) - this.heroWidth / 2;
      this.heroXY.y = Math.round(this.canvas.height - this.heroHeight - 3);
      this.heroXY.speed = this.heroSpeed;

    };
  }


  startNewGame() {
    if (!this.gameStarted) {
      this.gameStarted = true
      let frame = 0;

      setInterval(() => {
        const now = performance.now();
        const deltaTime = 16.66 / 1000; // 0.016 sec 
        this.ctx?.clearRect(0, 0, this.canvas!.width, this.canvas!.height)
        frame++
        if (frame === 60) {
          frame = 0;
        }
        this.update(deltaTime, now)

        this.animateHero();

        this.animateLasers(deltaTime);

      }, 16)

    }
  }

  update(deltaTime: number, now: number) {

    if (this.leftPressed && this.heroXY.x > 2) {
      this.heroXY.x -= this.heroXY.speed * deltaTime;
    }

    if (this.rightPressed && this.heroXY.x < (this.canvas!.width - this.heroWidth - 2)) {
      this.heroXY.x += this.heroXY.speed * deltaTime;
    }


    if (this.spacePressed && this.laserList.length < this.maxLasers) {
      if (this.canShoot(now)) {
        this.addLaser();
        this.lastShootTime = now;
      }
    }

    this.heroAnimTime += deltaTime;

    if (this.heroAnimTime > this.heroFrameSpeed) {
      this.heroFrame = (this.heroFrame + 1) % 4;
      this.heroAnimTime = 0;
    }
  }

  canShoot(now: number) {
    return now - this.lastShootTime > this.shootCooldown
  }


  addLaser() {
    // audioLaser.play(); // Bruit d'un tir de laser 

    this.laserList.push({  // on crée un objet laser que l'on stocke dans un tableau regroupant les lasers
      x: this.heroXY.x + (this.heroWidth / 2) - 1,
      y: this.heroXY.y,
      speed: 200 // px / sec
    });
  }

  animateLasers(deltaTime: number) {

    let index = 0; // compteur pour la boucle while pour les indexes
    let hit = null; // permet de recupérer l'index du monstre qui est touché, reste négatif tant que aucun monstres n'est touché
    let numberOfLasers = this.laserList.length; // on stocke le nombre de lasers avant opérations 

    //Boucle for pour faire avancer les lasers

    while (index < numberOfLasers) {

      // hit = collisionDetection(this.laserList[index], monsterXY); // on detecte s'il y colision entre laser et monstres

      const laser = this.laserList[index];

      if ((laser.y + this.laserHeight) <= 0) { // Gestion du cas où le laser dépasse le plafond

        this.laserList.splice(index, 1);
        numberOfLasers = this.laserList.length;


      } else { // déplacement classique des lasers si aucune perturbation


        laser.y -= laser.speed * deltaTime; //vitesse de déplacement des lasers

        this.ctx?.drawImage(this.laserImage, laser.x, laser.y);
        index++;

      }
    }
  }


  animateHero() {
    this.ctx?.drawImage(this.heroImage, this.heroFrame * this.heroWidth, 0, this.heroWidth, this.heroHeight, this.heroXY.x, this.heroXY.y, this.heroWidth, this.heroHeight)
  }

}

