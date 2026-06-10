import * as Phaser from 'phaser';

export class YihongScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyH!: Phaser.Input.Keyboard.Key;
  private interactTip!: Phaser.GameObjects.Text;
  private qingwenSprite!: Phaser.Physics.Arcade.Sprite;
  private onTriggerPlotCallback?: (chapterId: number) => void;
  private lastDirection = 'down';

  constructor() {
    super('YihongScene');
  }

  public setOnTriggerPlot(callback: (chapterId: number) => void): void {
    this.onTriggerPlotCallback = callback;
  }

  init(data: any): void {
    if (this.input && this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.keyH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    }
    if (data && data.onTriggerPlot) {
      this.onTriggerPlotCallback = data.onTriggerPlot;
    }
  }

  preload(): void {
    this.load.image('yihong_bg', './yihong_bg.png');
    this.load.spritesheet('baoyu', './baoyu_spritesheet.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('qingwen', './qingwen_spritesheet.png', { frameWidth: 256, frameHeight: 256 });
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    // 产生落花花瓣纹理，以便红叶寻航使用
    if (!this.textures.exists('petal')) {
      const flowerParticles = this.add.graphics();
      flowerParticles.fillStyle(0xffb7c5, 0.85);
      flowerParticles.fillCircle(4, 4, 4);
      flowerParticles.generateTexture('petal', 8, 8);
      flowerParticles.destroy();
    }

    // 1. 铺设怡红院内景
    const bg = this.add.image(width / 2, height / 2, 'yihong_bg');
    bg.setDisplaySize(width, height);

    // 2. 镜头淡入 (墨香渐变)
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // 物理世界边界
    this.physics.world.setBounds(0, 0, width, height);

    // 3. 渲染晴雯像素NPC (不再代用薛宝钗图片)
    this.qingwenSprite = this.physics.add.sprite(width / 2 + 120, height / 2 - 50, 'qingwen');
    this.qingwenSprite.setScale(0.25);
    this.qingwenSprite.setImmovable(true);

    const qwBody = this.qingwenSprite.body as Phaser.Physics.Arcade.Body;
    qwBody.setSize(60, 30);
    qwBody.setOffset(98, 195);

    // 晴雯面向左静立
    this.qingwenSprite.anims.play('qingwen-idle-left', true);

    // 晴雯红圈环绕
    const ring = this.add.arc(this.qingwenSprite.x, this.qingwenSprite.y + 12, 24, 0, 360, false, 0xb22d2d, 0.15);
    ring.setStrokeStyle(1.5, 0xb22d2d, 0.6);
    this.tweens.add({
      targets: ring,
      radius: 48,
      alpha: 0,
      duration: 3000,
      repeat: -1
    });

    // 4. 渲染宝玉物理动态精灵
    this.player = this.physics.add.sprite(width / 2 - 120, height - 150, 'baoyu');
    this.player.setScale(0.25);
    this.player.setCollideWorldBounds(true);

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(60, 30);
    playerBody.setOffset(98, 195);

    // 5. 怡红院室内物理阻挡（红木架、后室屏风等）
    const obstacles = this.physics.add.staticGroup();
    const addStaticWall = (x: number, y: number, w: number, h: number) => {
      const wall = this.add.zone(x, y, w, h);
      this.physics.add.existing(wall, true);
      obstacles.add(wall);
    };

    addStaticWall(width / 2, 120, width, 200);   // 顶部红木屏风与榻后墙面
    addStaticWall(50, height / 2, 100, height);  // 左侧木架围墙
    addStaticWall(width - 50, height / 2, 100, height); // 右侧博古架围墙

    this.physics.add.collider(this.player, obstacles);
    this.physics.add.collider(this.player, this.qingwenSprite);

    // 6. 交互气泡提示
    this.interactTip = this.add.text(0, 0, '按 E 键 交互', {
      fontFamily: 'Noto Serif SC, serif',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: 'rgba(178, 45, 45, 0.95)',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    // 7. 提示信息与UI
    this.add.text(width / 2, 40, '—— 怡红院内室 ——', {
      fontFamily: 'Ma Shan Zheng, cursive',
      fontSize: '24px',
      color: '#b22d2d',
      backgroundColor: 'rgba(252, 250, 242, 0.8)',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 65, '靠近晴雯或左上病榻按E交互触发剧情。向下方走出大门回到大地图。', {
      fontFamily: 'Noto Serif SC, serif',
      fontSize: '12px',
      color: '#5c4d37',
      backgroundColor: 'rgba(252, 250, 242, 0.8)',
      padding: { x: 8, y: 3 }
    }).setOrigin(0.5);

    // 监听对话结束事件，平滑恢复镜头
    const onDialogueEnded = () => {
      if (this.cameras && this.cameras.main) {
        this.cameras.main.zoomTo(1.0, 800);
      }
    };
    window.addEventListener('dialogue-ended', onDialogueEnded);
    this.events.once('shutdown', () => {
      window.removeEventListener('dialogue-ended', onDialogueEnded);
    });
  }

  update(): void {
    const dialogueBox = document.getElementById('dialogue-box');
    const puzzleOverlay = document.getElementById('puzzle-overlay');
    if (
      (dialogueBox && dialogueBox.style.display !== 'none') ||
      (puzzleOverlay && puzzleOverlay.style.display !== 'none')
    ) {
      this.player.setVelocity(0, 0);
      this.player.anims.play(`baoyu-idle-${this.lastDirection}`, true);
      this.interactTip.setVisible(false);
      return;
    }

    if (!this.cursors || !this.player) return;

    // 红叶寻航导航
    if (Phaser.Input.Keyboard.JustDown(this.keyH)) {
      this.triggerNavigation();
    }

    // 物理移动驱动
    const speed = 200;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left?.isDown) {
      vx = -speed;
      this.lastDirection = 'left';
    } else if (this.cursors.right?.isDown) {
      vx = speed;
      this.lastDirection = 'right';
    }

    if (this.cursors.up?.isDown) {
      vy = -speed;
      this.lastDirection = 'up';
    } else if (this.cursors.down?.isDown) {
      vy = speed;
      this.lastDirection = 'down';
    }

    this.player.setVelocity(vx, vy);

    if (vx !== 0 && vy !== 0) {
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      playerBody.velocity.normalize().scale(speed);
    }

    if (vx !== 0 || vy !== 0) {
      this.player.anims.play(`baoyu-walk-${this.lastDirection}`, true);
    } else {
      this.player.anims.play(`baoyu-idle-${this.lastDirection}`, true);
    }

    // NPC 与物体交互检查
    let isNearInteractive = false;

    // 1. 靠近晴雯，触发撕扇
    const distToQingwen = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.qingwenSprite.x, this.qingwenSprite.y);
    if (distToQingwen < 85) {
      isNearInteractive = true;
      const bounceY = Math.sin(this.time.now / 150) * 4;
      this.interactTip.setText('按 E 键 对话').setPosition(this.qingwenSprite.x, this.qingwenSprite.y - 60 + bounceY).setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.player.setVelocity(0, 0);
        this.player.setPosition(this.qingwenSprite.x - 65, this.qingwenSprite.y);
        this.player.anims.play('baoyu-idle-right', true);
        this.lastDirection = 'right';
        
        // 镜头拉近并触发剧情
        this.cameras.main.zoomTo(1.4, 800);
        
        if (this.onTriggerPlotCallback) {
          this.onTriggerPlotCallback(7); // 触发第七回 晴雯撕扇
        }
      }
    }

    // 2. 靠近卧榻床铺 (例如左上方角落) 触发第八回：宝玉挨打
    if (!isNearInteractive && this.player.x < 180 && this.player.y < 260) {
      isNearInteractive = true;
      const bounceY = Math.sin(this.time.now / 150) * 4;
      this.interactTip.setText('按 E 键 卧床休养').setPosition(120, 160 + bounceY).setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.player.setVelocity(0, 0);
        this.player.setPosition(180, 260); // 止步
        this.player.anims.play('baoyu-idle-up', true);
        this.lastDirection = 'up';
        
        this.cameras.main.zoomTo(1.5, 800);
        
        if (this.onTriggerPlotCallback) {
          this.onTriggerPlotCallback(8); // 触发第八回 宝玉挨打
        }
      }
    }

    if (!isNearInteractive) {
      this.interactTip.setVisible(false);
    }

    // 走到下方大门返回大观园
    const height = this.scale.height;
    if (this.player.y > height - 60) {
      this.player.y = height - 100;
      this.player.setVelocity(0, 0);
      
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('GameScene', { fromScene: 'YihongScene', onTriggerPlot: this.onTriggerPlotCallback });
      });
    }
  }

  private triggerNavigation(): void {
    const state = (window as any).stateManager ? (window as any).stateManager.getState() : { currentChapter: 7 };
    const chapter = state.currentChapter;
    
    let tx = this.qingwenSprite.x;
    let ty = this.qingwenSprite.y;
    
    if (chapter === 8) {
      tx = 120; // 病榻位置
      ty = 160;
    }
    
    // 飞出桃花瓣，指引怡红院内部的活动点
    for (let i = 0; i < 3; i++) {
      const petal = this.add.image(this.player.x, this.player.y - 15, 'petal');
      petal.setScale(1.3).setDepth(200).setTint(0xffb7c5);
      
      this.tweens.add({
        targets: petal,
        x: tx,
        y: ty,
        angle: 720,
        alpha: { start: 1, end: 0 },
        duration: 1500 + i * 300,
        ease: 'Quad.easeInOut',
        onComplete: () => {
          petal.destroy();
        }
      });
    }
  }
}
