import { describe, it, expect, beforeEach } from 'vitest';
import { PlotStateManager, GameEnding } from './PlotStateManager';

describe('PlotStateManager 核心状态机测试', () => {
  let stateManager: PlotStateManager;

  beforeEach(() => {
    stateManager = new PlotStateManager();
  });

  it('应该能正确初始化默认数值', () => {
    const state = stateManager.getState();
    expect(state.currentChapter).toBe(1);
    expect(state.daiyuAffection).toBe(0);
    expect(state.baochaiAffection).toBe(0);
    expect(state.xiangyunAffection).toBe(0);
    expect(state.worldlyOut).toBe(0);
    expect(state.worldlyIn).toBe(0);
    expect(state.inventory).toEqual([]);
    expect(state.unlockedClues).toEqual([]);

    // 检查个性属性初始化
    expect(state.daiyuMelancholy).toBe(50);
    expect(state.daiyuWit).toBe(50);
    expect(state.baochaiTact).toBe(50);
    expect(state.baochaiEconomic).toBe(50);
    expect(state.qingwenPride).toBe(50);
  });

  it('应该能正确修改好感度并限制在 0 - 100 之间', () => {
    stateManager.changeAffection('daiyu', 50);
    expect(stateManager.getState().daiyuAffection).toBe(50);

    stateManager.changeAffection('daiyu', 80); // 50 + 80 = 130 -> 100
    expect(stateManager.getState().daiyuAffection).toBe(100);

    stateManager.changeAffection('daiyu', -120); // 100 - 120 = -20 -> 0
    expect(stateManager.getState().daiyuAffection).toBe(0);
  });

  it('应该能正确修改和限制个性属性值', () => {
    stateManager.changePersonality('daiyu', 'melancholy', -20);
    expect(stateManager.getState().daiyuMelancholy).toBe(30);

    stateManager.changePersonality('daiyu', 'wit', 40);
    expect(stateManager.getState().daiyuWit).toBe(90);

    stateManager.changePersonality('baochai', 'tact', 60); // 50 + 60 = 110 -> 100
    expect(stateManager.getState().baochaiTact).toBe(100);

    stateManager.changePersonality('qingwen', 'pride', -60); // 50 - 60 = -10 -> 0
    expect(stateManager.getState().qingwenPride).toBe(0);
  });

  it('应该能正确管理背包道具', () => {
    expect(stateManager.hasItem('诗集')).toBe(false);
    
    stateManager.addItem('诗集');
    expect(stateManager.hasItem('诗集')).toBe(true);
    expect(stateManager.getState().inventory).toContain('诗集');

    stateManager.addItem('诗集'); // 重复添加不应导致数组里有重复元素
    expect(stateManager.getState().inventory.filter(x => x === '诗集').length).toBe(1);

    stateManager.removeItem('诗集');
    expect(stateManager.hasItem('诗集')).toBe(false);
  });

  it('应该能正确管理线索', () => {
    expect(stateManager.hasClue('冷香丸配方')).toBe(false);
    
    stateManager.unlockClue('冷香丸配方');
    expect(stateManager.hasClue('冷香丸配方')).toBe(true);
    expect(stateManager.getState().unlockedClues).toContain('冷香丸配方');

    stateManager.unlockClue('冷香丸配方'); // 重复添加不应重复
    expect(stateManager.getState().unlockedClues.filter(x => x === '冷香丸配方').length).toBe(1);
  });

  it('应该能够递增章节', () => {
    stateManager.nextChapter();
    expect(stateManager.getState().currentChapter).toBe(2);
    
    // 限制在最大章节 10 关
    for (let i = 0; i < 15; i++) {
      stateManager.nextChapter();
    }
    expect(stateManager.getState().currentChapter).toBe(10);
  });

  describe('结局计算器测试', () => {
    it('当黛玉羁绊、才情极高且忧郁度低时，应判定为 隐藏完美结局：木石双璧', () => {
      stateManager.changeAffection('daiyu', 80);
      stateManager.changePersonality('daiyu', 'melancholy', -20); // 50 - 20 = 30 <= 35
      stateManager.changePersonality('daiyu', 'wit', 30);        // 50 + 30 = 80 >= 75
      expect(stateManager.calculateEnding()).toBe(GameEnding.MU_SHI_XIAN_WENG);
    });

    it('当出世值较高时，应判定为 梦醒出家 结局', () => {
      stateManager.changeWorldlyValue('out', 70);
      stateManager.changeAffection('daiyu', 90);
      expect(stateManager.calculateEnding()).toBe(GameEnding.MENG_XING_CHU_JIA);
    });

    it('当出世值不高，且黛玉好感度显著高于宝钗时，应判定为 木石孤芳 结局', () => {
      stateManager.changeWorldlyValue('out', 30);
      stateManager.changeAffection('daiyu', 80);
      stateManager.changeAffection('baochai', 40);
      expect(stateManager.calculateEnding()).toBe(GameEnding.MU_SHI_GU_FANG);
    });

    it('当出世值不高，且宝钗好感度显著高于黛玉时，应判定为 金玉齐眉 结局', () => {
      stateManager.changeWorldlyValue('out', 30);
      stateManager.changeAffection('daiyu', 30);
      stateManager.changeAffection('baochai', 80);
      expect(stateManager.calculateEnding()).toBe(GameEnding.JIN_YU_QI_MEI);
    });

    it('当各项数值均处于平衡状态时，应判定为 普通结局：红楼一梦', () => {
      stateManager.changeWorldlyValue('out', 20);
      stateManager.changeAffection('daiyu', 40);
      stateManager.changeAffection('baochai', 45);
      expect(stateManager.calculateEnding()).toBe(GameEnding.HONG_LOU_YI_MENG);
    });
  });
});
