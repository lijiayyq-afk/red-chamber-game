export enum GameEnding {
  MENG_XING_CHU_JIA = '梦醒出家', // 看破红尘，皈依佛门
  MU_SHI_GU_FANG = '木石孤芳',  // 终与黛玉心意相通，却阴阳两隔
  JIN_YU_QI_MEI = '金玉齐眉',  // 迎娶宝钗，相敬如宾但终觉缺憾
  MU_SHI_XIAN_WENG = '木石双璧', // 隐藏完美结局：突破封建宿命，与黛玉世外携手归隐
  HONG_LOU_YI_MENG = '红楼一梦', // 普通平凡结局
}

export interface GameState {
  currentChapter: number;
  daiyuAffection: number;
  baochaiAffection: number;
  xiangyunAffection: number;
  worldlyOut: number; // 出世值
  worldlyIn: number;  // 入世值
  inventory: string[];
  unlockedClues: string[];
  chapterData: Record<string, any>;
  
  // 立体角色个性与心智属性 (丰富立体真实化关键)
  daiyuMelancholy: number; // 黛玉忧郁度 (初始50，低代表身心舒畅，高代表多愁多病)
  daiyuWit: number;        // 黛玉才情值 (初始50，高代表灵性十足)
  baochaiTact: number;      // 宝钗处世圆滑度 (初始50)
  baochaiEconomic: number; // 宝钗仕途经济心 (初始50)
  qingwenPride: number;    // 晴雯孤傲直爽度 (初始50)
}

export class PlotStateManager {
  private state: GameState;

  constructor() {
    this.state = this.resetState();
  }

  private resetState(): GameState {
    return {
      currentChapter: 1,
      daiyuAffection: 0,
      baochaiAffection: 0,
      xiangyunAffection: 0,
      worldlyOut: 0,
      worldlyIn: 0,
      inventory: [],
      unlockedClues: [],
      chapterData: {},
      
      // 初始化个性状态
      daiyuMelancholy: 50,
      daiyuWit: 50,
      baochaiTact: 50,
      baochaiEconomic: 50,
      qingwenPride: 50,
    };
  }

  public getState(): GameState {
    return { ...this.state };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  public changeAffection(char: 'daiyu' | 'baochai' | 'xiangyun', amount: number): void {
    if (char === 'daiyu') {
      this.state.daiyuAffection = this.clamp(this.state.daiyuAffection + amount, 0, 100);
    } else if (char === 'baochai') {
      this.state.baochaiAffection = this.clamp(this.state.baochaiAffection + amount, 0, 100);
    } else if (char === 'xiangyun') {
      this.state.xiangyunAffection = this.clamp(this.state.xiangyunAffection + amount, 0, 100);
    }
  }

  // 修改个性属性通用方法
  public changePersonality(char: 'daiyu' | 'baochai' | 'qingwen', trait: string, amount: number): void {
    if (char === 'daiyu') {
      if (trait === 'melancholy') {
        this.state.daiyuMelancholy = this.clamp(this.state.daiyuMelancholy + amount, 0, 100);
      } else if (trait === 'wit') {
        this.state.daiyuWit = this.clamp(this.state.daiyuWit + amount, 0, 100);
      }
    } else if (char === 'baochai') {
      if (trait === 'tact') {
        this.state.baochaiTact = this.clamp(this.state.baochaiTact + amount, 0, 100);
      } else if (trait === 'economic') {
        this.state.baochaiEconomic = this.clamp(this.state.baochaiEconomic + amount, 0, 100);
      }
    } else if (char === 'qingwen') {
      if (trait === 'pride') {
        this.state.qingwenPride = this.clamp(this.state.qingwenPride + amount, 0, 100);
      }
    }
  }

  public changeWorldlyValue(type: 'in' | 'out', amount: number): void {
    if (type === 'in') {
      this.state.worldlyIn = this.clamp(this.state.worldlyIn + amount, 0, 100);
    } else if (type === 'out') {
      this.state.worldlyOut = this.clamp(this.state.worldlyOut + amount, 0, 100);
    }
  }

  public addItem(item: string): void {
    if (!this.state.inventory.includes(item)) {
      this.state.inventory.push(item);
    }
  }

  public removeItem(item: string): void {
    this.state.inventory = this.state.inventory.filter(i => i !== item);
  }

  public hasItem(item: string): boolean {
    return this.state.inventory.includes(item);
  }

  public unlockClue(clue: string): void {
    if (!this.state.unlockedClues.includes(clue)) {
      this.state.unlockedClues.push(clue);
    }
  }

  public hasClue(clue: string): boolean {
    return this.state.unlockedClues.includes(clue);
  }

  public nextChapter(): void {
    this.state.currentChapter = this.clamp(this.state.currentChapter + 1, 1, 10);
  }

  public setChapter(chapterId: number): void {
    this.state.currentChapter = this.clamp(chapterId, 1, 10);
  }

  public calculateEnding(): GameEnding {
    // 1. 判定隐藏完美结局【木石双璧】：黛玉羁绊值极高，且才情极高，忧郁值被玩家通过温柔选项抚平得很低
    if (
      this.state.daiyuAffection >= 75 && 
      this.state.daiyuMelancholy <= 35 && 
      this.state.daiyuWit >= 75
    ) {
      return GameEnding.MU_SHI_XIAN_WENG;
    }

    // 2. 如果出世值高（> 60），则导向 梦醒出家 结局
    if (this.state.worldlyOut > 60) {
      return GameEnding.MENG_XING_CHU_JIA;
    }

    // 3. 黛玉好感度高，且显著领先宝钗，达成“木石孤芳”
    if (this.state.daiyuAffection > 60 && (this.state.daiyuAffection - this.state.baochaiAffection) > 15) {
      return GameEnding.MU_SHI_GU_FANG;
    }

    // 4. 宝钗好感度高，且显著领先黛玉，达成“金玉齐眉”
    if (this.state.baochaiAffection > 60 && (this.state.baochaiAffection - this.state.daiyuAffection) > 15) {
      return GameEnding.JIN_YU_QI_MEI;
    }

    // 5. 否则归于“红楼一梦”普通结局
    return GameEnding.HONG_LOU_YI_MENG;
  }
}
