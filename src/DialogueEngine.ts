import { PlotStateManager } from './PlotStateManager';

export interface DialogueEffect {
  affection?: {
    char: 'daiyu' | 'baochai' | 'xiangyun';
    amount: number;
  };
  worldly?: {
    type: 'in' | 'out';
    amount: number;
  };
  inventory?: {
    action: 'add' | 'remove';
    item: string;
  };
  clue?: {
    clue: string;
  };
  personality?: {
    char: 'daiyu' | 'baochai' | 'qingwen';
    trait: string;
    amount: number;
  };
}


export interface DialogueOption {
  text: string;
  nextNodeId: string;
  effects?: DialogueEffect;
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  options?: DialogueOption[];
  effects?: DialogueEffect; // 进入节点时触发的直接副作用
}

export interface ChapterDialogue {
  startNodeId: string;
  nodes: Record<string, DialogueNode>;
}

export interface DialogueData {
  chapters: Record<number, ChapterDialogue>;
}

export class DialogueEngine {
  private stateManager: PlotStateManager;
  private script: DialogueData;
  private currentChapterId: number | null = null;
  private currentNodeId: string | null = null;

  constructor(stateManager: PlotStateManager, script: DialogueData) {
    this.stateManager = stateManager;
    this.script = script;
  }

  public startChapter(chapterId: number): void {
    const chapter = this.script.chapters[chapterId];
    if (!chapter) {
      throw new Error(`未找到章节 ID: ${chapterId} 的剧本数据。`);
    }
    this.currentChapterId = chapterId;
    this.currentNodeId = chapter.startNodeId;
    
    // 进入起始节点，触发它的副作用（如果有的话）
    this.applyNodeEffects(this.getCurrentNode());
  }

  public getCurrentNode(): DialogueNode | null {
    if (this.currentChapterId === null || this.currentNodeId === null) {
      return null;
    }
    const chapter = this.script.chapters[this.currentChapterId];
    return chapter.nodes[this.currentNodeId] || null;
  }

  public chooseOption(optionIndex: number): void {
    const node = this.getCurrentNode();
    if (!node || !node.options || !node.options[optionIndex]) {
      throw new Error('当前对话节点无效或选择的选项不存在。');
    }

    const option = node.options[optionIndex];
    
    // 1. 触发选项本身的副作用
    if (option.effects) {
      this.applyEffect(option.effects);
    }

    // 2. 跳转到新节点
    this.currentNodeId = option.nextNodeId;

    // 3. 触发进入新节点时的直接副作用
    const newNode = this.getCurrentNode();
    this.applyNodeEffects(newNode);
  }

  public isEnded(): boolean {
    const node = this.getCurrentNode();
    if (!node) return true;
    // 如果节点没有 options，或者 options 数组为空，判定对话结束
    return !node.options || node.options.length === 0;
  }

  private applyNodeEffects(node: DialogueNode | null): void {
    if (node && node.effects) {
      this.applyEffect(node.effects);
    }
  }

  private applyEffect(effect: DialogueEffect): void {
    // 处理好感度副作用
    if (effect.affection) {
      this.stateManager.changeAffection(effect.affection.char, effect.affection.amount);
    }
    // 处理个性心智副作用
    if (effect.personality) {
      this.stateManager.changePersonality(effect.personality.char, effect.personality.trait, effect.personality.amount);
    }
    // 处理出入世值副作用
    if (effect.worldly) {
      this.stateManager.changeWorldlyValue(effect.worldly.type, effect.worldly.amount);
    }
    // 处理背包道具副作用
    if (effect.inventory) {
      if (effect.inventory.action === 'add') {
        this.stateManager.addItem(effect.inventory.item);
      } else if (effect.inventory.action === 'remove') {
        this.stateManager.removeItem(effect.inventory.item);
      }
    }
    // 处理线索副作用
    if (effect.clue) {
      this.stateManager.unlockClue(effect.clue.clue);
    }
  }
}
