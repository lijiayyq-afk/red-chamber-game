import { describe, it, expect, beforeEach } from 'vitest';
import { AvoidanceSolver } from './AvoidanceSolver';

describe('AvoidanceSolver 滴翠亭避嫌解谜测试', () => {
  let solver: AvoidanceSolver;

  beforeEach(() => {
    solver = new AvoidanceSolver();
  });

  describe('声音与风向判定', () => {
    it('在顺风方向，较远距离也应能偷听到谈话', () => {
      // 谈话中心在 (0, 0)，宝钗在 (0, 15)（北面），风向是北风（由北向南吹，即顺风送声到南方，逆风送声到北方）
      // 我们假设风向为 'North' 意味着风由北往南吹，如果宝钗在南边 (0, -15) 属于顺风。
      // 如果宝钗在 (0, 10)，风向为 'South'（风由南往北吹，宝钗在北，属于顺风），应该能听到。
      expect(solver.canHearConversation(0, 10, 0, 0, 'South')).toBe(true);
    });

    it('在逆风方向，超出一定距离后应听不到谈话', () => {
      // 风向为 'North'（由北向南），宝钗在北边 (0, 12)，逆风，听不到
      expect(solver.canHearConversation(0, 12, 0, 0, 'North')).toBe(false);
    });
  });

  describe('被小红/坠儿察觉判定', () => {
    it('距离谈话中心过近（例如距离 < 5），应判定为直接被察觉', () => {
      // 宝钗在 (0, 3) 离 (0, 0) 太近
      expect(solver.isDetected(0, 3, 0, 0)).toBe(true);
    });

    it('保持安全距离（例如距离 >= 5），应判定为未直接被察觉', () => {
      // 宝钗在 (0, 8) 保持了安全距离
      expect(solver.isDetected(0, 8, 0, 0)).toBe(false);
    });
  });

  describe('避嫌话术选择判定', () => {
    it('选择 假装追寻林黛玉（颦儿），应判定为避嫌成功', () => {
      const result = solver.solveEvasionTactics('假装追寻林黛玉（颦儿）');
      expect(result.success).toBe(true);
      expect(result.affectionChange).toBe(10); // 增加宝钗的心智默契值/好感度
    });

    it('选择 其他错误的话术（如直接质问或假装找宝玉），应判定为避嫌失败', () => {
      const result1 = solver.solveEvasionTactics('直接推门质问她们');
      expect(result1.success).toBe(false);
      expect(result1.affectionChange).toBe(-15);

      const result2 = solver.solveEvasionTactics('假装在寻找宝二爷');
      expect(result2.success).toBe(false);
      expect(result2.affectionChange).toBe(-5); // 依然会引起小红的疑心与尴尬
    });
  });
});
