import { describe, it, expect, beforeEach } from 'vitest';
import { SearchAndHideSolver } from './SearchAndHideSolver';

describe('SearchAndHideSolver 抄检大观园藏匿解谜测试', () => {
  let solver: SearchAndHideSolver;

  beforeEach(() => {
    solver = new SearchAndHideSolver(15); // 限制 15 步行动
  });

  describe('限时步数消耗判定', () => {
    it('每次行动应该消耗 1 步，且未超过上限时提示未超时', () => {
      solver.takeAction();
      solver.takeAction();
      expect(solver.getStepsLeft()).toBe(13);
      expect(solver.isTimeOut()).toBe(false);
    });

    it('当行动步数用尽时，应判断为超时（抄检队伍到达）', () => {
      for (let i = 0; i < 15; i++) {
        solver.takeAction();
      }
      expect(solver.getStepsLeft()).toBe(0);
      expect(solver.isTimeOut()).toBe(true);
    });
  });

  describe('物品藏匿与抄检安全性判定', () => {
    it('私相授受的书信如果藏在妆奁暗格，抄检时应该是安全的', () => {
      solver.hideItem('香囊', '妆奁暗格');
      solver.hideItem('私相授受的书信', '妆奁暗格');
      const raidResult = solver.runRaidAssessment();
      expect(raidResult.safe).toBe(true);
      expect(raidResult.exposedItems).not.toContain('私相授受的书信');
    });

    it('香囊如果放在“随身携带”中，会被凤姐搜身发现，判定为暴露', () => {
      solver.hideItem('香囊', '随身携带');
      const raidResult = solver.runRaidAssessment();
      expect(raidResult.safe).toBe(false);
      expect(raidResult.exposedItems).toContain('香囊');
    });

    it('拥有 火折子 时可以安全销毁 私相授受的书信', () => {
      solver.hideItem('香囊', '妆奁暗格');
      solver.hideItem('私相授受的书信', '烧毁', ['火折子']);
      const raidResult = solver.runRaidAssessment();
      expect(raidResult.safe).toBe(true);
      expect(raidResult.exposedItems).not.toContain('私相授受的书信');
    });

    it('没有 火折子 时试图销毁信件，应判定为失败（无法销毁）', () => {
      // 没有火折子，无法烧毁，物品依然处于暴露或未隐藏状态
      solver.hideItem('私相授受的书信', '烧毁', []); // 空背包
      const raidResult = solver.runRaidAssessment();
      expect(raidResult.safe).toBe(false); // 信件未能成功隐藏
      expect(raidResult.exposedItems).toContain('私相授受的书信');
    });
  });
});
