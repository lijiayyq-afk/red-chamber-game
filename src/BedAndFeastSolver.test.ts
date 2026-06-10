import { describe, it, expect, beforeEach } from 'vitest';
import { BedAndFeastSolver } from './BedAndFeastSolver';

describe('BedAndFeastSolver 挨打病榻与刘姥姥酒令解谜测试', () => {
  let solver: BedAndFeastSolver;

  beforeEach(() => {
    solver = new BedAndFeastSolver();
  });

  describe('病榻情感交互联动判定', () => {
    it('当安慰黛玉并表达“为你们死也情愿”时，黛玉好感大幅增加，出世度增加，宝钗好感下降', () => {
      const result = solver.interactOnBed('comfort_daiyu');
      expect(result.daiyuChange).toBe(20);
      expect(result.baochaiChange).toBe(-10);
      expect(result.worldlyOutChange).toBe(15);
      expect(result.worldlyInChange).toBe(0);
    });

    it('当顺从宝钗规劝并称“姐姐说得是”时，宝钗好感度增加，入世度增加，黛玉好感下降', () => {
      const result = solver.interactOnBed('agree_baochai');
      expect(result.daiyuChange).toBe(-15);
      expect(result.baochaiChange).toBe(15);
      expect(result.worldlyOutChange).toBe(0);
      expect(result.worldlyInChange).toBe(15);
    });
  });

  describe('刘姥姥宴席牙牌酒令判定', () => {
    it('当牌名为 左边一个四五成对 时，输入雅俗正解均应判定为正确', () => {
      // 宝玉的雅对
      expect(solver.solveFeastRhyme('左边一个四五成对', '双瞻玉兔升天莹')).toBe(true);
      // 刘姥姥的俗对（带入诙谐剧情）
      expect(solver.solveFeastRhyme('左边一个四五成对', '是个耗子往外蹦')).toBe(true);
      
      // 错误回答
      expect(solver.solveFeastRhyme('左边一个四五成对', '胡说八道')).toBe(false);
    });

    it('当牌名为 中间三四绿配红 时，宝玉正解对答判定', () => {
      expect(solver.solveFeastRhyme('中间三四绿配红', '双管迎春分外红')).toBe(true);
      expect(solver.solveFeastRhyme('中间三四绿配红', '红男绿女配一双')).toBe(false);
    });
  });
});
