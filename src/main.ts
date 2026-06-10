import * as Phaser from 'phaser';
import './style.css';
import { PlotStateManager, GameEnding } from './PlotStateManager';
import { DialogueEngine } from './DialogueEngine';
import { PuzzleSolver } from './PuzzleSolver';
import { AvoidanceSolver } from './AvoidanceSolver';
import { PoetryAndFanSolver, FanType } from './PoetryAndFanSolver';
import { SearchAndHideSolver } from './SearchAndHideSolver';
import { redChamberScript, redChamberGuides } from './dialogueScript';
import { GameScene } from './scenes/GameScene';
import { XiaoxiangScene } from './scenes/XiaoxiangScene';
import { YihongScene } from './scenes/YihongScene';

// 1. 初始化状态管理器与算法解谜类
const stateManager = new PlotStateManager();
(window as any).stateManager = stateManager;
const dialogueEngine = new DialogueEngine(stateManager, redChamberScript);
const puzzleSolver = new PuzzleSolver();
const avoidanceSolver = new AvoidanceSolver();
const poetryFanSolver = new PoetryAndFanSolver();

// 2. 渲染包含立绘头像结构的 HTML UI 层
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <!-- Phaser 渲染画布容器 -->
  <div id="game-container"></div>

  <!-- 全屏游玩挂件（精美小玉佩） -->
  <div id="hud-fullscreen-btn" class="hud-fullscreen-btn" style="position: absolute; top: 20px; right: 74px; z-index: 100; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--gold-juan); background: var(--bg-paper); box-shadow: 0 4px 10px rgba(0,0,0,0.15); transition: opacity 0.3s ease, transform 0.2s ease;">
    <!-- 古典方孔圆钱 SVG 挂件 -->
    <svg viewBox="0 0 64 64" style="width: 20px; height: 20px; fill: var(--red-zhu); margin-top: 2px;">
      <path d="M32,2A30,30,0,1,0,62,32,30,30,0,0,0,32,2Zm0,54A24,24,0,1,1,56,32,24,24,0,0,1,32,56Z"/>
      <rect x="24" y="24" width="16" height="16" style="fill:none;stroke:var(--red-zhu);stroke-width:4;"/>
    </svg>
    <div id="fullscreen-btn-text" style="font-family: var(--font-cursive); font-size: 0.62rem; color: var(--red-zhu); font-weight: bold; margin-top: -1px; margin-bottom: 2px;">全屏</div>
  </div>

  <!-- HUD 展开挂坠（精美小玉佩） -->
  <div id="hud-toggle-btn" class="hud-toggle-btn" style="position: absolute; top: 20px; right: 20px; z-index: 100; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--gold-juan); background: var(--bg-paper); box-shadow: 0 4px 10px rgba(0,0,0,0.15); transition: opacity 0.3s ease, transform 0.2s ease;">
    <!-- 古典玉佩 SVG 挂件 -->
    <svg viewBox="0 0 64 64" style="width: 22px; height: 22px; fill: var(--green-dai); margin-top: 2px;">
      <path d="M32,2A30,30,0,1,0,62,32,30,30,0,0,0,32,2Zm0,54A24,24,0,1,1,56,32,24,24,0,0,1,32,56Z"/>
      <path d="M32,16A16,16,0,1,0,48,32,16,16,0,0,0,32,16Zm0,26A10,10,0,1,1,42,32,10,10,0,0,1,32,42Z"/>
    </svg>
    <div style="font-family: var(--font-cursive); font-size: 0.62rem; color: var(--green-dai); font-weight: bold; margin-top: -1px; margin-bottom: 2px;">锦囊</div>
  </div>

  <!-- 顶端轻量化目标提示 -->
  <div id="hud-target-banner" style="position: absolute; top: 15px; left: 50%; transform: translateX(-50%); z-index: 50; display: flex; align-items: center; justify-content: center; pointer-events: none; opacity: 0; transition: opacity 0.5s ease;">
    <div style="background: rgba(252, 250, 242, 0.94); border: 1.5px solid var(--gold-juan); border-radius: 4px; padding: 5px 16px; box-shadow: 0 4px 12px rgba(43, 33, 22, 0.15); display: flex; align-items: center; gap: 6px;">
      <span style="color: var(--red-zhu); font-size: 0.9rem;">🎋</span>
      <span style="font-family: var(--font-serif); font-size: 0.8rem; color: #5c4d37; font-weight: bold; letter-spacing: 1px;">目标：<span id="hud-target-text"></span></span>
    </div>
  </div>

  <!-- 顶部提示横幅（获得宝物时弹出） -->
  <div id="toast-banner" style="position: absolute; top: -50px; left: 50%; transform: translateX(-50%); background: rgba(178, 45, 45, 0.9); border: 2px solid var(--gold-juan); color: #fcfaf2; padding: 8px 24px; border-radius: 4px; font-family: var(--font-cursive); font-size: 1.4rem; z-index: 100; transition: top 0.5s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.25);">
    获得宝物：【<span id="toast-item-name"></span>】
  </div>

  <!-- HUD 状态监控板（初始默认隐藏，不挡视野） -->
  <div class="status-panel" id="hud-panel">
    <!-- 折叠收起叉号 -->
    <div id="hud-close-btn" style="position: absolute; top: 10px; right: 14px; cursor: pointer; font-size: 1.3rem; color: var(--text-muted); font-weight: bold; transition: color 0.2s;" onmouseover="this.style.color='var(--red-zhu)'" onmouseout="this.style.color='var(--text-muted)'">×</div>
    
    <div class="status-title">金陵浮生志</div>
    <div class="status-item">
      <span class="status-label">当前回目:</span>
      <span class="status-value" id="hud-chapter">第一回 黛玉进府</span>
    </div>
    <!-- 快速选关/跳转回目 -->
    <div class="status-item" style="margin-top: 6px; display: flex; align-items: center; gap: 8px; position: relative;">
      <span class="status-label" style="font-weight: bold;">回目跳转:</span>
      <div class="chapter-custom-select" id="chapter-custom-select">
        <div class="chapter-select-btn" id="chapter-select-btn">第一回 黛玉进府</div>
        <div class="chapter-dropdown-list" id="chapter-dropdown-list">
          <div class="chapter-dropdown-item active" data-value="1">第一回 黛玉进府</div>
          <div class="chapter-dropdown-item" data-value="2">第二回 宝黛初见</div>
          <div class="chapter-dropdown-item" data-value="3">第三回 金锁金印</div>
          <div class="chapter-dropdown-item" data-value="4">第四回 题大观园</div>
          <div class="chapter-dropdown-item" data-value="5">第五回 宝钗扑蝶</div>
          <div class="chapter-dropdown-item" data-value="6">第六回 黛玉葬花</div>
          <div class="chapter-dropdown-item" data-value="7">第七回 晴雯撕扇</div>
          <div class="chapter-dropdown-item" data-value="8">第八回 怡红挨打</div>
          <div class="chapter-dropdown-item" data-value="9">第九回 两宴酒令</div>
          <div class="chapter-dropdown-item" data-value="10">第十回 抄检风波</div>
        </div>
      </div>
    </div>
    <div class="status-item">
      <span class="status-label">黛玉羁绊:</span>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" id="bar-daiyu" style="width: 0%"></div>
      </div>
      <span class="status-value" id="val-daiyu">0</span>
    </div>
    <div class="status-item">
      <span class="status-label">宝钗羁绊:</span>
      <div class="progress-bar-container">
        <div class="progress-bar-fill green" id="bar-baochai" style="width: 0%"></div>
      </div>
      <span class="status-value" id="val-baochai">0</span>
    </div>
    <div class="status-item">
      <span class="status-label">红尘出世:</span>
      <span class="status-value" id="val-out" style="color: var(--red-zhu)">0</span>
    </div>
    <div class="status-item">
      <span class="status-label">红尘入世:</span>
      <span class="status-value" id="val-in" style="color: var(--green-dai)">0</span>
    </div>
    <div class="status-item" style="border-top: 1px dashed var(--gold-juan); padding-top: 6px; margin-top: 8px;">
      <span class="status-label">随身行囊:</span>
      <span class="status-value" id="hud-inventory" style="font-size: 0.8rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">无</span>
    </div>
    <!-- 主要角色心智个性 -->
    <div style="border-top: 1px dashed var(--gold-juan); padding-top: 8px; margin-top: 8px;">
      <div style="font-family: var(--font-cursive); font-size: 1.1rem; color: var(--green-dai); font-weight: bold; margin-bottom: 6px; text-align: left;">🎭 角色心智个性</div>
      <div style="font-size: 0.82rem; margin-bottom: 4px; display: flex; flex-direction: column; gap: 2px; text-align: left;">
        <span style="font-weight: bold; color: var(--text-ink);">林黛玉：</span>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-left: 8px;">
          <span>忧郁度: <span id="val-daiyu-melancholy" style="color: var(--red-zhu)">50</span></span>
          <span>才情值: <span id="val-daiyu-wit" style="color: var(--green-dai)">50</span></span>
        </div>
      </div>
      <div style="font-size: 0.82rem; margin-bottom: 4px; display: flex; flex-direction: column; gap: 2px; text-align: left;">
        <span style="font-weight: bold; color: var(--text-ink);">薛宝钗：</span>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-left: 8px;">
          <span>圆滑度: <span id="val-baochai-tact" style="color: var(--green-dai)">50</span></span>
          <span>功名心: <span id="val-baochai-economic" style="color: #8b6e4e;">50</span></span>
        </div>
      </div>
      <div style="font-size: 0.82rem; display: flex; flex-direction: column; gap: 2px; text-align: left;">
        <span style="font-weight: bold; color: var(--text-ink);">晴雯：</span>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-left: 8px;">
          <span>孤傲直爽度: <span id="val-qingwen-pride" style="color: var(--red-zhu)">50</span></span>
        </div>
      </div>
    </div>
    <!-- 回目指引锦囊 -->
    <div style="border-top: 1px dashed var(--gold-juan); padding-top: 8px; margin-top: 8px; text-align: left;">
      <div style="font-family: var(--font-cursive); font-size: 1.15rem; color: var(--red-zhu); font-weight: bold; margin-bottom: 4px;">🎬 回目指引</div>
      <div style="font-size: 0.82rem; margin-bottom: 2px;"><b>去哪玩:</b> <span id="guide-where" style="color: var(--text-ink)"></span></div>
      <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;"><b>怎么玩:</b> <span id="guide-how"></span></div>
    </div>
  </div>

  <!-- AVG立绘对话叠加层（古风宣纸风格） -->
  <div class="dialogue-overlay" id="dialogue-box" style="display: none;">
    <!-- 左侧说话者立绘（如贾宝玉） -->
    <img id="avatar-left" class="avatar-img" src="" style="margin-right: 25px;" />
    
    <!-- 中间文本与选择肢 -->
    <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; text-align: left; pointer-events: auto;">
      <div id="dialogue-speaker" style="font-family: var(--font-cursive); font-size: 1.6rem; color: var(--red-zhu); margin-bottom: 6px; font-weight: bold; letter-spacing: 1px;"></div>
      <div id="dialogue-text" style="font-size: 1.12rem; line-height: 1.6; margin-bottom: 12px; color: var(--text-ink); font-weight: 550;"></div>
      <div id="dialogue-options" style="display: flex; flex-direction: column; gap: 8px;"></div>
    </div>
    
    <!-- 右侧说话者立绘（如林黛玉/薛宝钗） -->
    <img id="avatar-right" class="avatar-img" src="" style="margin-left: 25px;" />
  </div>

  <!-- 古典解谜卡片容器 -->
  <div class="puzzle-overlay" id="puzzle-overlay" style="display: none;">
    <div class="puzzle-card" id="puzzle-card">
      <!-- 动态加载解谜 -->
    </div>
  </div>

  <!-- 水墨风格题字幅弹窗 -->
  <div class="ink-alert-overlay" id="ink-alert-box">
    <div class="ink-alert-card">
      <div class="ink-alert-title" id="ink-alert-title">题识</div>
      <div class="ink-alert-text" id="ink-alert-text">内容</div>
      <button class="ancient-btn" id="ink-alert-btn">知晓</button>
    </div>
  </div>

  <!-- 移动端虚拟手柄 -->
  <div id="mobile-controller">
    <!-- D-pad 十字方向键 -->
    <div class="dpad-container">
      <div class="dpad-center-decor">大观园</div>
      <div class="dpad-btn up" id="dpad-up">上</div>
      <div class="dpad-btn down" id="dpad-down">下</div>
      <div class="dpad-btn left" id="dpad-left">左</div>
      <div class="dpad-btn right" id="dpad-right">右</div>
    </div>
    <!-- 右侧功能键：交互与寻航 -->
    <div class="action-container">
      <div class="action-btn-nav" id="action-nav">
        寻
        <span>导航</span>
      </div>
      <div class="action-btn-interact" id="action-interact">
        交
        <span>E键</span>
      </div>
    </div>
  </div>

  <!-- 红楼研读札记学术小课堂浮层 -->
  <div class="notebook-overlay" id="notebook-overlay">
    <div class="notebook-card">
      <div class="notebook-title" id="notebook-title">第一回 研读札记</div>
      <div class="notebook-section-title">🎋 意象与礼法</div>
      <div class="notebook-body" id="notebook-body"></div>
      <div class="notebook-footer">
        <button class="ancient-btn" id="notebook-close-btn">合卷重游</button>
      </div>
    </div>
  </div>
`;

// 3. 监听大观园 Phaser 场景捡起道具事件
window.addEventListener('collect-item', ((e: CustomEvent) => {
  const itemName = e.detail.item;
  
  // 1. 将物品塞入状态机行囊
  stateManager.addItem(itemName);
  updateHUD();
  playCollectSound(); // 播放获得宝物玉磬清音

  // 2. 触发弹出获得宝物动画横幅
  const toast = document.getElementById('toast-banner')!;
  document.getElementById('toast-item-name')!.innerText = itemName;
  toast.style.top = '30px'; // 弹下

  setTimeout(() => {
    toast.style.top = '-80px'; // 缩回
  }, 3000);
}) as EventListener);

class GuqinBGM {
  private active = false;
  private timer: any = null;
  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;

  public start(): void {
    if (this.active) return;
    this.active = true;
    
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    try {
      this.delayNode = audioCtx.createDelay(2.0);
      this.delayNode.delayTime.setValueAtTime(0.8, audioCtx.currentTime);
      
      this.feedbackGain = audioCtx.createGain();
      this.feedbackGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      
      this.delayNode.connect(this.feedbackGain);
      this.feedbackGain.connect(this.delayNode);
      this.delayNode.connect(audioCtx.destination);
    } catch (err) {}

    this.playNoteLoop();
  }

  public stop(): void {
    this.active = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private playNoteLoop = (): void => {
    if (!this.active) return;

    try {
      if (audioCtx && audioCtx.state === 'running') {
        this.triggerGuqinNote();
      }
    } catch (e) {}

    const nextInterval = 3000 + Math.random() * 4000;
    this.timer = setTimeout(this.playNoteLoop, nextInterval);
  }

  private triggerGuqinNote(): void {
    if (!audioCtx) return;

    const pentatonic = [
      146.83, 164.81, 196.00, 220.00, // D3, E3, G3, A3
      261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
      523.25, 587.33, 659.25, 783.99, 880.00  // C5, D5, E5, G5, A5
    ];

    const baseFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
    
    try {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      
      gainNode.connect(audioCtx.destination);
      if (this.delayNode) {
        gainNode.connect(this.delayNode);
      }

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 1.8);

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(baseFreq * 0.994, audioCtx.currentTime);

      // 40%概率触发滑音
      const glideType = Math.random();
      if (glideType < 0.25) {
        const targetFreq = baseFreq * 1.122; // 向上大二度
        osc1.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.5);
        osc2.frequency.exponentialRampToValueAtTime(targetFreq * 0.994, audioCtx.currentTime + 0.5);
      } else if (glideType < 0.5) {
        const targetFreq = baseFreq * 0.89; // 向下大二度
        osc1.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.7);
        osc2.frequency.exponentialRampToValueAtTime(targetFreq * 0.994, audioCtx.currentTime + 0.7);
      }

      const now = audioCtx.currentTime;
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.06); // 慢起音
      gainNode.gain.exponentialRampToValueAtTime(0.012, now + 0.5);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.9);
      osc2.stop(now + 2.9);
    } catch (e) {}
  }
}

const guqinBGM = new GuqinBGM();

let typewriterTimer: any = null;
let audioCtx: AudioContext | null = null;

function playDialogueCharSound(): void {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      return;
    }
    const osc = audioCtx.createOscillator();
    const gain = ctxCreateGainHelper();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle'; // 三角波
    osc.frequency.setValueAtTime(140, audioCtx.currentTime); // 140Hz低频模拟毛笔质感
    gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (err) {
    // 忽略音频报错
  }
}

function ctxCreateGainHelper(): GainNode {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx.createGain();
}

function playCollectSound(): void {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine'; // 正弦波最清澈
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // 向上滑音
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (err) {}
}

function playSuccessSound(): void {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // 琶音C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx!.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.04, audioCtx!.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx!.currentTime + idx * 0.08 + 0.35);
      osc.start(audioCtx!.currentTime + idx * 0.08);
      osc.stop(audioCtx!.currentTime + idx * 0.08 + 0.35);
    });
  } catch (err) {}
}

function playErrorSound(): void {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (err) {}
}

function playStoneClickSound(): void {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.07);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.07);
  } catch (err) {}
}

function playTearSound(): void {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') return;
    // 产生0.25秒的白噪音
    const bufferSize = audioCtx.sampleRate * 0.25;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
    noise.stop(audioCtx.currentTime + 0.25);
  } catch (err) {}
}

function showInkAlert(title: string, text: string, callback?: () => void, btnText: string = '知晓'): void {
  const box = document.getElementById('ink-alert-box')!;
  const t = document.getElementById('ink-alert-title')!;
  const c = document.getElementById('ink-alert-text')!;
  const btn = document.getElementById('ink-alert-btn')!;
  
  t.innerText = title;
  c.innerHTML = text;
  btn.innerText = btnText;
  
  // 根据提示内容判断成功或失败，并触发相应音效
  const isSucc = title.includes('成功') || title.includes('对齐') || title.includes('赏识') || title.includes('痛快') || title.includes('和好') || title.includes('保全') || title.includes('雅对');
  const isFail = title.includes('失败') || title.includes('被察觉') || title.includes('冲突') || title.includes('俗') || title.includes('重新') || title.includes('罚酒') || title.includes('糟糕');
  
  if (isSucc) {
    playSuccessSound();
  } else if (isFail) {
    playErrorSound();
  } else {
    playStoneClickSound();
  }
  
  box.classList.add('show');
  
  btn.onclick = () => {
    box.classList.remove('show');
    if (callback) callback();
  };
}

const redChamberNotebooks: Record<number, { title: string; subtitle: string; content: string }> = {
  1: {
    title: '第一回 研读札记',
    subtitle: '🎋 步步留心，时时在意',
    content: '<b>【饭后茶仪礼法】</b><br/>原著第三回中，林黛玉初进荣国府。饭后，丫鬟用捧茶漆盘端上“老君眉”茶水，并备有漱口盂。黛玉见贾府众人皆不先饮，而是含茶漱口，吐在吐盂中，然后洗手，最后才捧起新端来的“普洱茶”细细品饮。黛玉暗忖：“这正是高门大族的规矩，若直接喝了，必惹人耻笑。” 于是顺随其礼。这体现了黛玉“步步留心，时时在意”的谨慎性格，也展示了金陵世家钟鸣鼎食之家的繁文缛礼与深厚体统。'
  },
  2: {
    title: '第二回 研读札记',
    subtitle: '💎 摔玉谶语，顽石红尘',
    content: '<b>【通灵宝玉之谜】</b><br/>贾宝玉落胎时口中衔来之玉，正面刻有“莫失莫忘，仙寿恒昌”。在原著中，此玉乃女娲炼石补天所剩的一块顽石，因未得录用，自怨自愧，后被茫茫大士、渺渺真人带入红尘。宝玉“摔玉”是原著极具反叛色彩的经典情节，宝玉认为“家里姐姐妹妹都没有，单我有，可见不是个好东西”，体现了他对封建门第、男女尊卑观念的蔑视。而这块通灵宝玉也隐喻了贾宝玉红尘历劫的生命主线。'
  },
  3: {
    title: '第三回 研读札记',
    subtitle: '💍 金石相配，良缘谶语',
    content: '<b>【金玉良缘与木石前盟】</b><br/>薛宝钗的金锁上錾着“不离不弃，芳龄永继”八个字，与宝玉之玉恰好配成一对，世人称之为“金玉良缘”。然而，宝玉心中所念，唯有与黛玉的“木石前盟”（神瑛侍者以甘露灌溉绛珠仙草，黛玉下凡以一生之泪偿还）。金锁是薛家主动迎合世俗规范的政治联姻象征，而木石前盟则是超脱封建礼教的精神契合。两者在原著中构成了宏大的悲剧拉扯。'
  },
  4: {
    title: '第四回 研读札记',
    subtitle: '🏡 题大观园，寄寓前缘',
    content: '<b>【题匾命名巧思】</b><br/>大观园为元妃省亲所建。贾政考校宝玉才华，命其为各处阁馆题匾。宝玉根据竹林幽韵，题“有凤来仪”（后为潇湘馆），隐喻黛玉的清高凤仪；根据杜衡草香，题“蘅芷清芬”（后为蘅芜苑），凸显宝钗的冷香素雅；根据红梅绿芭蕉，题“红香绿玉”（后被元妃改为“怡红快绿”并定名怡红院）。宝玉的题额展现了他高超的诗学才情，贾政虽口头啐骂，心中实则暗自赞许。'
  },
  5: {
    title: '第五回 研读札记',
    subtitle: '🦋 滴翠扑蝶，机敏避嫌',
    content: '<b>【宝钗戏蝶与小红心事】</b><br/>原著第二十七回，宝钗扑蝶至滴翠亭，无意间听到了小红（林红玉）与坠儿关于与贾芸私相授受帕子的密谋。在封建礼教中，私传表记乃是大忌。宝钗为防被撞破尴尬，假装追赶林黛玉并喊着“颦儿，我看你往哪里躲”，巧妙脱身，使小红误以为是黛玉听去。此情节一展宝钗临机应变的玲珑心思，但也常被后世读者视作黛钗性格对比的争议细节，展现了其深谙人情世故的“雪里金簪”个性。'
  },
  6: {
    title: '第六回 研读札记',
    subtitle: '🌸 葬花吟哦，香魂谶语',
    content: '<b>【黛玉葬花与葬花吟】</b><br/>原著第二十七回中，因被晴雯误拒门外，黛玉伤心之下，清晨在桃花树下荷锄葬花，吟诵出千古绝唱《葬花吟》。“花谢花飞花满天，红消香断有谁怜……” 黛玉不愿让落花落入污浊的沟渠，而是盛入落花绢袋，葬于花冢，以保其洁净。这既是她“孤标傲世”的情感宣泄，更是一首生命谶语——“质本洁来还洁去，强于污淖陷渠沟”，预示了她终将泪尽夭亡的凄美结局。'
  },
  7: {
    title: '第七回 研读札记',
    subtitle: '撕扇一笑，千金纵性',
    content: '<b>【晴雯撕扇的反叛性】</b><br/>原著第三十一回，晴雯不慎跌折了宝玉的扇骨，引来宝玉叹息，两人爆发口角。晚间宝玉吃酒回来，为哄晴雯开心，主动拿折扇让晴雯撕，并言“古人云千金难买一笑，扇子原是人用的，你喜欢撕就撕。” 晴雯连撕数把，笑称“听这个声响最痛快”。撕扇一节，生动展示了晴雯孤傲不屈、任性直爽的“爆炭”性格，也体现了宝玉对丫鬟人格尊重的超脱态度，是红楼梦里最温情而叛逆的一幕。'
  },
  8: {
    title: '第八回 研读札记',
    subtitle: '💥 挨打风波，礼教压迫',
    content: '<b>【宝玉挨打的社会冲突】</b><br/>原著第三十三回，因金钏儿投井、结交忠顺王府戏子琪官（蒋玉菡）、以及贾环挑拨宝玉强奸未遂等数罪并罚，贾政痛笞宝玉，几乎将其打死。这场“挨打”是贾府父子矛盾的集中爆发，本质上是封建理学道统（贾政代表的立身扬名、仕途经济）与追求真性情、反抗禄蠹科举的叛逆思想（宝玉代表的离经叛道）之间的不可调和的剧烈冲突。'
  },
  9: {
    title: '第九回 研读札记',
    subtitle: '🎭 藕香令官，伏笔艳词',
    content: '<b>【牙牌令的命运伏笔】</b><br/>原著第四十回中，贾母在藕香榭设宴，鸳鸯担任令官行牙牌令。黛玉在仓促对令时，脱口而出了《牡丹亭》中的“良辰美景奈何天”与《西厢记》中的“纱窗也没有红娘报”等杂剧词句。在当时，闺阁女子读这类儿女私情之书被视为不轨。宝钗听出了端倪，席后以此善意审问黛玉，不仅没有告发，反而推心置腹地劝导，从此黛钗释嫌和好，谱写了“金兰契互剖金兰语”的温情篇章。'
  },
  10: {
    title: '第十回 研读札记',
    subtitle: '🥀 抄检大观园，自毁之始',
    content: '<b>【抄检风波与家族衰败】</b><br/>因在园中捡到绣春囊，邢夫人发难，王熙凤被迫率人抄检大观园。这是大观园毁灭的起点。探春在抄检中大怒，控诉道：“百足之虫，死而不僵。必须先从家里自杀自灭起来，才能杀得死！” 并掴了搜身的王善保家的一记耳光，展现了探春惊人的政治远见。抄检导致晴雯病中被逐、芳官等人出家，预示着这个钟鸣鼎食之家已从内部彻底腐烂，大厦将倾。'
  }
};

function showRedChamberNotebook(chapterId: number, callback?: () => void): void {
  const notebook = redChamberNotebooks[chapterId];
  if (!notebook) {
    if (callback) callback();
    return;
  }

  const overlay = document.getElementById('notebook-overlay')!;
  const titleEl = document.getElementById('notebook-title')!;
  const bodyEl = document.getElementById('notebook-body')!;
  const closeBtn = document.getElementById('notebook-close-btn')!;

  titleEl.innerText = notebook.title;
  bodyEl.innerHTML = `
    <div class="notebook-section-title">${notebook.subtitle}</div>
    <div style="margin-top: 10px; text-indent: 2em; text-align: justify; color: #333; line-height: 1.8;">
      ${notebook.content}
    </div>
  `;

  overlay.classList.add('show');
  playSuccessSound();

  closeBtn.onclick = () => {
    overlay.classList.remove('show');
    if (callback) callback();
  };
}

// 4. HUD 属性刷新
function updateHUD(): void {
  const state = stateManager.getState();
  const chapterNames: Record<number, string> = {
    1: '第一回 黛玉进府',
    2: '第二回 宝黛初见',
    3: '第三回 金锁金印',
    4: '第四回 题大观园',
    5: '第五回 宝钗扑蝶',
    6: '第六回 黛玉葬花',
    7: '第七回 晴雯撕扇',
    8: '第八回 怡红挨打',
    9: '第九回 两宴酒令',
    10: '第十回 抄检风波',
  };

  document.getElementById('hud-chapter')!.innerText = chapterNames[state.currentChapter] || `第${state.currentChapter}回`;
  document.getElementById('val-daiyu')!.innerText = state.daiyuAffection.toString();
  document.getElementById('bar-daiyu')!.style.width = `${state.daiyuAffection}%`;
  document.getElementById('val-baochai')!.innerText = state.baochaiAffection.toString();
  document.getElementById('bar-baochai')!.style.width = `${state.baochaiAffection}%`;
  document.getElementById('val-out')!.innerText = state.worldlyOut.toString();
  document.getElementById('val-in')!.innerText = state.worldlyIn.toString();
  document.getElementById('hud-inventory')!.innerText = state.inventory.join(', ') || '无';

  // 更新立体角色心智
  document.getElementById('val-daiyu-melancholy')!.innerText = state.daiyuMelancholy.toString();
  document.getElementById('val-daiyu-wit')!.innerText = state.daiyuWit.toString();
  document.getElementById('val-baochai-tact')!.innerText = state.baochaiTact.toString();
  document.getElementById('val-baochai-economic')!.innerText = state.baochaiEconomic.toString();
  document.getElementById('val-qingwen-pride')!.innerText = state.qingwenPride.toString();

  // 同步自定义选关下拉菜单的文字与高亮状态
  const selectBtn = document.getElementById('chapter-select-btn');
  if (selectBtn) {
    const name = chapterNames[state.currentChapter] || `第${state.currentChapter}回`;
    selectBtn.innerText = name;
  }
  const dropdownItems = document.querySelectorAll('.chapter-dropdown-item');
  dropdownItems.forEach(item => {
    const val = parseInt(item.getAttribute('data-value') || '0', 10);
    if (val === state.currentChapter) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 更新回目指引锦囊
  const guide = redChamberGuides[state.currentChapter];
  const targetBanner = document.getElementById('hud-target-banner')!;
  const targetText = document.getElementById('hud-target-text')!;
  
  if (guide) {
    document.getElementById('guide-where')!.innerText = guide.where;
    document.getElementById('guide-how')!.innerText = guide.how;
    
    // 更新屏幕顶端常驻轻量化金色目标提示
    targetText.innerText = `${guide.where} · ${guide.how}`;
    
    // 如果对话框和解谜都未显示，则展示顶端金色目标
    const dialogueBox = document.getElementById('dialogue-box')!;
    const puzzleOverlay = document.getElementById('puzzle-overlay')!;
    if (dialogueBox.style.display === 'none' && puzzleOverlay.style.display === 'none') {
      targetBanner.style.opacity = '1';
    } else {
      targetBanner.style.opacity = '0';
    }
  } else {
    targetBanner.style.opacity = '0';
  }
}

// 5. 头像立绘匹配辅助函数与对话加载 (打字机效果)
function getRightSpeakerAvatar(speaker: string, chapterId: number): string | null {
  if (speaker === '林黛玉') return './daiyu_avatar.png';
  if (speaker === '薛宝钗') return './baochai_avatar.png';
  if (speaker === '晴雯') return './qingwen_avatar.png';
  if (speaker === '贾政') return './jiazheng_avatar.png';
  if (speaker === '史湘云') return './xiangyun_avatar.png';
  if (speaker === '刘姥姥') return './liulaolao_avatar.png';
  if (speaker === '王熙凤') return './xifeng_avatar.png';
  if (speaker === '贾母') return './jiamu_avatar.png';
  if (speaker === '莺儿') return './baochai_avatar.png'; // 莺儿使用宝钗头像代指
  if (speaker === '鸳鸯') return './jiamu_avatar.png';   // 鸳鸯使用贾母头像代指
  if (speaker === '系统旁白' || speaker === '系统解谜提示') return './system_avatar.png';

  // 兜底回目对方头像
  switch (chapterId) {
    case 1:
    case 2:
    case 6:
      return './daiyu_avatar.png';
    case 3:
    case 5:
      return './baochai_avatar.png';
    case 7:
    case 10:
      return './qingwen_avatar.png';
    case 4:
      return './jiazheng_avatar.png';
    case 8:
      return './daiyu_avatar.png'; // 探病默认黛玉
    case 9:
      return './xiangyun_avatar.png';
    default:
      return './system_avatar.png';
  }
}

function renderDialogueNode(): void {
  const node = dialogueEngine.getCurrentNode();
  const dialogueBox = document.getElementById('dialogue-box')!;
  const targetBanner = document.getElementById('hud-target-banner')!;
  
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }

  if (!node) {
    dialogueBox.style.display = 'none';
    if ((window as any).showMobileController) {
      (window as any).showMobileController(true);
    }
    // 检查解谜是否也没开，没开就重新显示目标
    const puzzleOverlay = document.getElementById('puzzle-overlay')!;
    if (puzzleOverlay.style.display === 'none') {
      targetBanner.style.opacity = '1';
    }
    window.dispatchEvent(new CustomEvent('dialogue-ended'));
    return;
  }

  // 对话显示时隐藏顶端目标，保持画面整洁
  targetBanner.style.opacity = '0';
  dialogueBox.style.display = 'flex';
  if ((window as any).showMobileController) {
    (window as any).showMobileController(false);
  }
  document.getElementById('dialogue-speaker')!.innerText = node.speaker;

  const textElement = document.getElementById('dialogue-text')!;
  textElement.innerText = '';

  const optionsContainer = document.getElementById('dialogue-options')!;
  optionsContainer.style.display = 'none'; // 先隐藏选择按钮直到字打完

  // 双立绘高亮切换系统
  const avatarLeft = document.getElementById('avatar-left') as HTMLImageElement;
  const avatarRight = document.getElementById('avatar-right') as HTMLImageElement;

  const chapterId = stateManager.getState().currentChapter;

  avatarLeft.classList.remove('show', 'speaking', 'listening');
  avatarRight.classList.remove('show', 'speaking', 'listening');

  // 主角宝玉始终常驻左侧，配角在右侧
  const leftSrc = './baoyu_avatar.png';
  const rightSrc = getRightSpeakerAvatar(node.speaker, chapterId);

  setTimeout(() => {
    // 设置左侧宝玉
    avatarLeft.src = leftSrc;
    avatarLeft.style.display = 'block';

    // 设置右侧配角
    if (rightSrc) {
      avatarRight.src = rightSrc;
      avatarRight.style.display = 'block';
    } else {
      avatarRight.style.display = 'none';
    }

    avatarLeft.offsetHeight; // 触发重绘以执行 CSS 动画
    if (rightSrc) avatarRight.offsetHeight;

    avatarLeft.classList.add('show');
    if (rightSrc) avatarRight.classList.add('show');

    // 判定并给说话者添加 speaking 类，非说话者添加 listening 类
    if (node.speaker === '贾宝玉') {
      avatarLeft.classList.add('speaking');
      if (rightSrc) avatarRight.classList.add('listening');
    } else {
      avatarLeft.classList.add('listening');
      if (rightSrc) avatarRight.classList.add('speaking');
    }
  }, 100);

  // 开始打字机逐字输出
  let currentIdx = 0;
  const fullText = node.text;
  
  typewriterTimer = setInterval(() => {
    if (currentIdx < fullText.length) {
      textElement.innerText += fullText[currentIdx];
      currentIdx++;
      playDialogueCharSound(); // 播放古典打字音效
    } else {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
      optionsContainer.style.display = 'flex'; // 打字完毕，显示选项
    }
  }, 35);

  optionsContainer.innerHTML = '';

  if (node.options && node.options.length > 0) {
    node.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'ancient-btn';
      btn.style.width = '100%';
      btn.style.textAlign = 'left';
      btn.style.marginBottom = '5px';
      btn.innerText = opt.text;
      btn.onclick = () => {
        dialogueEngine.chooseOption(idx);
        updateHUD();
        
        const newNode = dialogueEngine.getCurrentNode();
        if (newNode && newNode.id.endsWith('_puzzle')) {
          dialogueBox.style.display = 'none';
          triggerPuzzle(stateManager.getState().currentChapter);
        } else {
          renderDialogueNode();
        }
      };
      optionsContainer.appendChild(btn);
    });
  } else {
    const btn = document.createElement('button');
    btn.className = 'ancient-btn';
    btn.innerText = dialogueEngine.isEnded() ? '完成此回' : '继续';
    btn.onclick = () => {
      if (dialogueEngine.isEnded()) {
        dialogueBox.style.display = 'none';
        
        const currentCh = stateManager.getState().currentChapter;
        const nextStep = () => {
          if (stateManager.getState().currentChapter < 10) {
            stateManager.nextChapter();
            updateHUD();
            if (stateManager.getState().currentChapter === 2) {
              dialogueEngine.startChapter(2);
              renderDialogueNode();
            }
          } else {
            triggerEnding();
          }
        };

        if (currentCh === 8) {
          showRedChamberNotebook(8, nextStep);
        } else {
          nextStep();
        }
      }
    };
    optionsContainer.appendChild(btn);
  }
}

// 6. 谜题模块渲染与物品解锁判定（可玩性关键）
const puzzleOverlay = document.getElementById('puzzle-overlay')!;
const puzzleCard = document.getElementById('puzzle-card')!;

function triggerPuzzle(chapterId: number): void {
  puzzleOverlay.style.display = 'flex';
  if ((window as any).showMobileController) {
    (window as any).showMobileController(false);
  }
  
  if (chapterId === 1) {
    renderTeaEtiquettePuzzle();
  } else if (chapterId === 2) {
    renderRestoreJadePuzzle();
  } else if (chapterId === 3) {
    renderLockPuzzle();
  } else if (chapterId === 4) {
    renderCoupletPuzzle();
  } else if (chapterId === 5) {
    renderAvoidancePuzzle();
  } else if (chapterId === 6) {
    // 黛玉葬花：必须先在园子里捡到【落花绢袋】，才可以进行葬花！
    if (stateManager.hasItem('落花绢袋')) {
      renderBuryFlowersPuzzle();
    } else {
      puzzleCard.innerHTML = `
        <div class="puzzle-title" style="color:var(--text-muted)">工具未备</div>
        <div class="puzzle-prompt">
          葬花落泪，岂能无盛花之器？<br/>
          请先控制宝玉在大观园长廊树下寻得<b>【落花绢袋】</b>，再来伴黛玉葬花。
        </div>
        <button class="ancient-btn" onclick="document.getElementById('puzzle-overlay').style.display='none'">折返寻物</button>
      `;
    }
  } else if (chapterId === 7) {
    renderTearFanPuzzle();
  } else if (chapterId === 9) {
    // 刘姥姥宴席酒令：如果身上有捡来的【金麒麟】，可以解锁史湘云的特殊互动
    renderRhymePuzzle();
  } else if (chapterId === 10) {
    renderSearchHidePuzzle();
  }
}

// 6.0.1 饭后茶仪解谜 (第一回)
function renderTeaEtiquettePuzzle(): void {
  let steps: string[] = [];
  
  const render = () => {
    puzzleCard.innerHTML = `
      <div class="puzzle-title">饭后茶仪礼法</div>
      <div class="puzzle-prompt">
        贾母晚宴刚毕，请按贾府的高门规矩，帮黛玉依次选择正确的茶水和用途：
      </div>
      <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
        <div class="tea-cup" id="cup-laojunmei" style="cursor: pointer; border: 2px solid var(--gold-juan); border-radius: 8px; padding: 15px; background: #faf8f5; transition: transform 0.2s; text-align: center; width: 120px;">
          <div style="font-size: 2.2rem;">🍵</div>
          <div style="font-family: var(--font-cursive); font-size: 1.2rem; color: var(--red-zhu); font-weight: bold; margin-top: 5px;">【老君眉】</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">（茶香幽冷，配有漱口盂）</div>
        </div>
        <div class="tea-cup" id="cup-puer" style="cursor: pointer; border: 2px solid var(--gold-juan); border-radius: 8px; padding: 15px; background: #faf8f5; transition: transform 0.2s; text-align: center; width: 120px;">
          <div style="font-size: 2.2rem;">🍶</div>
          <div style="font-family: var(--font-cursive); font-size: 1.2rem; color: var(--green-dai); font-weight: bold; margin-top: 5px;">【普洱茶】</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">（茶色酽红，热气袅袅）</div>
        </div>
      </div>
      <div class="puzzle-prompt" id="tea-steps-status" style="font-weight: bold; color: var(--text-ink); min-height: 24px;">
        ${steps.length === 0 ? '第一步：请选择应该先喝（或漱口）的茶' : `已选择：${steps.map(s => `【${s}】`).join(' ➜ ')}，请选择下一步`}
      </div>
      <div style="margin-top: 15px;">
        <button class="ancient-btn" id="btn-tea-reset" style="background-color: var(--text-muted); margin-right: 10px;">重新选择</button>
        <button class="ancient-btn" id="btn-tea-submit">完成茶仪</button>
      </div>
    `;

    const cupLaojunmei = document.getElementById('cup-laojunmei')!;
    const cupPuer = document.getElementById('cup-puer')!;
    cupLaojunmei.onmouseover = () => cupLaojunmei.style.transform = 'scale(1.05)';
    cupLaojunmei.onmouseout = () => cupLaojunmei.style.transform = 'scale(1.0)';
    cupPuer.onmouseover = () => cupPuer.style.transform = 'scale(1.05)';
    cupPuer.onmouseout = () => cupPuer.style.transform = 'scale(1.0)';

    cupLaojunmei.onclick = () => {
      if (!steps.includes('漱口茶')) {
        steps.push('漱口茶');
        playStoneClickSound();
        render();
      }
    };

    cupPuer.onclick = () => {
      if (!steps.includes('饮茶')) {
        steps.push('饮茶');
        playStoneClickSound();
        render();
      }
    };

    document.getElementById('btn-tea-reset')!.onclick = () => {
      steps = [];
      playStoneClickSound();
      render();
    };

    document.getElementById('btn-tea-submit')!.onclick = () => {
      if (steps.length === 2 && steps[0] === '漱口茶' && steps[1] === '饮茶') {
        showInkAlert('茶仪雅致', '黛玉端起“老君眉”含了一口漱过，吐在吐盂里，然后洗手毕，方捧起“普洱茶”细细饮用。<br/>贾母与凤姐见了，无不暗赞这姑娘举止娴雅，体统大方。好感度与才情上升！', () => {
          puzzleOverlay.style.display = 'none';
          showRedChamberNotebook(1, () => {
            stateManager.nextChapter();
            updateHUD();
            window.dispatchEvent(new CustomEvent('dialogue-ended'));
            dialogueEngine.startChapter(2);
            renderDialogueNode();
          });
        });
        stateManager.changeAffection('daiyu', 15);
        stateManager.changePersonality('daiyu', 'wit', 15);
        stateManager.changePersonality('daiyu', 'melancholy', -10);
      } else {
        showInkAlert('失了体统', '黛玉若直接端起茶喝了，或者顺序倒置，岂不惹得贾府人耻笑？请重新分辨。', () => {
          steps = [];
          render();
        });
      }
    };
  };

  render();
}

// 6.0.2 拼接碎玉解谜 (第二回)
function renderRestoreJadePuzzle(): void {
  const pieces = [
    { id: 0, text: '「莫失」', targetX: 110, targetY: 100, x: 30, y: 50, snapped: false },
    { id: 1, text: '「莫忘」', targetX: 190, targetY: 100, x: 230, y: 60, snapped: false },
    { id: 2, text: '「仙寿」', targetX: 110, targetY: 160, x: 40, y: 220, snapped: false },
    { id: 3, text: '「恒昌」', targetX: 190, targetY: 160, x: 220, y: 210, snapped: false }
  ];

  const render = () => {
    puzzleCard.innerHTML = `
      <div class="puzzle-title">复原通灵宝玉</div>
      <div class="puzzle-prompt">
        宝玉愤而摔玉，碎成四瓣。请在下方玉盘内拖动碎玉片，将它们拼合成一块完整的宝玉！
      </div>
      
      <!-- 拖拽盘 -->
      <div id="jade-board" style="position: relative; width: 320px; height: 300px; border: 2px dashed var(--gold-juan); border-radius: 12px; background: rgba(245, 237, 214, 0.4); margin: 15px auto; overflow: hidden; user-select: none;">
        <!-- 拼接中心目标模板阴影 -->
        <div style="position: absolute; left: 110px; top: 100px; width: 160px; height: 120px; border: 2px dotted rgba(43, 33, 22, 0.2); background: rgba(220, 215, 190, 0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: var(--font-cursive); font-size: 1.1rem; color: rgba(43, 33, 22, 0.3); pointer-events: none; transform: translate(-10px, -10px);">
          碎玉归位处
        </div>
        
        <!-- 渲染4片碎玉 -->
        ${pieces.map(p => `
          <div class="jade-piece" id="piece-${p.id}" style="position: absolute; left: ${p.x}px; top: ${p.y}px; width: 70px; height: 50px; background: #fdfcf7; border: 2px solid ${p.snapped ? 'var(--green-dai)' : 'var(--gold-juan)'}; border-radius: 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: move; z-index: ${p.snapped ? 10 : 20};">
            <span style="font-size: 1.1rem;">💎</span>
            <span style="font-size: 0.72rem; font-weight: bold; color: var(--text-ink); margin-top: 2px;">${p.text}</span>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 10px;">
        <button class="ancient-btn" id="btn-jade-reset" style="background-color: var(--text-muted); margin-right: 10px;">打乱重拼</button>
        <button class="ancient-btn" id="btn-jade-submit" style="display: none;">复原完成</button>
      </div>
    `;

    const board = document.getElementById('jade-board')!;
    const rect = board.getBoundingClientRect();

    pieces.forEach(p => {
      const el = document.getElementById(`piece-${p.id}`)!;
      if (p.snapped) return;

      let isDragging = false;
      let startX = 0;
      let startY = 0;

      const onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        startX = e.clientX - el.offsetLeft;
        startY = e.clientY - el.offsetTop;
        el.setPointerCapture(e.pointerId);
        el.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        let x = e.clientX - startX;
        let y = e.clientY - startY;

        x = Math.max(0, Math.min(rect.width - 70, x));
        y = Math.max(0, Math.min(rect.height - 50, y));

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        p.x = x;
        p.y = y;
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        el.releasePointerCapture(e.pointerId);
        el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';

        const dist = Math.hypot(p.x - p.targetX, p.y - p.targetY);
        if (dist < 18) {
          p.x = p.targetX;
          p.y = p.targetY;
          p.snapped = true;
          playStoneClickSound();
          render();
          checkAllSnapped();
        }
      };

      el.addEventListener('pointerdown', onPointerDown);
      el.addEventListener('pointermove', onPointerMove);
      el.addEventListener('pointerup', onPointerUp);
    });

    const checkAllSnapped = () => {
      const allDone = pieces.every(p => p.snapped);
      if (allDone) {
        const btnSubmit = document.getElementById('btn-jade-submit')!;
        btnSubmit.style.display = 'inline-block';
      }
    };

    document.getElementById('btn-jade-reset')!.onclick = () => {
      pieces.forEach(p => {
        p.snapped = false;
        p.x = 20 + Math.random() * 200;
        p.y = 30 + Math.random() * 200;
      });
      playStoneClickSound();
      render();
    };

    const submitBtn = document.getElementById('btn-jade-submit');
    if (submitBtn) {
      submitBtn.onclick = () => {
        showInkAlert('碎玉重圆', '你将最后一瓣碎玉拼合，只见玉身合缝，流光溢彩，八字重现，通灵宝玉安然无恙。<br/>黛玉拭去眼泪，破涕为笑。你获得了随身宝物：【通灵宝玉】！', () => {
          stateManager.addItem('通灵宝玉');
          puzzleOverlay.style.display = 'none';
          showRedChamberNotebook(2, () => {
            stateManager.nextChapter();
            updateHUD();
            window.dispatchEvent(new CustomEvent('dialogue-ended'));
          });
        });
        stateManager.changeAffection('daiyu', 15);
        stateManager.changePersonality('daiyu', 'melancholy', -15);
        stateManager.changeWorldlyValue('out', 5);
      };
    }
  };

  render();
}

// 6.1 金锁拼图
function renderLockPuzzle(): void {
  const currentInput: string[] = [];
  const options = ['不离', '芳龄', '莫失', '不弃', '永继', '恒昌'];
  
  const render = () => {
    puzzleCard.innerHTML = `
      <div class="puzzle-title">金石良缘字谶对齐</div>
      <div class="puzzle-prompt">薛宝钗金锁字样有谶语，请拼凑出正确的吉谶四言联：“不离不弃，芳龄永继”</div>
      <div class="puzzle-slots">
        <div class="puzzle-slot">${currentInput[0] || ''}</div>
        <div class="puzzle-slot">${currentInput[1] || ''}</div>
        <div class="puzzle-slot">${currentInput[2] || ''}</div>
        <div class="puzzle-slot">${currentInput[3] || ''}</div>
      </div>
      <div class="puzzle-options" id="puzzle-opt-zone"></div>
      <div style="display: flex; gap: 15px; margin-top: 10px;">
        <button class="ancient-btn" id="btn-puzzle-reset" style="background-color: var(--text-muted)">重置</button>
        <button class="ancient-btn" id="btn-puzzle-submit">对齐</button>
      </div>
    `;

    const optZone = document.getElementById('puzzle-opt-zone')!;
    options.forEach(word => {
      const btn = document.createElement('div');
      btn.className = 'puzzle-option';
      btn.innerText = word;
      btn.onclick = () => {
        if (currentInput.length < 4 && !currentInput.includes(word)) {
          currentInput.push(word);
          playStoneClickSound(); // 增加点击玉牌音效
          render();
        }
      };
      optZone.appendChild(btn);
    });

    document.getElementById('btn-puzzle-reset')!.onclick = () => {
      currentInput.length = 0;
      playStoneClickSound();
      render();
    };

    document.getElementById('btn-puzzle-submit')!.onclick = () => {
      if (puzzleSolver.solveGoldLockPuzzle(currentInput)) {
        showInkAlert('金玉良缘', '只听金锁铮鏦一声，字迹金光灿然。<br/>宝钗微微红了脸，好感度上升！', () => {
          puzzleOverlay.style.display = 'none';
          showRedChamberNotebook(3, () => {
            stateManager.nextChapter();
            updateHUD();
            window.dispatchEvent(new CustomEvent('dialogue-ended'));
          });
        });
        stateManager.changeAffection('baochai', 15);
        stateManager.changeWorldlyValue('in', 5);
      } else {
        showInkAlert('对齐失败', '吉谶配对不顺，金玉相冲。<br/>请重新对齐。', () => {
          currentInput.length = 0;
          render();
        });
      }
    };
  };

  render();
}

// 6.2 题额
function renderCoupletPuzzle(): void {
  let step = 1;
  let title = '题匾潇湘馆';
  let prompt = '大观园初成，贾政命你题写潇湘馆。此处修竹千竿，幽韵有凤来仪，请题四字：';
  const options = ['有凤来仪', '潇湘翠竹', '蘅芷清芬', '红香绿玉', '怡红快绿', '世外桃源'];

  const render = () => {
    puzzleCard.innerHTML = `
      <div class="puzzle-title">${title}</div>
      <div class="puzzle-prompt">${prompt}</div>
      <div class="puzzle-options" id="puzzle-opt-zone" style="margin-bottom: 25px;"></div>
    `;

    const optZone = document.getElementById('puzzle-opt-zone')!;
    options.forEach(ans => {
      const btn = document.createElement('div');
      btn.className = 'puzzle-option';
      btn.innerText = ans;
      btn.onclick = () => {
        playStoneClickSound(); // 增加选择音效
        if (step === 1) {
          if (puzzleSolver.solveCouplet('潇湘馆', ans)) {
            showInkAlert('题额赞许', '贾政抚须点头：““有凤来仪”，极妙！颇有古意。”<br/>林黛玉好感度上升！', () => {
              step = 2;
              title = '题匾蘅芜苑';
              prompt = '来到蘅芜苑，遍地杜衡草香，冷冽素雅，请题四字：';
              render();
            });
            stateManager.changeAffection('daiyu', 15);
          } else {
            showInkAlert('贾政喝止', '贾政怒喝：“俗气！再想！”');
          }
        } else if (step === 2) {
          if (puzzleSolver.solveCouplet('蘅芜苑', ans)) {
            showInkAlert('题额赞许', '贾政道：““蘅芷清芬”，符合此处草香冷僻之境。”<br/>薛宝钗好感度上升！', () => {
              step = 3;
              title = '题额怡红院';
              prompt = '最后来到怡红院，红绿相映，请题四字额：';
              render();
            });
            stateManager.changeAffection('baochai', 15);
          } else {
            showInkAlert('贾政啐骂', '贾政啐道：“不知所云，重题！”');
          }
        } else if (step === 3) {
          if (puzzleSolver.solveCouplet('怡红院', ans)) {
            showInkAlert('大观园匾成', '贾政点头叹道：““红香绿玉”倒也写实。”<br/>大观园题匾大功告成！', () => {
              puzzleOverlay.style.display = 'none';
              showRedChamberNotebook(4, () => {
                stateManager.nextChapter();
                updateHUD();
                window.dispatchEvent(new CustomEvent('dialogue-ended'));
              });
            });
            stateManager.changeWorldlyValue('out', 10);
          } else {
            showInkAlert('贾政喝令', '贾政喝道：“重新拟来！”');
          }
        }
      };
      optZone.appendChild(btn);
    });
  };

  render();
}

// 6.3 宝钗避嫌
function renderAvoidancePuzzle(): void {
  let bx = 0, by = 12;
  const cx = 0, cy = 0;
  let wind = 'North';

  const render = () => {
    const hearing = avoidanceSolver.canHearConversation(bx, by, cx, cy, wind);
    const detected = avoidanceSolver.isDetected(bx, by, cx, cy);

    puzzleCard.innerHTML = `
      <div class="puzzle-title">滴翠亭外避嫌</div>
      <div class="puzzle-prompt" style="text-align: left;">
        宝钗身处位置: <b>(${bx}, ${by})</b><br/>
        当前园中风向: <b>${wind === 'North' ? '北风' : '南风'}</b><br/>
        偷听状态: <b>${hearing ? '<span style="color:var(--red-zhu)">能听到小红和坠儿的私语</span>' : '一片风声，听不清'}</b><br/>
        小红察觉状态: <b>${detected ? '<span style="color:var(--red-zhu)">过近，被察觉！</span>' : '安全，尚未被发现'}</b>
      </div>
      
      ${!detected ? `
        <div style="margin: 15px 0;">
          <button class="ancient-btn" id="btn-move-south" style="margin: 5px;">往南挪步(0, -4)</button>
          <button class="ancient-btn" id="btn-move-north" style="margin: 5px;">往北退步(0, +4)</button>
          <button class="ancient-btn" id="btn-change-wind" style="margin: 5px; background-color: var(--green-dai)">转换风向</button>
        </div>
      ` : `
        <div class="puzzle-prompt" style="color: var(--red-zhu); font-weight: bold;">
          小红正欲推窗！请选择正确避嫌话术：
        </div>
        <div class="puzzle-options" id="evasion-opt-zone"></div>
      `}
    `;

    if (!detected) {
      document.getElementById('btn-move-south')!.onclick = () => {
        by -= 4;
        render();
      };
      document.getElementById('btn-move-north')!.onclick = () => {
        by += 4;
        render();
      };
      document.getElementById('btn-change-wind')!.onclick = () => {
        wind = wind === 'North' ? 'South' : 'North';
        render();
      };
    } else {
      const optZone = document.getElementById('evasion-opt-zone')!;
      const choices = ['假装追寻林黛玉（颦儿）', '直接推门质问她们', '假装在寻找宝二爷'];
      choices.forEach(ch => {
        const btn = document.createElement('div');
        btn.className = 'puzzle-option';
        btn.innerText = ch;
        btn.onclick = () => {
          playStoneClickSound();
          const res = avoidanceSolver.solveEvasionTactics(ch);
          if (res.success) {
            showInkAlert('避嫌成功', '宝钗叫道：“颦儿，我看你往哪里躲！”<br/>小红和坠儿推窗一看是宝姑娘，登时松了一口气。避嫌成功！', () => {
              puzzleOverlay.style.display = 'none';
              showRedChamberNotebook(5, () => {
                stateManager.nextChapter();
                updateHUD();
                window.dispatchEvent(new CustomEvent('dialogue-ended'));
              });
            });
            stateManager.changeAffection('baochai', res.affectionChange);
          } else {
            showInkAlert('避嫌失败', '避嫌失败，小红和坠儿起了疑心！', () => {
              bx = 0;
              by = 12;
              wind = 'North';
              render();
            });
            stateManager.changeAffection('baochai', res.affectionChange);
          }
        };
        optZone.appendChild(btn);
      });
    }
  };

  render();
}

// 6.4 黛玉葬花
function renderBuryFlowersPuzzle(): void {
  const currentLines: string[] = [];
  const options = ['红消香断有谁怜', '落絮轻沾扑绣帘', '花谢花飞花满天', '游丝软系飘春榭'];

  const render = () => {
    puzzleCard.innerHTML = `
      <div class="puzzle-title">落花吟排序</div>
      <div class="puzzle-prompt">使用收来的落花绢袋盛起落花，请将《葬花吟》诗句按正确顺序排列：</div>
      <div class="puzzle-slots" style="flex-direction: column; gap: 8px; width: 100%; align-items: center; margin-bottom: 20px;">
        <div class="puzzle-slot" style="width: 320px; font-size: 1.1rem; height: 35px;">${currentLines[0] || ''}</div>
        <div class="puzzle-slot" style="width: 320px; font-size: 1.1rem; height: 35px;">${currentLines[1] || ''}</div>
        <div class="puzzle-slot" style="width: 320px; font-size: 1.1rem; height: 35px;">${currentLines[2] || ''}</div>
        <div class="puzzle-slot" style="width: 320px; font-size: 1.1rem; height: 35px;">${currentLines[3] || ''}</div>
      </div>
      <div class="puzzle-options" id="puzzle-opt-zone"></div>
      <div style="display: flex; gap: 15px; margin-top: 15px;">
        <button class="ancient-btn" id="btn-puzzle-reset" style="background-color: var(--text-muted)">重置</button>
        <button class="ancient-btn" id="btn-puzzle-submit">埋香</button>
      </div>
    `;

    const optZone = document.getElementById('puzzle-opt-zone')!;
    options.forEach(line => {
      const btn = document.createElement('div');
      btn.className = 'puzzle-option';
      btn.innerText = line;
      btn.onclick = () => {
        if (currentLines.length < 4 && !currentLines.includes(line)) {
          currentLines.push(line);
          playStoneClickSound();
          render();
        }
      };
      optZone.appendChild(btn);
    });

    document.getElementById('btn-puzzle-reset')!.onclick = () => {
      currentLines.length = 0;
      playStoneClickSound();
      render();
    };

    document.getElementById('btn-puzzle-submit')!.onclick = () => {
      if (poetryFanSolver.solveBuryFlowersPoetry(currentLines)) {
        showInkAlert('葬花知音', '“花谢花飞花满天，红消香断有谁怜……”<br/>两心相契，林黛玉好感度大幅上升！', () => {
          stateManager.removeItem('落花绢袋');
          puzzleOverlay.style.display = 'none';
          showRedChamberNotebook(6, () => {
            stateManager.nextChapter();
            updateHUD();
            window.dispatchEvent(new CustomEvent('dialogue-ended'));
          });
        });
        stateManager.changeAffection('daiyu', 20);
        stateManager.changeWorldlyValue('out', 10);
      } else {
        showInkAlert('平仄失准', '吟哦平仄不合，请重新整理诗句。', () => {
          currentLines.length = 0;
          render();
        });
      }
    };
  };

  render();
}

// 6.5 晴雯撕扇
function renderTearFanPuzzle(): void {
  let 晴雯喜悦 = 0;

  const render = () => {
    puzzleCard.innerHTML = `
      <div class="puzzle-title">千金难买晴雯一笑</div>
      <div class="puzzle-prompt">
        晴雯当前喜悦值: <b>${晴雯喜悦} / 50</b><br/>
        提供合适材质的扇子，撕烂以博美人一笑。
      </div>
      <div class="puzzle-options" id="fan-opt-zone" style="margin-bottom: 25px;"></div>
    `;

    const optZone = document.getElementById('fan-opt-zone')!;
    const fans = [FanType.WAN_SHAN, FanType.NI_JIN, FanType.ZHI_SHAN, FanType.PU_SHAN];
    
    fans.forEach(fan => {
      const btn = document.createElement('div');
      btn.className = 'puzzle-option';
      btn.innerText = `递上: ${fan}`;
      btn.onclick = () => {
        playTearSound(); // 播放撕扇撕碎噪音音效
        const res = poetryFanSolver.tearFan(fan);
        showInkAlert('裂扇声响', `“${res.sound}”！<br/>晴雯喜悦增加 ${res.joyGained}`, () => {
          晴雯喜悦 += res.joyGained;
          stateManager.changeWorldlyValue('out', res.outGained);
          
          if (晴雯喜悦 >= 50) {
            showInkAlert('晴雯一笑', '晴雯拍手娇笑：“撕得痛快！二爷果然知心。”<br/>主仆言归于好！', () => {
              puzzleOverlay.style.display = 'none';
              showRedChamberNotebook(7, () => {
                stateManager.nextChapter();
                updateHUD();
                window.dispatchEvent(new CustomEvent('dialogue-ended'));
              });
            });
          } else {
            render();
          }
        });
      };
      optZone.appendChild(btn);
    });
  };

  render();
}

// 6.6 酒令与收集解锁
function renderRhymePuzzle(): void {
  let turn = 1;
  let title = '牙牌令 · 其一';
  let prompt = '鸳鸯令官出牌：“左边一个四五成对。” 请代为对答：';
  
  // 检查是否拥有大观园里收集的【金麒麟】，如有，可多一个选项
  const hasKirin = stateManager.hasItem('金麒麟');
  const options = ['双瞻玉兔升天莹', '是个耗子往外蹦'];
  if (hasKirin) {
    options.push('麒麟金锁配阴阳（解锁湘云隐秘对答）');
  }
  options.push('双管迎春分外红'); // 混淆项

  const render = () => {
    puzzleCard.innerHTML = `
      <div class="puzzle-title">${title}</div>
      <div class="puzzle-prompt">${prompt}</div>
      <div class="puzzle-options" id="puzzle-opt-zone" style="margin-bottom: 25px;"></div>
    `;

    const optZone = document.getElementById('puzzle-opt-zone')!;
    options.forEach(reply => {
      const btn = document.createElement('div');
      btn.className = 'puzzle-option';
      btn.innerText = reply;
      btn.onclick = () => {
        playStoneClickSound();
        if (turn === 1) {
          if (reply === '双瞻玉兔升天莹' || reply === '是个耗子往外蹦' || reply.startsWith('麒麟金锁')) {
            if (reply === '是个耗子往外蹦') {
              showInkAlert('村俗大乐', '刘姥姥俗对：“是个耗子往外蹦！”<br/>众人喷茶大笑。刘姥姥怡然自乐。', () => {
                turn = 2;
                title = '牙牌令 · 其二';
                prompt = '鸳鸯出第二张牌：“中间三四绿配红。” 请代宝玉答：';
                render();
              });
              stateManager.changeAffection('xiangyun', 5);
            } else if (reply.startsWith('麒麟金锁')) {
              showInkAlert('麒麟阴阳', '湘云见你亮出金麒麟，脸色一红，对道：“金印麒麟双配双！”<br/>湘云好感大幅上涨！', () => {
                stateManager.removeItem('金麒麟'); 
                turn = 2;
                title = '牙牌令 · 其二';
                prompt = '鸳鸯出第二张牌：“中间三四绿配红。” 请代宝玉答：';
                render();
              });
              stateManager.changeAffection('xiangyun', 30);
            } else {
              showInkAlert('雅对得体', '宝玉雅对：“双瞻玉兔升天莹。”<br/>黛玉暗喜，羁绊上升！', () => {
                turn = 2;
                title = '牙牌令 · 其二';
                prompt = '鸳鸯出第二张牌：“中间三四绿配红。” 请代宝玉答：';
                render();
              });
              stateManager.changeAffection('daiyu', 10);
            }
          } else {
            showInkAlert('对答失准', '罚酒一杯！平仄不协，请重对。');
          }
        } else if (turn === 2) {
          if (reply === '双管迎春分外红') {
            showInkAlert('酒令终毕', '宝玉对道：“双管迎春分外红！”<br/>宝钗赞叹，好感度上升！', () => {
              puzzleOverlay.style.display = 'none';
              showRedChamberNotebook(9, () => {
                stateManager.nextChapter();
                updateHUD();
                window.dispatchEvent(new CustomEvent('dialogue-ended'));
              });
            });
            stateManager.changeAffection('baochai', 10);
          } else {
            showInkAlert('对答失准', '酒令不合，罚酒一杯！请重新对答。');
          }
        }
      };
      optZone.appendChild(btn);
    });
  };

  render();
}

// 6.7 抄检大观园与搜证道具
function renderSearchHidePuzzle(): void {
  const localSolver = new SearchAndHideSolver(15);
  // 必须拥有大观园里捡到的【火折子】才能烧毁信件！
  const bag = stateManager.getState().inventory;

  const render = () => {
    const steps = localSolver.getStepsLeft();
    const timeout = localSolver.isTimeOut();
    const assessment = localSolver.runRaidAssessment();

    puzzleCard.innerHTML = `
      <div class="puzzle-title">大观园抄检风暴</div>
      <div class="puzzle-prompt" style="text-align: left;">
        剩余转移步数: <b>${steps}</b><br/>
        行囊拥有道具: <b>${bag.join(', ') || '空'}</b> (提示：需要【火折子】才可烧毁书信！)<br/>
        香囊藏匿点: <b>${(localSolver as any).itemHidingLocations['香囊'] || '暴露在外'}</b><br/>
        私信藏匿点: <b>${(localSolver as any).destroyedItems.includes('私相授受的书信') ? '已销毁' : ((localSolver as any).itemHidingLocations['私相授受的书信'] || '暴露在外')}</b>
      </div>

      ${!timeout ? `
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; margin-bottom: 20px;">
          <button class="ancient-btn" id="btn-hide-sachet-safe">把【香囊】藏入【妆奁暗格】</button>
          <button class="ancient-btn" id="btn-hide-sachet-pocket">把【香囊】放入【随身携带】(危险！会被搜身)</button>
          <button class="ancient-btn" id="btn-hide-letter-safe">把【私信】藏入【书架暗格】</button>
          <button class="ancient-btn" id="btn-burn-letter">使用【火折子】烧毁【私信】</button>
        </div>
        <button class="ancient-btn" id="btn-raid-immediate" style="background-color: var(--green-dai)">提前迎接抄检</button>
      ` : `
        <div class="puzzle-prompt" style="color: var(--red-zhu); font-weight: bold;">
          抄检队伍破门而入！
        </div>
        <button class="ancient-btn" id="btn-raid-start">开始判定</button>
      `}
    `;

    if (!timeout) {
      document.getElementById('btn-hide-sachet-safe')!.onclick = () => {
        localSolver.takeAction();
        localSolver.hideItem('香囊', '妆奁暗格');
        render();
      };
      document.getElementById('btn-hide-sachet-pocket')!.onclick = () => {
        localSolver.takeAction();
        localSolver.hideItem('香囊', '随身携带');
        render();
      };
      document.getElementById('btn-hide-letter-safe')!.onclick = () => {
        localSolver.takeAction();
        localSolver.hideItem('私相授受的书信', '妆奁暗格');
        render();
      };
      document.getElementById('btn-burn-letter')!.onclick = () => {
        localSolver.takeAction();
        // 尝试烧毁信件
        localSolver.hideItem('私相授受的书信', '烧毁', bag);
        render();
      };
      document.getElementById('btn-raid-immediate')!.onclick = () => {
        const finalRes = localSolver.runRaidAssessment();
        handleRaidResult(finalRes);
      };
    } else {
      document.getElementById('btn-raid-start')!.onclick = () => {
        handleRaidResult(assessment);
      };
    }
  };

  const handleRaidResult = (res: { safe: boolean; exposedItems: string[] }) => {
    if (res.safe) {
      showInkAlert('风波保全', '抄检无果，晴雯与众姐妹逃过此劫。<br/>大观园保全了清誉！出世度大幅上升！', () => {
        stateManager.removeItem('火折子');
        puzzleOverlay.style.display = 'none';
        showRedChamberNotebook(10, () => {
          triggerEnding();
        });
      });
      stateManager.changeWorldlyValue('out', 20);
    } else {
      showInkAlert('大祸临头', `糟糕！王善保家的搜出了敏感物件：【${res.exposedItems.join(', ')}】！<br/>晴雯被逐，大观园走向离散悲剧。`, () => {
        stateManager.removeItem('火折子');
        puzzleOverlay.style.display = 'none';
        showRedChamberNotebook(10, () => {
          triggerEnding();
        });
      });
      stateManager.changeWorldlyValue('out', 10);
    }
  };

  render();
}

// 7. 结局渲染
function triggerEnding(): void {
  const ending = stateManager.calculateEnding();
  let endingDescription = '';
  let subText = '';

  if (ending === GameEnding.MENG_XING_CHU_JIA) {
    endingDescription = '【梦醒出家】';
    subText = '看破三春景不长，缁衣顿改昔年妆。你披上大红猩猩毡斗篷，在茫茫白雪中向贾政拜别，从此归于青灯古佛，皈依佛门。世间再无浊世佳公子。';
  } else if (ending === GameEnding.MU_SHI_GU_FANG) {
    endingDescription = '【木石孤芳】';
    subText = '“玉带林中挂，木石前盟成空。” 黛玉泪尽夭亡，你虽得见林妹妹心意，却阴阳两隔。余生只得在潇湘馆竹影斑驳间，抚琴空忆，凄婉一生。';
  } else if (ending === GameEnding.JIN_YU_QI_MEI) {
    endingDescription = '【金玉齐眉】';
    subText = '“都道是金玉良姻，俺只念木石前盟。” 你迎娶了薛宝钗。虽夫妻相敬如宾，齐眉举案，但你心中始终悬着那一抹潇湘泪，雪里金簪，终是惆怅满怀。';
  } else if (ending === GameEnding.MU_SHI_XIAN_WENG) {
    endingDescription = '【木石双璧】';
    subText = '“木石仙盟，终得双璧。” 黛玉在你的悉心呵护下舒展愁眉，才情大展，你们共同摆脱了尘世禄蠹的羁绊与封建礼教的枷锁，泛舟世外，琴瑟 and 和鸣，归隐于大荒山无稽崖之下，写就了大观园中最完美的传说。';
  } else {
    endingDescription = '【红楼一梦】';
    subText = '好一似食尽鸟投林，落了片白茫茫大地真干净。贾府盛极而衰，大观园众姐妹各散东西，留给你的，唯有这大梦一场，落寞红尘。';
  }

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #fcfaf2; padding: 40px; box-sizing: border-box; text-align: center;">
      <div style="font-family: var(--font-cursive); font-size: 4rem; color: var(--red-zhu); margin-bottom: 20px;">
        ${endingDescription}
      </div>
      <div style="font-size: 1.4rem; max-width: 650px; line-height: 2; color: var(--text-ink); margin-bottom: 40px; text-shadow: 1px 1px 2px rgba(0,0,0,0.05);">
        ${subText}
      </div>
      <button class="ancient-btn" onclick="window.location.reload()">再入红尘</button>
    </div>
  `;
}

// 8. Phaser 引擎初始化
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#f5edd6',
  pixelArt: true, // 开启像素艺术渲染，使像素Sprites在缩放时保持锐利
  render: {
    antialias: false,    // 禁用抗锯齿以防止像素边缘插值模糊
    pixelArt: true,      // 引擎内开启像素艺术抗锯齿
    roundPixels: true    // 渲染时将物理坐标取整，避免像素半透明毛边
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [GameScene, XiaoxiangScene, YihongScene],
};

const game = new Phaser.Game(config);

const triggerPlotCallback = (chapterId: number) => {
  stateManager.setChapter(chapterId);
  updateHUD();
  
  dialogueEngine.startChapter(chapterId);
  renderDialogueNode();
};

game.events.once('ready', () => {
  const gameScene = game.scene.getScene('GameScene') as GameScene;
  gameScene.setOnTriggerPlot(triggerPlotCallback);
});

// 12. 选关卡/回目跳转功能绑定
// 12. 自定义选关卡/回目跳转功能绑定
const customSelect = document.getElementById('chapter-custom-select')!;
const selectBtn = document.getElementById('chapter-select-btn')!;

selectBtn.onclick = (e) => {
  e.stopPropagation(); // 阻止冒泡，避免 window 点击事件立刻关闭菜单
  customSelect.classList.toggle('open');
};

// 点击页面其他部分关闭下拉菜单
window.addEventListener('click', () => {
  customSelect.classList.remove('open');
});

// 选项代理绑定
const dropdownItems = document.querySelectorAll('.chapter-dropdown-item');
dropdownItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLElement;
    const chapterId = parseInt(target.getAttribute('data-value') || '1', 10);
    if (isNaN(chapterId) || chapterId < 1 || chapterId > 10) return;

    // 1. 设置状态机回目并更新HUD
    stateManager.setChapter(chapterId);

    // 2. 根据回目自动填充道具，以便测试
    stateManager.removeItem('通灵宝玉');
    stateManager.removeItem('落花绢袋');
    stateManager.removeItem('金麒麟');
    stateManager.removeItem('火折子');
    
    if (chapterId >= 3) stateManager.addItem('通灵宝玉');
    if (chapterId >= 6) stateManager.addItem('落花绢袋');
    if (chapterId >= 9) stateManager.addItem('金麒麟');
    if (chapterId >= 10) stateManager.addItem('火折子');

    // 初始化相关羁绊与个性（给一个中等偏优的初始状态以防直接出家或进死局）
    if (chapterId >= 6) {
      stateManager.changeAffection('daiyu', 45 - stateManager.getState().daiyuAffection);
      stateManager.changePersonality('daiyu', 'melancholy', 40 - stateManager.getState().daiyuMelancholy);
      stateManager.changePersonality('daiyu', 'wit', 60 - stateManager.getState().daiyuWit);
    }
    if (chapterId >= 8) {
      stateManager.changeAffection('baochai', 45 - stateManager.getState().baochaiAffection);
    }

    updateHUD();

    // 3. 关闭所有对话与解谜遮罩
    document.getElementById('dialogue-box')!.style.display = 'none';
    document.getElementById('puzzle-overlay')!.style.display = 'none';

    // 4. 重置/加载对应场景
    let targetScene = 'GameScene';
    if (chapterId === 6) {
      targetScene = 'XiaoxiangScene';
    } else if (chapterId === 7 || chapterId === 8 || chapterId === 10) {
      targetScene = 'YihongScene';
    }

    // 5. 切换 Phaser 场景并开始对应关卡对话
    const activeScenes = game.scene.getScenes(true);
    activeScenes.forEach(s => {
      game.scene.stop(s.scene.key);
    });

    game.scene.start(targetScene, {
      onTriggerPlot: triggerPlotCallback
    });

    // 开始对话
    dialogueEngine.startChapter(chapterId);
    renderDialogueNode();
    
    // 6. 播放声音并收起锦囊与下拉菜单
    playStoneClickSound();
    customSelect.classList.remove('open');
    closeHUD();
  });
});

// 9. 游戏启动
updateHUD();
dialogueEngine.startChapter(1);
renderDialogueNode();

// 10. HUD 折叠展开逻辑绑定 (锦囊挂饰)
const hudPanel = document.getElementById('hud-panel')!;
const hudToggleBtn = document.getElementById('hud-toggle-btn')!;
const hudCloseBtn = document.getElementById('hud-close-btn')!;

// 10.1 沉浸全屏控制绑定
const fullscreenBtn = document.getElementById('hud-fullscreen-btn')!;
const fullscreenText = document.getElementById('fullscreen-btn-text')!;

function toggleFullscreen(): void {
  const docEl = document.documentElement as any;
  const doc = document as any;

  const requestFS = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
  const exitFS = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    if (requestFS) {
      requestFS.call(docEl).then(() => {
        fullscreenText.innerText = '窗口';
        playStoneClickSound();
        setTimeout(resizeApp, 150); // 延迟少许确保全屏容器resize计算准确
      }).catch(() => {});
    }
  } else {
    if (exitFS) {
      exitFS.call(doc).then(() => {
        fullscreenText.innerText = '全屏';
        playStoneClickSound();
        setTimeout(resizeApp, 150);
      }).catch(() => {});
    }
  }
}

fullscreenBtn.onclick = () => {
  toggleFullscreen();
};

// 监听系统全屏变化事件，自动同步按钮状态与画面大小
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    fullscreenText.innerText = '窗口';
  } else {
    fullscreenText.innerText = '全屏';
  }
  resizeApp();
});

function openHUD(): void {
  hudPanel.classList.add('active');
  hudToggleBtn.style.opacity = '0';
  hudToggleBtn.style.pointerEvents = 'none';
}

function closeHUD(): void {
  hudPanel.classList.remove('active');
  hudToggleBtn.style.opacity = '1';
  hudToggleBtn.style.pointerEvents = 'auto';
}

hudToggleBtn.onclick = () => {
  openHUD();
};

hudCloseBtn.onclick = () => {
  closeHUD();
};

// 键盘快捷键 Q / Tab 控制展开收起锦囊
window.addEventListener('keydown', (e) => {
  if (e.key === 'q' || e.key === 'Q' || e.key === 'Tab') {
    if (e.key === 'Tab') {
      e.preventDefault(); // 阻止浏览器Tab切焦
    }
    
    // 如果对话框或解谜开启，键盘操作忽略
    const dialogueBox = document.getElementById('dialogue-box');
    const puzzleOverlay = document.getElementById('puzzle-overlay');
    if (
      (dialogueBox && dialogueBox.style.display !== 'none') ||
      (puzzleOverlay && puzzleOverlay.style.display !== 'none')
    ) {
      return;
    }

    if (hudPanel.classList.contains('active')) {
      closeHUD();
    } else {
      openHUD();
    }
  }
});

// 11. 绑定用户初次交互以自动启动古琴声景背景音乐
function initAudioOnUserInteraction(): void {
  const startAudio = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    guqinBGM.start();
    
    // 移除监听以防重复激活
    window.removeEventListener('click', startAudio);
    window.removeEventListener('keydown', startAudio);
  };
  
  window.addEventListener('click', startAudio);
  window.addEventListener('keydown', startAudio);
}

initAudioOnUserInteraction();

// 13. 移动端控制与缩放系统
(window as any).mobileControls = {
  left: false,
  right: false,
  up: false,
  down: false,
  interact: false,
  nav: false
};

(window as any).showMobileController = function(show: boolean): void {
  const controller = document.getElementById('mobile-controller');
  if (controller) {
    controller.style.display = show ? '' : 'none';
  }
};

function initMobileControls(): void {
  const upBtn = document.getElementById('dpad-up');
  const downBtn = document.getElementById('dpad-down');
  const leftBtn = document.getElementById('dpad-left');
  const rightBtn = document.getElementById('dpad-right');
  const navBtn = document.getElementById('action-nav');
  const interactBtn = document.getElementById('action-interact');

  if (!upBtn || !downBtn || !leftBtn || !rightBtn || !navBtn || !interactBtn) return;

  const bindPress = (btn: HTMLElement, key: string) => {
    const start = (e: Event) => {
      e.preventDefault();
      (window as any).mobileControls[key] = true;
    };
    const end = (e: Event) => {
      e.preventDefault();
      (window as any).mobileControls[key] = false;
    };
    
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointerout', end);
    btn.addEventListener('touchstart', start);
    btn.addEventListener('touchend', end);
    btn.addEventListener('touchcancel', end);
  };

  bindPress(upBtn, 'up');
  bindPress(downBtn, 'down');
  bindPress(leftBtn, 'left');
  bindPress(rightBtn, 'right');
  bindPress(navBtn, 'nav');
  bindPress(interactBtn, 'interact');
}

function resizeApp(): void {
  const app = document.getElementById('app');
  if (!app) return;
  const targetWidth = 1024;
  const targetHeight = 768;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  const isPortrait = windowHeight > windowWidth;

  if (isPortrait) {
    // 智能竖屏旋转适配：顺时针旋转90度，使宽变高，高变宽以最大化可视面积
    const scale = Math.min(windowWidth / targetHeight, windowHeight / targetWidth);
    app.style.transform = `translate(-50%, -50%) rotate(90deg) scale(${scale})`;
  } else {
    // 正常横屏适配
    const scale = Math.min(windowWidth / targetWidth, windowHeight / targetHeight);
    app.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
}

initMobileControls();
window.addEventListener('resize', resizeApp);
window.addEventListener('orientationchange', resizeApp);
resizeApp();

function initObserver(): void {
  const dialogueBox = document.getElementById('dialogue-box')!;
  const puzzleOverlay = document.getElementById('puzzle-overlay')!;
  const notebookOverlay = document.getElementById('notebook-overlay')!;
  
  const checkVisibility = () => {
    const dialogueHidden = dialogueBox.style.display === 'none';
    const puzzleHidden = puzzleOverlay.style.display === 'none';
    const notebookHidden = !notebookOverlay.classList.contains('show');
    
    if (dialogueHidden && puzzleHidden && notebookHidden) {
      if ((window as any).showMobileController) {
        (window as any).showMobileController(true);
      }
    } else {
      if ((window as any).showMobileController) {
        (window as any).showMobileController(false);
      }
    }
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
        checkVisibility();
      }
    });
  });

  observer.observe(dialogueBox, { attributes: true, attributeFilter: ['style'] });
  observer.observe(puzzleOverlay, { attributes: true, attributeFilter: ['style'] });
  observer.observe(notebookOverlay, { attributes: true, attributeFilter: ['class'] });
  
  checkVisibility();
}

initObserver();


