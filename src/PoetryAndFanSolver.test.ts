import { describe, it, expect, beforeEach } from 'vitest';
import { PoetryAndFanSolver, FanType } from './PoetryAndFanSolver';

describe('PoetryAndFanSolver 葬花与撕扇解谜测试', () => {
  let solver: PoetryAndFanSolver;

  beforeEach(() => {
    solver = new PoetryAndFanSolver();
  });

  describe('葬花吟诗句排序解谜', () => {
    it('当输入完整的葬花吟前四句且顺序正确时，应判定为解谜成功', () => {
      const correctLines = [
        '花谢花飞花满天',
        '红消香断有谁怜',
        '游丝软系飘春榭',
        '落絮轻沾扑绣帘'
      ];
      expect(solver.solveBuryFlowersPoetry(correctLines)).toBe(true);
    });

    it('当输入顺序错误时，应判定为失败', () => {
      const wrongOrder = [
        '红消香断有谁怜',
        '花谢花飞花满天',
        '落絮轻沾扑绣帘',
        '游丝软系飘春榭'
      ];
      expect(solver.solveBuryFlowersPoetry(wrongOrder)).toBe(false);
    });
  });

  describe('晴雯撕扇交互解谜', () => {
    it('当递上 纨扇（丝织）时，撕扇声效应为 嗞啦，且喜悦度增加 15', () => {
      const result = solver.tearFan(FanType.WAN_SHAN);
      expect(result.sound).toBe('嗞啦');
      expect(result.joyGained).toBe(15);
      expect(result.outGained).toBe(2); // 轻微增加看破红尘（纵容下人）
    });

    it('当递上 泥金扇（名贵）时，撕扇声效应为 沙沙，喜悦度增加 30，出世度增加 10', () => {
      const result = solver.tearFan(FanType.NI_JIN);
      expect(result.sound).toBe('沙沙');
      expect(result.joyGained).toBe(30);
      expect(result.outGained).toBe(10); // 纵容撕名贵扇子，看破世俗礼法
    });

    it('当递上 蒲扇（粗劣）时，晴雯应该撕不动，喜悦度不增反减', () => {
      const result = solver.tearFan(FanType.PU_SHAN);
      expect(result.sound).toBe('撕不动');
      expect(result.joyGained).toBe(-5);
      expect(result.outGained).toBe(0);
    });
  });
});
