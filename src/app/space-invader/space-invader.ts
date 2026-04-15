import { AfterViewInit, Component, ElementRef, HostListener, OnInit, signal, Signal, ViewChild } from '@angular/core';
import { entity } from '../../types/entity';

@Component({
  selector: 'app-space-invader',
  imports: [],
  templateUrl: './space-invader.html',
  styleUrl: './space-invader.scss',
})
export class SpaceInvader implements OnInit, AfterViewInit {

  statsLifes = signal(3);
  statsScore = signal(0);
  statsRound = signal(1);

  leftPressed: boolean = false;
  rightPressed: boolean = false;
  spacePressed: boolean = false;

  isMonstersDirectionRight: boolean = true;

  gameStarted: boolean = false;
  gameOver: boolean = false;
  roundWin: boolean = false;

  gameInterval: ReturnType<typeof setInterval> | null = null

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
  heroImageSrc: string = "assets/sprites/hero_sprite_sheet_1.png"
  heroXY: entity = { x: 0, y: 0, speed: 0 }
  heroWidth: number = 16
  heroHeight: number = 16
  heroSpeed: number = 200


  heroAnimTime: number = 0;
  heroFrame: number = 0;
  heroFrameSpeed: number = 0.025;

  monsterImage: HTMLImageElement = new Image();
  monsterImageSrcs: string[] = ["assets/sprites/monster_sprite_sheet_1.png", "assets/sprites/monster_sprite_sheet_2.png", "assets/sprites/monster_sprite_sheet_3.png"]
  monstersXY: entity[] = []
  monsterWidth: number = 14;
  monsterHeight: number = 12;
  monsterSpeedX: number = 50;
  monsterSpeedY: number = 1200;


  monsterAnimTime: number = 0;
  monsterFrame: number = 0;
  monsterFrameSpeed: number = 0.2

  laserImage: HTMLImageElement = new Image();
  laserImageSrc = "assets/sprites/laser_sprite.png";
  laserList: entity[] = []
  laserWidth = 2;
  laserHeight = 10;


  lastShootTime: number = 0;
  shootCooldown: number = 150; //ms
  maxLasers: number = 10;

  laserSound = new Audio("assets/sounds/laser.wav");
  gameOverSound = new Audio("assets/sounds/game-over.wav");
  winSound = new Audio("assets/sounds/win.wav");
  hitSound = new Audio("assets/sounds/hit.wav");
  explosion = new Audio("assets/sounds/explosion");

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


      // this.heroXY.x = ;
      this.heroXY.y = Math.round(this.canvas.height - this.heroHeight - 3);
      this.heroXY.speed = this.heroSpeed;

    };
  }


  startNewGame() {
    if (!this.gameStarted) {
      this.ctx?.clearRect(0, 0, this.canvas!.width, this.canvas!.height)
      this.laserList = [];
      this.monstersXY = [];
      this.heroXY.x = Math.round(this.canvas!.width / 2) - this.heroWidth / 2
      this.gameStarted = true;
      this.gameOver = false;
      this.roundWin = false;
      this.resetInputs();
      this.selectRandomImageForMonsters();
      this.initializeMonsters();
      this.isMonstersDirectionRight = true;


      this.gameInterval = setInterval(() => {
        const now = performance.now();
        const deltaTime = 16.66 / 1000; // 0.016 sec 

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
          this.selectRandomImageForMonsters();
          this.gameOverSound.currentTime = 0
          this.gameOverSound.play();
        }

        if (this.roundWin) {
          this.winSound.currentTime = 0;
          this.winSound.play();
          this.statsRound.set(this.statsRound() + 1);
          this.selectRandomImageForMonsters();
          this.statsScore.set(this.statsScore() + 10000);
          clearInterval(this.gameInterval!);
          alert("GG, on continue ?");
          this.gameStarted = false
        }

        this.ctx?.clearRect(0, 0, this.canvas!.width, this.canvas!.height)

        this.update(deltaTime, now)

        this.animateHero();

        this.animateMonsters();

        this.animateLasers(deltaTime);

      }, 16)

    }
  }

  selectRandomImageForMonsters() {
    this.monsterImage.src = this.monsterImageSrcs[Math.floor(Math.random() * 3)]
  }

  animateMonsters() {
    for (let i = 0; i < this.monstersXY.length; i++) {
      let element = this.monstersXY[i];
      this.ctx?.drawImage(this.monsterImage, this.monsterFrame * this.monsterWidth, 0, this.monsterWidth, this.monsterHeight, element.x, element.y, this.monsterWidth, this.monsterHeight)
    }
  }

  initializeMonsters() {
    if (this.canvas) {
      let stepX = (this.canvas.width / 6);
      let stepY = (this.canvas.height / 12) + 5;

      this.monstersXY = []

      for (let i = 1; i <= 5; i++) {
        for (let j = 1; j <= 5; j++) {

          let monster: entity = {
            x: Math.round(stepX * i),
            y: Math.round(stepY * j),
            speed: this.monsterSpeedX
          }
          this.monstersXY.push(monster)
        }
      }
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

    for (let i = 0; i < this.monstersXY.length; i++) {
      let monster = this.monstersXY[i]
      if (this.heroXY.y - (monster.y + this.monsterHeight) <= 5) {
        this.gameOver = true;
        break;
      } else if (monster.x <= 0 && this.isMonstersDirectionRight == false) {
        this.makeMonstersGetDown(deltaTime);
        this.isMonstersDirectionRight = true;
        break
      } else if (monster.x >= this.canvas!.width - this.monsterWidth && this.isMonstersDirectionRight == true) {
        this.makeMonstersGetDown(deltaTime);
        this.isMonstersDirectionRight = false;
        break;
      } else {
        if (this.isMonstersDirectionRight) {
          this.monstersXY[i].x += this.monsterSpeedX * deltaTime
        } else {
          this.monstersXY[i].x -= this.monsterSpeedX * deltaTime
        }
      }
    }

    this.monsterAnimTime += deltaTime;

    if (this.monsterAnimTime > this.monsterFrameSpeed) {
      this.monsterFrame = (this.monsterFrame + 1) % 2;
      this.monsterAnimTime = 0;
    }

    this.heroAnimTime += deltaTime;

    if (this.heroAnimTime > this.heroFrameSpeed) {
      this.heroFrame = (this.heroFrame + 1) % 4;
      this.heroAnimTime = 0;
    }
  }

  makeMonstersGetDown(deltaTime: number) {
    for (let i = 0; i < this.monstersXY.length; i++) {
      this.monstersXY[i].y += this.monsterSpeedY * deltaTime
    }
  }

  canShoot(now: number) {
    return now - this.lastShootTime > this.shootCooldown
  }

  resetInputs() {
    this.leftPressed = false;
    this.rightPressed = false;
    this.spacePressed = false;
  }

  addLaser() {
    this.laserList.push({  // on crée un objet laser que l'on stocke dans un tableau regroupant les lasers
      x: this.heroXY.x + (this.heroWidth / 2) - 1,
      y: this.heroXY.y,
      speed: this.heroSpeed
    });

    this.laserSound.currentTime = 0;
    this.laserSound.play();
  }

  animateLasers(deltaTime: number) {

    let index = 0; // compteur pour la boucle while pour les indexes
    let numberOfLasers = this.laserList.length; // on stocke le nombre de lasers avant opérations 

    //Boucle for pour faire avancer les lasers

    while (index < numberOfLasers) {

      // hit = collisionDetection(this.laserList[index], monsterXY); // on detecte s'il y colision entre laser et monstres

      const laser = this.laserList[index];

      if ((laser.y + this.laserHeight) <= 0) { // Gestion du cas où le laser dépasse le plafond
        this.laserList.splice(index, 1);
        numberOfLasers = this.laserList.length;
        if (this.monstersXY.length === 0) {
          this.roundWin = true;
        }

      } else if (this.isLaserCollidingMonster(laser)) {
        this.laserList.splice(this.laserList.indexOf(laser), 1);
        this.hitSound.currentTime = 0;
        this.hitSound.play();
        break;

      } else { // déplacement classique des lasers si aucune perturbation

        laser.y -= laser.speed * deltaTime; //vitesse de déplacement des lasers
        this.ctx?.drawImage(this.laserImage, laser.x, laser.y);
        index++;
      }
    }
  }

  isLaserCollidingMonster(laser: entity) {
    for (let i = 0; i < this.monstersXY.length; i++) { // on parcourt la liste des montres pour tester si un laser les touche

      let isXValid = false;
      let isYValid = false;

      // Gestion de la colision du laser sur le monstre selon l'axe X 
      let distanceX: number;
      // cas où le laser est à gauche du monstre
      if (laser.x + this.laserWidth <= this.monstersXY[i].x + (this.monsterWidth / 2)) {
        distanceX = this.monstersXY[i].x - (laser.x + this.laserWidth);
      }   // cas où le laser est à droite du monstre
      else if (laser.x <= this.monstersXY[i].x + this.monsterWidth) {
        distanceX = laser.x - (this.monstersXY[i].x + this.monsterWidth);
      }

      // si une distance faible à été détectée verticalement, donc qu'une collision laser/monstre à lieu sur l'axe X
      // alors on confirme pour la partie X la colision, sinon les booléens de validation restent à False  

      if (distanceX! <= 0) {

        isXValid = true;

        // si une distance faible à été détectée horizontalement, donc qu'une collision laser/monstre à lieu sur l'axe Y
        // alors on confirme pour la partie Y la colision, sinon les booléens de validation restent à False     

        if (((this.monstersXY[i].y <= laser.y) && (laser.y <= this.monstersXY[i].y + this.monsterHeight)))

          // Ici on vient tester si les lasers rentrer dans les dimensions de la boite du monstre 
          // Pour cela on vérifie que la position sur Y du laser est contenue dans les dimensions de la taille de la boîte un hauteur

          isYValid = true;

      }

      // Si les positions X et Y du laser donnent sur un point de colision avec un monstre alors on garde l'index de la boîte touchée
      if (isXValid && isYValid) {
        this.statsScore.set(this.statsScore() + 200);
        this.monstersXY.splice(i, 1);
        return true;
      }
    }
    return false;
  }


  animateHero() {
    this.ctx?.drawImage(this.heroImage, this.heroFrame * this.heroWidth, 0, this.heroWidth, this.heroHeight, this.heroXY.x, this.heroXY.y, this.heroWidth, this.heroHeight)
  }

}

