import * as Phaser from 'phaser';

export class XiaoxiangScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyH!: Phaser.Input.Keyboard.Key;
  private interactTip!: Phaser.GameObjects.Text;
  private daiyuSprite!: Phaser.Physics.Arcade.Sprite;
  private onTriggerPlotCallback?: (chapterId: number) => void;
  private lastDirection = 'down';

  constructor() {
    super('XiaoxiangScene');
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
    this.load.image('xiaoxiang_bg', './xiaoxiang_bg.png');
    this.load.spritesheet('baoyu', './baoyu_spritesheet.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('daiyu', './daiyu_spritesheet.png', { frameWidth: 256, frameHeight: 256 });
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

    // 1. 铺设潇湘馆清幽的庭院竹林内景
    const bg = this.add.image(width / 2, height / 2, 'xiaoxiang_bg');
    bg.setDisplaySize(width, height);

    // 2. 镜头切镜淡入效果 (墨汁渐变过渡)
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // 物理世界边界
    this.physics.world.setBounds(0, 0, width, height);

    // 3. 渲染黛玉像素NPC
    this.daiyuSprite = this.physics.add.sprite(width / 2 + 100, height / 2, 'daiyu');
    this.daiyuSprite.setScale(0.25);
    this.daiyuSprite.setImmovable(true);
    
    // 黛玉阻挡体积
    const dyBody = this.daiyuSprite.body as Phaser.Physics.Arcade.Body;
    dyBody.setSize(60, 30);
    dyBody.setOffset(98, 195);
    
    // 让黛玉面向左边坐下/静立
    this.daiyuSprite.anims.play('daiyu-idle-left', true);

    // 黛玉脚下环绕淡淡的清幽波纹
    const ring = this.add.arc(this.daiyuSprite.x, this.daiyuSprite.y + 12, 24, 0, 360, false, 0x2c5e43, 0.15);
    ring.setStrokeStyle(1.5, 0x2c5e43, 0.6);
    this.tweens.add({
      targets: ring,
      radius: 48,
      alpha: 0,
      duration: 3000,
      repeat: -1
    });

    // 4. 渲染贾宝玉行走精灵 (物理动态精灵，初始出现在大门上方)
    this.player = this.physics.add.sprite(width / 2 - 120, height - 150, 'baoyu');
    this.player.setScale(0.25);
    this.player.setCollideWorldBounds(true);
    
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(60, 30);
    playerBody.setOffset(98, 195);

    // 5. 室内物理阻挡（顶端翠竹林、花案等）
    const obstacles = this.physics.add.staticGroup();
    const addStaticWall = (x: number, y: number, w: number, h: number) => {
      const wall = this.add.zone(x, y, w, h);
      this.physics.add.existing(wall, true);
      obstacles.add(wall);
    };

    addStaticWall(width / 2, 120, width, 200);   // 顶部翠竹林及假山后墙
    addStaticWall(50, height / 2, 100, height);  // 左墙竹林
    addStaticWall(width - 50, height / 2, 100, height); // 右墙竹林

    this.physics.add.collider(this.player, obstacles);
    this.physics.add.collider(this.player, this.daiyuSprite);

    // 6. 交互气泡提示
    this.interactTip = this.add.text(0, 0, '按 E 键 交互', {
      fontFamily: 'Noto Serif SC, serif',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: 'rgba(44, 94, 67, 0.95)',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    // 7. UI 提示
    this.add.text(width / 2, 40, '—— 潇湘馆内 ——', {
      fontFamily: 'Ma Shan Zheng, cursive',
      fontSize: '24px',
      color: '#2c5e43',
      backgroundColor: 'rgba(252, 250, 242, 0.8)',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 65, '靠近黛玉按E开启对话。向下方移动走出大门，回到大地图。', {
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

    const isMobileNav = (window as any).mobileControls?.nav;

    // 红叶寻航导航
    if (Phaser.Input.Keyboard.JustDown(this.keyH) || isMobileNav) {
      if (isMobileNav) {
        (window as any).mobileControls.nav = false;
      }
      this.triggerNavigation();
    }

    // 移动控制
    const speed = 200;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left?.isDown || (window as any).mobileControls?.left) {
      vx = -speed;
      this.lastDirection = 'left';
    } else if (this.cursors.right?.isDown || (window as any).mobileControls?.right) {
      vx = speed;
      this.lastDirection = 'right';
    }

    if (this.cursors.up?.isDown || (window as any).mobileControls?.up) {
      vy = -speed;
      this.lastDirection = 'up';
    } else if (this.cursors.down?.isDown || (window as any).mobileControls?.down) {
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

    // 靠近黛玉，按E交互触发剧情
    let isNearInteractive = false;
    const distToDaiyu = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.daiyuSprite.x, this.daiyuSprite.y);
    const isMobileInteract = (window as any).mobileControls?.interact;

    if (distToDaiyu < 85) {
      isNearInteractive = true;
      const bounceY = Math.sin(this.time.now / 150) * 4;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const promptText = isTouch ? '点击【交互】/按E键' : '按 E 键 交互';
      this.interactTip.setText(promptText).setPosition(this.daiyuSprite.x, this.daiyuSprite.y - 60 + bounceY).setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this.keyE) || isMobileInteract) {
        if (isMobileInteract) {
          (window as any).mobileControls.interact = false;
        }
        this.player.setVelocity(0, 0);
        this.player.setPosition(this.daiyuSprite.x - 65, this.daiyuSprite.y); // 强制并排站立
        this.player.anims.play('baoyu-idle-right', true);
        this.lastDirection = 'right';
        
        // 镜头拉近聚焦
        this.cameras.main.zoomTo(1.4, 800);
        
        if (this.onTriggerPlotCallback) {
          this.onTriggerPlotCallback(6); // 触发第六回 黛玉葬花
        }
      }
    }

    if (!isNearInteractive) {
      this.interactTip.setVisible(false);
    }

    // 走到下方大门返回大观园
    const height = this.scale.height;
    if (this.player.y > height - 60) {
      this.player.y = height - 100; // 防止陷入循环触发
      this.player.setVelocity(0, 0);
      
      // 镜头淡出
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('GameScene', { fromScene: 'XiaoxiangScene', onTriggerPlot: this.onTriggerPlotCallback });
      });
    }
  }

  private triggerNavigation(): void {
    const tx = this.daiyuSprite.x;
    const ty = this.daiyuSprite.y;
    
    // 从宝玉身上飞出桃花瓣，指向林妹妹
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
