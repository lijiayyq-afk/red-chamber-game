import * as Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyH!: Phaser.Input.Keyboard.Key;
  private interactTip!: Phaser.GameObjects.Text;
  private interactiveZones: Phaser.GameObjects.Zone[] = [];
  private onTriggerPlotCallback?: (chapterId: number) => void;
  
  // NPC 精灵
  private baochaiNPC!: Phaser.Physics.Arcade.Sprite;

  // 地图收集道具
  private collectables: Phaser.GameObjects.Container[] = [];
  
  // 大地图真实物理边界
  private readonly MAP_WIDTH = 1600;
  private readonly MAP_HEIGHT = 1200;

  // 记录宝玉出生点
  private startX = 800;
  private startY = 600;

  // 记录角色朝向
  private lastDirection = 'down';
  private fromScene = '';

  constructor() {
    super('GameScene');
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
    
    // 如果是从子场景传送回来，重设宝玉的坐标在相应的门外，避免直接居中
    if (data) {
      if (data.fromScene) {
        this.fromScene = data.fromScene;
      }
      
      if (data.fromScene === 'XiaoxiangScene') {
        // 潇湘馆门前（安全坐标，避开 47.5 触发半径，防返回时二次误触吸入）
        this.startX = 200;
        this.startY = 585;
        this.lastDirection = 'down';
      } else if (data.fromScene === 'YihongScene') {
        // 怡红院门前（安全坐标，避开 47.5 触发半径，防返回时二次误触吸入）
        this.startX = 800;
        this.startY = 275;
        this.lastDirection = 'down';
      } else {
        // 默认居中偏下
        this.startX = 800;
        this.startY = 700;
        this.lastDirection = 'down';
      }
      
      if (data.onTriggerPlot) {
        this.onTriggerPlotCallback = data.onTriggerPlot;
      }
    }
  }

  preload(): void {
    this.load.image('map', './dagwanyuan_map.png');
    // 加载4大核心角色的 1024x1024 4方向行走图 spritesheet (一帧 256x256 像素)
    this.load.spritesheet('baoyu', './baoyu_spritesheet.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('daiyu', './daiyu_spritesheet.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('baochai', './baochai_spritesheet.png', { frameWidth: 256, frameHeight: 256 });
    this.load.spritesheet('qingwen', './qingwen_spritesheet.png', { frameWidth: 256, frameHeight: 256 });
  }

  create(): void {
    // 1. 铺设大型水墨背景图 (设置尺寸为 1600x1200)
    const bgMap = this.add.image(this.MAP_WIDTH / 2, this.MAP_HEIGHT / 2, 'map');
    bgMap.setDisplaySize(this.MAP_WIDTH, this.MAP_HEIGHT);

    // 2. 镜头切镜淡入动画 (墨香漫溢)
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // 3. 配置镜头物理边界（移步换景关键！）
    this.cameras.main.setBounds(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);
    
    // 设置物理边界
    this.physics.world.setBounds(0, 0, this.MAP_WIDTH, this.MAP_HEIGHT);

    // 4. 添加落花粒子 system
    const flowerParticles = this.add.graphics();
    flowerParticles.fillStyle(0xffb7c5, 0.85);
    flowerParticles.fillCircle(4, 4, 4);
    flowerParticles.generateTexture('petal', 8, 8);
    flowerParticles.destroy();

    this.add.particles(0, -10, 'petal', {
      x: { min: 0, max: this.MAP_WIDTH },
      speedY: { min: 40, max: 90 },
      speedX: { min: -15, max: 15 },
      gravityY: 8,
      scale: { min: 0.6, max: 1.2 },
      rotate: { min: 0, max: 360 },
      lifespan: 12000,
      frequency: 250,
      maxParticles: 50,
    });

    // 5. 创建四方向精灵动画
    this.createAnimations();

    // 6. 渲染主角宝玉 (物理动态精灵)
    this.player = this.physics.add.sprite(this.startX, this.startY, 'baoyu');
    this.player.setScale(0.25);
    this.player.setCollideWorldBounds(true);
    
    // 调整物理阻挡体积只在脚底 (宽度 60, 高度 30，偏移量向下移)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setSize(60, 30);
    playerBody.setOffset(98, 195);

    // 7. 配置主镜头平滑跟随宝玉
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 8. 建立金色旋转环与呼吸光效同步
    const playerBorder = this.add.graphics();
    playerBorder.lineStyle(2, 0xd8c3a5, 0.8);
    playerBorder.strokeCircle(0, 0, 24);
    playerBorder.generateTexture('player_ring', 50, 50);
    playerBorder.destroy();

    const ring = this.add.image(this.startX, this.startY, 'player_ring');
    this.tweens.add({
      targets: ring,
      angle: 360,
      duration: 8000,
      repeat: -1
    });

    this.events.on('update', () => {
      if (this.player && ring) {
        ring.x = this.player.x;
        ring.y = this.player.y + 12; // 贴在脚底
      }
    });

    // 9. 渲染薛宝钗 NPC 精灵 (静立在滴翠亭旁)
    this.baochaiNPC = this.physics.add.sprite(1400, 880, 'baochai');
    this.baochaiNPC.setScale(0.25).setImmovable(true);
    this.baochaiNPC.anims.play('baochai-idle-down', true);

    // 10. 大观园水墨地形隐形阻挡区域（防止穿墙）
    const obstacles = this.physics.add.staticGroup();
    const addStaticWall = (x: number, y: number, w: number, h: number) => {
      const wall = this.add.zone(x, y, w, h);
      this.physics.add.existing(wall, true);
      obstacles.add(wall);
    };

    // 绘制隐形阻挡体积
    addStaticWall(800, 630, 480, 160);  // 1. 中央大湖泊水池
    addStaticWall(1350, 320, 260, 160); // 2. 右侧山石亭台
    addStaticWall(150, 750, 160, 240);  // 3. 左侧潇湘馆外翠竹林
    addStaticWall(200, 390, 280, 100);  // 4. 潇湘馆正房及后院墙
    addStaticWall(800, 90, 320, 90);    // 5. 怡红院正房及后院墙
    addStaticWall(1400, 830, 120, 70);  // 6. 滴翠亭水榭假山

    // 绑定物理碰撞
    this.physics.add.collider(this.player, obstacles);
    this.physics.add.collider(this.player, this.baochaiNPC);

    // 11. 放置场景传送门，走入大门自动切镜切换至室内场景！
    // 传送门 1：通往 潇湘馆 室内场景
    const zoneXiaoxiang = this.createInteractiveZone(200, 500, 95, '进入：潇湘馆', () => {
      this.teleportTo('XiaoxiangScene');
    });

    // 传送门 2：通往 怡红院 室内场景
    const zoneYihong = this.createInteractiveZone(800, 180, 95, '进入：怡红院', () => {
      this.teleportTo('YihongScene');
    });

    // 12. 交互气泡提示（悬浮上下浮动效果）
    this.interactTip = this.add.text(0, 0, '按 E 键 对话', {
      fontFamily: 'Noto Serif SC, serif',
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: 'rgba(178, 45, 45, 0.9)',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5).setVisible(false).setDepth(100);

    // 13. 撒落道具收集
    this.spawnCollectables();

    // 14. HUD 静态指引（屏幕上方跟随）
    const tip = this.add.text(this.scale.width / 2, this.scale.height - 35, '使用 WASD 或方向键行走。靠近NPC按E对话。走入潇湘馆或怡红院大门切换场景！', {
      fontFamily: 'Noto Serif SC, serif',
      fontSize: '13px',
      color: '#2b2b2b',
      backgroundColor: 'rgba(252, 250, 242, 0.85)',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
    tip.setScrollFactor(0); // 关键：不随镜头移动，永远浮动在最下方

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

    // 对返回源头的传送门施加 1.5 秒的激活冷却保护，双重堵死无限传送死循环
    if (this.fromScene === 'XiaoxiangScene') {
      zoneXiaoxiang.setData('active', false);
      this.time.delayedCall(1500, () => {
        zoneXiaoxiang.setData('active', true);
      });
    } else if (this.fromScene === 'YihongScene') {
      zoneYihong.setData('active', false);
      this.time.delayedCall(1500, () => {
        zoneYihong.setData('active', true);
      });
    }
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

    // 移动控制：使用 Arcade 物理速度驱动
    const speed = 240;
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

    // 设置物理速度
    this.player.setVelocity(vx, vy);

    // 归一化斜向速度，防止斜行超速
    if (vx !== 0 && vy !== 0) {
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      playerBody.velocity.normalize().scale(speed);
    }

    // 播放对应朝向的行走或 Idle 动画
    if (vx !== 0 || vy !== 0) {
      this.player.anims.play(`baoyu-walk-${this.lastDirection}`, true);
    } else {
      this.player.anims.play(`baoyu-idle-${this.lastDirection}`, true);
    }

    // NPC 交互检测与气泡冒泡逻辑 (靠近宝钗)
    let isNearInteractive = false;
    const distToBaochai = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.baochaiNPC.x, this.baochaiNPC.y);
    const isMobileInteract = (window as any).mobileControls?.interact;

    if (distToBaochai < 85) {
      isNearInteractive = true;
      const bounceY = Math.sin(this.time.now / 150) * 4;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const promptText = isTouch ? '点击【交互】/按E键' : '按 E 键 对话';
      this.interactTip.setText(promptText).setPosition(this.baochaiNPC.x, this.baochaiNPC.y - 60 + bounceY).setVisible(true);
      
      if (Phaser.Input.Keyboard.JustDown(this.keyE) || isMobileInteract) {
        if (isMobileInteract) {
          (window as any).mobileControls.interact = false;
        }
        this.player.setVelocity(0, 0);
        this.player.setPosition(this.baochaiNPC.x - 65, this.baochaiNPC.y);
        this.player.anims.play('baoyu-idle-right', true);
        this.lastDirection = 'right';
        
        // 镜头拉近并触发剧情
        this.cameras.main.zoomTo(1.3, 800);
        this.triggerPlot(5);
      }
    }

    if (!isNearInteractive) {
      this.interactTip.setVisible(false);
    }

    this.checkZoneOverlaps();
    this.checkItemCollections();
  }

  private createAnimations(): void {
    const keys = ['baoyu', 'daiyu', 'baochai', 'qingwen'];
    keys.forEach(key => {
      // 下、左、右、上四方向行走动画
      const animConfigs = [
        { key: `${key}-walk-down`, start: 0, end: 3 },
        { key: `${key}-walk-left`, start: 4, end: 7 },
        { key: `${key}-walk-right`, start: 8, end: 11 },
        { key: `${key}-walk-up`, start: 12, end: 15 }
      ];

      animConfigs.forEach(cfg => {
        if (!this.anims.exists(cfg.key)) {
          this.anims.create({
            key: cfg.key,
            frames: this.anims.generateFrameNumbers(key, { start: cfg.start, end: cfg.end }),
            frameRate: 6,
            repeat: -1
          });
        }
      });

      // 4方向 Idle 静态动画
      const idleConfigs = [
        { key: `${key}-idle-down`, frame: 0 },
        { key: `${key}-idle-left`, frame: 4 },
        { key: `${key}-idle-right`, frame: 8 },
        { key: `${key}-idle-up`, frame: 12 }
      ];

      idleConfigs.forEach(cfg => {
        if (!this.anims.exists(cfg.key)) {
          this.anims.create({
            key: cfg.key,
            frames: [{ key: key, frame: cfg.frame }],
            frameRate: 1
          });
        }
      });
    });
  }

  private createInteractiveZone(x: number, y: number, radius: number, label: string, callback: () => void): Phaser.GameObjects.Zone {
    const ring = this.add.arc(x, y, radius / 2, 0, 360, false, 0xb22d2d, 0.15);
    ring.setStrokeStyle(1.5, 0xb22d2d, 0.6);
    
    this.tweens.add({
      targets: ring,
      radius: radius,
      alpha: 0,
      duration: 2500,
      repeat: -1,
      ease: 'Quad.easeOut'
    });

    this.add.circle(x, y, 6, 0xb22d2d, 0.8);

    this.add.text(x, y - 25, label, {
      fontFamily: 'Noto Serif SC, serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#b22d2d',
      backgroundColor: 'rgba(252, 250, 242, 0.85)',
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, radius, radius);
    zone.setData('callback', callback);
    zone.setData('active', true);
    this.interactiveZones.push(zone);
    return zone;
  }

  private spawnCollectables(): void {
    // 道具撒落大观园各隐秘角落
    const positions = [
      { x: 300, y: 800, item: '落花绢袋' }, // 位于潇湘馆外竹林深处
      { x: 1300, y: 200, item: '金麒麟' },  // 位于大观园右上角假山亭台后
      { x: 600, y: 700, item: '火折子' }    // 位于大观园中部长廊石阶上
    ];

    positions.forEach(pos => {
      const light = this.add.circle(0, 0, 8, 0xd8c3a5, 0.5);
      this.tweens.add({
        targets: light,
        alpha: 0.1,
        scale: 1.8,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });

      const core = this.add.circle(0, 0, 5, 0xb89f74, 0.9);
      
      const text = this.add.text(0, -18, pos.item, {
        fontFamily: 'Noto Serif SC, serif',
        fontSize: '10px',
        color: '#5c4d37'
      }).setOrigin(0.5);

      const container = this.add.container(pos.x, pos.y);
      container.add([light, core, text]);
      container.setData('item', pos.item);
      container.setData('x', pos.x);
      container.setData('y', pos.y);
      container.setData('active', true);

      this.collectables.push(container);
    });
  }

  private checkZoneOverlaps(): void {
    for (const zone of this.interactiveZones) {
      if (!zone.getData('active')) continue;

      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y);
      if (dist < zone.width / 2) {
        zone.setData('active', false);
        const callback = zone.getData('callback');
        if (callback) callback();

        this.time.delayedCall(4000, () => {
          zone.setData('active', true);
        });
      }
    }
  }

  private checkItemCollections(): void {
    this.collectables.forEach(container => {
      if (!container.getData('active')) return;

      const ix = container.getData('x');
      const iy = container.getData('y');
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, ix, iy);

      if (dist < 35) {
        container.setData('active', false);
        const itemName = container.getData('item');
        
        const event = new CustomEvent('collect-item', { detail: { item: itemName } });
        window.dispatchEvent(event);

        this.tweens.add({
          targets: container,
          alpha: 0,
          scaleY: 0,
          duration: 400,
          onComplete: () => {
            container.destroy();
          }
        });
      }
    });
  }

  private teleportTo(sceneName: string): void {
    // 镜头墨香淡出，切镜至室内场景
    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(sceneName, { onTriggerPlot: this.onTriggerPlotCallback });
    });
  }

  private triggerPlot(chapterId: number): void {
    if (this.onTriggerPlotCallback) {
      this.onTriggerPlotCallback(chapterId);
    }
  }

  private triggerNavigation(): void {
    // 自动读取全局状态机
    const state = (window as any).stateManager ? (window as any).stateManager.getState() : { currentChapter: 1, inventory: [] };
    const chapter = state.currentChapter;
    const hasSachet = state.inventory.includes('落花绢袋');
    
    let tx = 800;
    let ty = 600;
    
    // 大地图导航目标映射
    if (chapter === 5) {
      tx = 1400; ty = 880; // 薛宝钗滴翠亭
    } else if (chapter === 6) {
      if (!hasSachet) {
        tx = 300; ty = 800; // 落花绢袋位置（左下竹林）
      } else {
        tx = 200; ty = 500; // 潇湘馆门前
      }
    } else if (chapter === 7 || chapter === 8) {
      tx = 800; ty = 180; // 怡红院大门
    } else {
      // 默认指引到中央偏下大空地/长廊
      tx = 800; ty = 700;
    }
    
    // 从主角头顶飘散3片桃花瓣粒子指向目标点
    for (let i = 0; i < 3; i++) {
      const petal = this.add.image(this.player.x, this.player.y - 15, 'petal');
      petal.setScale(1.3).setDepth(200).setTint(0xffb7c5);
      
      this.tweens.add({
        targets: petal,
        x: tx,
        y: ty,
        angle: 720,
        alpha: { start: 1, end: 0 },
        duration: 1800 + i * 350,
        ease: 'Quad.easeInOut',
        onComplete: () => {
          petal.destroy();
        }
      });
    }
  }
}
