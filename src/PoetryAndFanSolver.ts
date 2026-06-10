export enum FanType {
  WAN_SHAN = '纨扇',
  NI_JIN = '泥金折扇',
  ZHI_SHAN = '纸折扇',
  PU_SHAN = '蒲扇',
}

export interface TearFanResult {
  sound: string;
  joyGained: number;
  outGained: number;
}

export class PoetryAndFanSolver {
  private readonly BURY_FLOWERS_POETRY_LINES = [
    '花谢花飞花满天',
    '红消香断有谁怜',
    '游丝软系飘春榭',
    '落絮轻沾扑绣帘',
  ];

  /**
   * 校验黛玉葬花关卡中《葬花吟》诗句顺序
   * @param lines 玩家排列的诗句数组
   */
  public solveBuryFlowersPoetry(lines: string[]): boolean {
    if (lines.length !== this.BURY_FLOWERS_POETRY_LINES.length) {
      return false;
    }
    return lines.every((line, index) => line.trim() === this.BURY_FLOWERS_POETRY_LINES[index]);
  }

  /**
   * 晴雯撕扇交互逻辑
   * @param fan 递给晴雯的扇子类型
   */
  public tearFan(fan: FanType): TearFanResult {
    switch (fan) {
      case FanType.WAN_SHAN:
        return {
          sound: '嗞啦',
          joyGained: 15,
          outGained: 2,
        };
      case FanType.NI_JIN:
        return {
          sound: '沙沙',
          joyGained: 30,
          outGained: 10, // 挥霍纵容，极大地叛逆世俗礼法
        };
      case FanType.ZHI_SHAN:
        return {
          sound: '啪嚓',
          joyGained: 10,
          outGained: 1,
        };
      case FanType.PU_SHAN:
      default:
        return {
          sound: '撕不动',
          joyGained: -5,
          outGained: 0,
        };
    }
  }
}
