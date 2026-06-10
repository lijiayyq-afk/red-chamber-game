import { describe, it, expect, beforeEach } from 'vitest';
import { PuzzleSolver } from './PuzzleSolver';

describe('PuzzleSolver 古典解谜引擎测试', () => {
  let solver: PuzzleSolver;

  beforeEach(() => {
    solver = new PuzzleSolver();
  });

  describe('金石契合吉谶对齐解谜', () => {
    it('当输入顺序正确的吉谶字词时，应判断为成功', () => {
      // 薛宝钗金锁字样
      const correctLock = ['不离', '不弃', '芳龄', '永继'];
      expect(solver.solveGoldLockPuzzle(correctLock)).toBe(true);

      // 贾宝玉通灵宝玉字样
      const correctJade = ['莫失', '莫忘', '仙寿', '恒昌'];
      expect(solver.solveJadePuzzle(correctJade)).toBe(true);
    });

    it('当输入顺序错误或字词不全时，应判定为失败', () => {
      const wrongLock = ['芳龄', '永继', '不离', '不弃'];
      expect(solver.solveGoldLockPuzzle(wrongLock)).toBe(false);

      const incompleteJade = ['莫失', '莫忘'];
      expect(solver.solveJadePuzzle(incompleteJade)).toBe(false);
    });
  });

  describe('大观园景点题匾对联解谜', () => {
    it('潇湘馆（有凤来仪）题匾判定', () => {
      // 正确答案
      expect(solver.solveCouplet('潇湘馆', '有凤来仪')).toBe(true);
      // 错误答案
      expect(solver.solveCouplet('潇湘馆', '凤来有仪')).toBe(false);
      expect(solver.solveCouplet('潇湘馆', '蘅芷清芬')).toBe(false);
    });

    it('蘅芜苑（蘅芷清芬）题匾判定', () => {
      expect(solver.solveCouplet('蘅芜苑', '蘅芷清芬')).toBe(true);
      expect(solver.solveCouplet('蘅芜苑', '有凤来仪')).toBe(false);
    });

    it('怡红院（红香绿玉 或 怡红快绿）题额判定', () => {
      // 宝玉最初题“红香绿玉”，元妃省亲时改为“怡红快绿”。这里两种都视作对当前景点的合理作答。
      expect(solver.solveCouplet('怡红院', '红香绿玉')).toBe(true);
      expect(solver.solveCouplet('怡红院', '怡红快绿')).toBe(true);
      expect(solver.solveCouplet('怡红院', '万紫千红')).toBe(false);
    });
  });
});
