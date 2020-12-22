// Christmas Run
// Game obj
const game = {
  // TotalGems
  totalGems: 0,

  // HasKey
  hasKey: false
};

// Level scene class
class Level extends Phaser.Scene {
  // Constructor
  constructor(key, platformPos, enemyPos, gemPos, spikePos, haveIcicles, exitPos, keyPos) {
    // Super
    super(key);

    // LevelKey
    this.levelKey = key;

    // Level orders
    this.nextLevel = {
      "Level1": "Level2",
      "Level2": "Level3",
      "Level3": "BossLevel",
      "Level4": "BossLevel",
      "BossLevel": "Level1"
    }

    // Platforms
    this.platformPos = platformPos;

    // Enemys
    this.enemyPos = enemyPos;

    // Exit
    this.exitPos = exitPos;

    // Gems
    this.gemPos = gemPos;

    // Key
    this.keyPos = keyPos;

    // Spike
    this.spikePos = spikePos;

    // Icicle
    this.haveIcicles = haveIcicles;
  }

  // Preload
  preload() {
    // Load images
    // Cave background
    this.load.image("cave", "https://content.codecademy.com/courses/learn-phaser/Cave%20Crisis/cave_background.png");

    // Platform
    this.load.image("platform", "https://content.codecademy.com/courses/learn-phaser/Cave%20Crisis/platform.png");

    // Gem
    this.load.image("gem", "assets/imgs/gem.png");

    // Key
    this.load.image("key", "assets/imgs/key.png");

    // Spike
    this.load.image("spike", "assets/imgs/spike.png");

    // Icicle
    this.load.image("icicle", "assets/imgs/icicle.png");

    // Load spritesheets
    // Codey
    this.load.spritesheet("codey", "https://content.codecademy.com/courses/learn-phaser/Cave%20Crisis/codey_sprite.png", {
      // Proportions
      frameWidth: 72,
      frameHeight: 90
    });

    // Enemy
    this.load.spritesheet("snowman", "https://content.codecademy.com/courses/learn-phaser/Cave%20Crisis/snowman.png", {
      // Proportions
      frameWidth: 50,
      frameHeight: 70
    });

    // Door
    this.load.spritesheet("exit", "https://content.codecademy.com/courses/learn-phaser/Cave%20Crisis/cave_exit.png", {
      // Proportions
      frameWidth: 60,
      frameHeight: 70
    });

    // Load SFXs
    // Key
    this.load.audio("key", "assets/SFX/key.ogg");

    // Gem
    this.load.audio("gem", "assets/SFX/gem.wav");

    // Music1
    this.load.audio("haveKey", "assets/SFX/haveKey.mp3");

    // Music2
    this.load.audio("music", "assets/SFX/music.mp3");

    // Jump
    this.load.audio("jump", "assets/SFX/bloop.ogg");

    // Lose
    this.load.audio("lose", "assets/SFX/lose.mp3");

    // Win
    this.load.audio("win", "assets/SFX/win.mp3");

    // Boss
    this.load.audio("boss", "assets/SFX/boss.mp3");
  }

  // Create
  create() {
    // Playing
    game.active = true;

    // BossDefeated
    game.bossDefeated = false;

    // Load SFXs
    game.gemSound = this.sound.add("gem");
    game.keySound = this.sound.add("key");
    game.music = this.sound.add("music");
    game.gotKeyMusic = this.sound.add("haveKey");
    game.jump = this.sound.add("jump");
    game.lose = this.sound.add("lose");
    game.win = this.sound.add("win");
    game.bossMusic = this.sound.add("boss");

    // Play music
    if (this.levelKey === "BossLevel") {
      // Boss level
      game.bossMusic.play();
    } else {
      // Normal level
      game.music.play();

      // Stop music
      game.gotKeyMusic.stop();
    }

    // Reset boss health
    game.bossHealth = 10;

    // Create background image
    this.add.image(0, 0, "cave").setOrigin(0, 0);

    // Create static group
    game.platforms = this.physics.add.staticGroup();

    // Create platforms
    this.platformPos.forEach(sprite => {
      game.platforms.create(sprite.x, sprite.y, "platform");
    });

    // Create player
    game.player = this.physics.add.sprite(50, 500, "codey").setScale(.8)

    // Player, Platforms collider
    this.physics.add.collider(game.player, game.platforms);

    // World bounds
    game.player.setCollideWorldBounds(true);

    // Input
    game.cursors = this.input.keyboard.createCursorKeys();

    // Animations
    // Codey run
    this.anims.create({
      // Animation key
      key: "run",

      // Frames
      frames: this.anims.generateFrameNumbers("codey", {
        start: 0,
        end: 3
      }),

      // Options
      frameRate: 5,
      repeat: -1
    });

    // Codey idle
    this.anims.create({
      // Animation key
      key: "idle",

      // Frames
      frames: this.anims.generateFrameNumbers("codey", {
        start: 4,
        end: 5
      }),

      // Options
      frameRate: 5,
      repeat: -1
    });

    // Create key
    game.key = this.physics.add.sprite(this.keyPos[0], this.keyPos[1], "key");
    game.key.setGravityY(-1500);

    // Key, Platforms, collider
    this.physics.add.collider(game.key, game.platforms);

    // Key, Player collider
    this.physics.add.overlap(game.key, game.player, (key) => {
      // Play sound
      game.keySound.play();

      // Stop music
      game.music.stop();

      // Destroy gem
      key.destroy();

      // Add to total gems
      game.hasKey = true;

      // Start gotKeyMusic
      if (this.levelKey !== "BossLevel") {
        game.gotKeyMusic.play();
      }
    });

    // Create group
    game.icicles = this.physics.add.group();

    // Boss
    game.boss = this.physics.add.sprite(config.width, 0, "snowman").setScale(1.5).setGravityX(-400);

    // Hide
    if (this.levelKey !== "BossLevel") {
      game.boss.visible = false;
    }

    // Boss, Platform collider
    this.physics.add.collider(game.boss, game.platforms);

    // Events
    // Icicle loop
    game.icicleLoop = this.time.addEvent({
      // Time
      delay: 1000,

      // Callback
      callback: () => {
        if (this.haveIcicles) {
          game.icicles.create(Math.random() * config.width, 0, "icicle").setScale(0.5);
        }
      },
      callbackScope: this,

      // Loop
      loop: true
    });

    // Boss move loop
    game.bossLoop = this.time.addEvent({
      // Time
      delay: 2000,

      // Callback
      callback: () => {
        // Win
        if (game.bossHealth <= 0) {
          // Show exit
          game.exit.visible = true;

          // Hide boss
          game.boss.visible = false;

          // Set boss defeated
          game.bossDefeated = true;

          // End icicle loop
          game.icicleLoop.destroy();

          // Stop boss music
          game.bossMusic.stop();

          // Start music
          game.gotKeyMusic.play();
        }

        // Move
        if (game.boss.x === 462.5) {
          game.boss.setVelocityX(-100).setGravityX(-400);
        } else {
          game.boss.setVelocityX(100).setGravityX(400);
        }

        // Minus boss health
        game.bossHealth--;
      },
      callbackScope: this,

      // Loop
      loop: true
    });

    // Boss, World bounds collider
    game.boss.setCollideWorldBounds(true);

    // Boss, Player collider
    this.physics.add.overlap(game.boss, game.player, () => {
      if (this.levelKey === "BossLevel" && !game.bossDefeated) {
        // Stop physics
        this.physics.pause();

        // End game
        game.active = false;

        // Stop boss music
        game.bossMusic.stop();

        // Fade out
        this.cameras.main.fade(800, 0, 0, 0, false, function(camera, progress) {
          if (progress > 0.9) {
            // Restart scene
            this.scene.restart();
          }
        });

        // Stop lose sound
        game.lose.stop();

        // Reset hasKey
        game.hasKey = false;

        // Reset gems
        game.totalGems = 0;

        // Reset boss health
        game.bossHealth = 10;
      }
    });

    // Icicle, Platforms collider
    this.physics.add.collider(game.icicles, game.platforms, function(icicle, platform) {
      icicle.destroy();
    });

    // Icicle, Player collider
    this.physics.add.overlap(game.icicles, game.player, () => {
      // Stop physics
      this.physics.pause();

      // End game
      game.active = false;

      // Stop boss music
      game.bossMusic.stop();

      // Fade out
      this.cameras.main.fade(800, 0, 0, 0, false, function(camera, progress) {
        if (progress > 0.9) {
          // Restart scene
          this.scene.restart();
        }
      });

      // Stop lose sound
      game.lose.stop();

      // Reset hasKey
      game.hasKey = false;

      // Reset gems
      game.totalGems = 0;
    });

    // Create group
    game.spikes = this.physics.add.group();

    // Create spikes
    this.spikePos.forEach(sprite => {
      game.spikes.create(sprite.x, sprite.y, "spike").setScale(0.5);
    });

    // Spike, Platforms collider
    this.physics.add.collider(game.spikes, game.platforms);

    // Spike, Player collider
    this.physics.add.overlap(game.spikes, game.player, () => {
      // Stop physics
      this.physics.pause();

      // End game
      game.active = false;

      // Stop music
      game.music.stop();
      game.gotKeyMusic.stop();

      // Fade out
      this.cameras.main.fade(800, 0, 0, 0, false, function(camera, progress) {
        if (progress > 0.9) {
          // Restart scene
          this.scene.restart();
        }
      });

      // Stop lose sound
      game.lose.stop();

      // Reset hasKey
      game.hasKey = false;

      // Reset gems
      game.totalGems = 0;
    });

    // Create group
    game.gems = this.physics.add.group();

    // Create gems
    this.gemPos.forEach(sprite => {
      game.gems.create(sprite.x, sprite.y, "gem").setGravityY(-1500);
    });

    // Gem, Platforms collider
    this.physics.add.collider(game.gems, game.platforms);

    // Gem, Player collider
    this.physics.add.overlap(game.gems, game.player, function(player, gem) {
      // Destroy gem
      gem.destroy();

      // Play sound
      game.gemSound.play();

      // Add to total gems
      game.totalGems++;
    });

    // Create group
    game.enemy = this.physics.add.group();

    // Create enemies
    this.enemyPos.forEach(sprite => {
      game.enemy.create(sprite.start, sprite.y, "snowman");
    });

    // Enemy, Platforms collider
    this.physics.add.collider(game.enemy, game.platforms);

    // Animations
    // Snowman idle
    this.anims.create({
      // Animation key
      key: "snowmanIdle",

      // Frames
      frames: this.anims.generateFrameNumbers("snowman", {
        start: 0,
        end: 3
      }),

      // Options
      frameRate: 4,
      repeat: -1
    });

    // Play enemy animation
    game.enemy.getChildren().forEach(sprite => {
      sprite.anims.play("snowmanIdle", true);
    });

    // Boss animation
    game.boss.anims.play("snowmanIdle", true);

    // Player, Enemy overlap
    this.physics.add.overlap(game.player, game.enemy, () => {
      // Stop physics
      this.physics.pause();

      // End game
      game.active = false;

      // Stop music
      game.music.stop();
      game.gotKeyMusic.stop();

      // Fade out
      this.cameras.main.fade(800, 0, 0, 0, false, function(camera, progress) {
        if (progress > 0.9) {
          // Restart scene
          this.scene.restart();
        }
      });

      // Reset hasKey
      game.hasKey = false;

      // Reset gems
      game.totalGems = 0;
    });

    // Create door
    game.exit = this.physics.add.sprite(this.exitPos[0], this.exitPos[1], "exit");

    // Hide or show
    if (this.levelKey === "BossLevel") {
      game.exit.visible = false;
    }

    // Animations
    // Door glow
    this.anims.create({
      // Animation key
      key: "glow",

      // Frames
      frames: this.anims.generateFrameNumbers("exit", {
        start: 0,
        end: 5
      }),

      // Options
      frameRate: 4,
      repeat: -1
    });

    // Exit, Platoforms, collider
    this.physics.add.collider(game.exit, game.platforms);

    // Player, Exit overlap
    this.physics.add.overlap(game.player, game.exit, () => {
      // Boss level
      if (game.bossDefeated || this.levelKey !== "BossLevel") {
        // Check if player has key
        if (game.hasKey && game.cursors.up.isDown) {
          // Stop all physics
          this.physics.pause();

          // End game
          game.active = false;

          // Stop music
          game.music.stop();
          game.gotKeyMusic.stop();

          // Fade out
          this.cameras.main.fade(800, 0, 0, 0, false, function(camera, progress) {
            if (progress > 0.9) {
              // Stop scene
              this.scene.stop(this.levelKey);

              // Start next scene
              this.scene.start(this.nextLevel[this.levelKey]);
            }
          });

          // Reset hasKey
          game.hasKey = false;

          // Reset gems
          game.totalGems = 0;
        }
      }
    });

    // Bring player to top
    this.children.bringToTop(game.player);

    // Enemy move tween
    for (var i = 0; i < game.enemy.getChildren().length; i++) {
      game.enemy.move = this.tweens.add({
        // Target
        targets: game.enemy.getChildren()[i],

        // Move
        x: this.enemyPos[i].end,

        // Ease
        ease: "Linear",

        // Duration
        duration: 900,

        // Repeat forever
        repeat: -1,

        // Yoyo
        yoyo: true
      });
    }
  }

  // Update
  update() {
    // Check if playing game
    if (game.active) {
      // Check if player has 3 gems
      if (game.hasKey) {
        // Play door glow animation
        game.exit.anims.play("glow", true);
      }

      // Right
      if (game.cursors.right.isDown) {
        // Move right
        game.player.setVelocityX(350);

        // Play player move animation
        game.player.anims.play("run", true);

        // Flip image
        game.player.flipX = false;

      // Left
      } else if (game.cursors.left.isDown) {
        // Move left
        game.player.setVelocityX(-350);

        // Play move animation
        game.player.anims.play("run", true);

        // Flip image
        game.player.flipX = true;

      // None
      } else {
        // Don't move
        game.player.setVelocityX(0);

        // Play player idle animation
        game.player.anims.play("idle", true);
      }

      // Jump
      if (game.cursors.up.isDown && game.player.body.blocked.down) {
        // Play jump sound
        game.jump.play();

        // Play player jump animation
        game.player.anims.play("jump", true);

        // Jump up
        game.player.setVelocityY(-800);
      }
    }
  }
}

// Levels
// Level1
class Level1 extends Level {
  // Constructor
  constructor() {
    // Super
    super("Level1", [
      {
        x: 50,
        y: 575
      },
      {
        x: 250,
        y: 575
      },
      {
        x: 450,
        y: 575
      }
    ],
    [
      {
        start: 215,
        end: 400,
        y: 500
      }
    ],
    [
      {
        x: 120,
        y: 520
      },
      {
        x: 250,
        y: 400
      },
      {
        x: 400,
        y: 400
      }
    ],
    [
      {
        x: 170,
        y: 540
      }
    ], false, [450, 500], [320, 250]);
  }
}

// Level2
class Level2 extends Level {
  // Constructor
  constructor() {
    // Super
    super("Level2", [
      {
        x: 50,
        y: 575
      },
      {
        x: 250,
        y: 575
      },
      {
        x: 450,
        y: 575
      },
      {
        x: 400,
        y: 380
      },
      {
        x: 100,
        y: 200
      },
    ],
    [
      {
        start: 480,
        end: 320,
        y: 300
      }
    ],
    [
      {
        x: 150,
        y: 500
      },
      {
        x: 200,
        y: 130
      },
      {
        x: 300,
        y: 250
      }
    ],
    [
      {
        x: 120,
        y: 160
      }
    ], false, [50, 142], [230, 370]);
  }
}

// Level3
class Level3 extends Level {
  // Constructor
  constructor() {
    // Super
    super("Level3", [
      {
        x: 50,
        y: 575
      },
      {
        x: 250,
        y: 575
      },
      {
        x: 450,
        y: 575
      },
      {
        x: 60,
        y: 300
      },
      {
        x: 440,
        y: 300
      },
      {
        x: 250,
        y: 440
      },
      {
        x: 250,
        y: 150
      }
    ],
    [
      {
        start: 20,
        end: 140,
        y: 0
      },
      {
        start: 360,
        end: 480,
        y: 0
      }
    ],
    [
      {
        x: 420,
        y: 240
      },
      {
        x: 80,
        y: 240
      },
      {
        x: 430,
        y: 500
      }
    ],
    [
    ], false, [250, 90], [250, 370]);
  }
}

// Level4
class Level4 extends Level {
  // Constructor
  constructor() {
    // Super
    super("Level4", [
      {
        x: 50,
        y: 575
      },
      {
        x: 250,
        y: 575
      },
      {
        x: 450,
        y: 575
      },
      {
        x: 60,
        y: 300
      },
      {
        x: 440,
        y: 300
      },
      {
        x: 250,
        y: 440
      },
      {
        x: 250,
        y: 150
      }
    ],
    [
      {
        start: 20,
        end: 140,
        y: 0
      },
      {
        start: 360,
        end: 480,
        y: 0
      }
    ],
    [
      {
        x: 420,
        y: 240
      },
      {
        x: 80,
        y: 240
      },
      {
        x: 430,
        y: 500
      }
    ],
    [
    ], false, [250, 90], [250, 370]);
  }
}

// BossLevel
class BossLevel extends Level {
  // Constructor
  constructor() {
    // Super
    super("BossLevel", [
      {
        x: 50,
        y: 575
      },
      {
        x: 250,
        y: 575
      },
      {
        x: 450,
        y: 575
      }
    ],
    [],
    [],
    [], true, [250, 142], [250, 370]);
  }
}

// Phaser config
const config = {
  // Type
  type: Phaser.AUTO,

  // Proportions
  width: 500,
  height: 600,

  // Physics
  physics: {
    // Default
    default: "arcade",

    // Arcade
    arcade: {
      // Gravity
      gravity: {
        y: 1500
      },

      // Options
      enableBody: true,
    }
  },

  // Scenes
  scene: [Level1, Level2, Level3, BossLevel]
};

const phaserGame = new Phaser.Game(config);
